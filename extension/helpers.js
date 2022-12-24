/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

function giRegForHtml(pattern) {
    pattern = negativeLookaheadPattern + pattern
    return new RegExp(pattern, "gi");
}


function giRegForText(pattern) {
    return new RegExp(pattern, "gi");
}


function convertTypeFromMakup(typeInMarkup) {
    if (!typeInMarkup) {
            return 'normal'
    } else if (typeInMarkup.includes('t')) {
            return 'bookTitle'
    } else if (typeInMarkup.includes('q')) {
            return'quote'
    }
    return 'normal'
}
 
function numberFromString(string) {
    const newString = string.replace(/[^\d]/g, '')
    return parseInt(newString, 10)
}

function methodForYear(year, pageData) {
    if(year > 10000) return 'bc-ig'
    if (!pageData.isPageAboutEarlyCenturyOrMillennium && year >= 3000 && year % 10 === 0) return'impreciseYear'
    return 'year'
}

function getPageDataForSummary(html){
    const reg = new RegExp(`href="/wiki/(\\d+(st|nd|rd|th))_(millennium|century)_BCE?`,"gi")

    const result = reg.exec(html)
    if(!result){
     return {isPageAboutEarlyCenturyOrMillennium:false }
    }

    const number = parseInt(result[1],10)

    const word = result[3]

    const millennium = word === 'millennium' ? number : 1
    const century = word === 'century' ? number : 1

    const pageData = {isPageAboutEarlyCenturyOrMillennium:millennium >=3 || century >= 30 }
    return pageData
}


function getTextWithoutMarkup(text){
    var pattern = new RegExp('(\\{\\{(.*?)\\|)(.*?)\\|(.*?)\\|(.*?)\\}\\}', 'g');

    var replacements = [];
    while(result = pattern.exec(text)){
        var fullString = result[0];
        var dateString = result[3];
        var index = result.index;
        
        var replacement = {
            index,
            length:fullString.length,
            replacement: dateString
        };
        replacements.push(replacement);
    }
    
    if(!replacements.length)return null;

    var cleanText = '';
    var lastIndex = 0;

    replacements.forEach(function({ index, length, replacement }) {
        cleanText += text.substr(lastIndex, index - lastIndex);
        cleanText += replacement;
        lastIndex = index + length;
    });

    cleanText += text.substr(lastIndex, text.length - lastIndex);
       
    return cleanText;
}



function checkIfSecondYearIsShortened(year1, year2) {
 
    if (year2 < 10 && year1 > 9) {
        const lastDigit = year1 % 10

        if ((lastDigit === 2 && year2 === 1) || (lastDigit === 1 && year2 === 0)) {
            const realYear = year1 - 1
            return { numberOfDigits: 2, realYear }
        }
        if (lastDigit > year2) {
            const realYear = Math.floor(year1 / 10.0) * 10 + year2
            return { numberOfDigits: 1, realYear }
        }
    }

    if (year2 < 100 && year2 > 9 && year1 > 99) {
        const lastTwoDigits = year1 % 100
        if (lastTwoDigits > year2) {
            const realYear = Math.floor(year1 / 100.0) * 100 + year2
            return { numberOfDigits: 2, realYear }  
        }
    }

    return { numberOfDigits: 0, realYear:year2 }
}