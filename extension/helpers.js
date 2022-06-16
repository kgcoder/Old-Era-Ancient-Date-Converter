/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

function giReg(pattern) {
    pattern = negativeLookaheadPattern + pattern
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