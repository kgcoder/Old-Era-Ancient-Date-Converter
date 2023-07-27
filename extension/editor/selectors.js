/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



function selectNumbers(digits) {
    if(shouldReturnBecauseOfTestingMode())return
    splitUpTagsAndTexts()

    const prohibitedWordsAfter = [
        'AD',
        'A\\.D\\.',
        'CE',
        'C\\.E\\.',
        'kg',
        'km',
        'mi',
        'miles',
        'metres',
        'meters',
        'ft',
        'feet',
        'pounds',
        'kilometers',
        'kilometres',
        'infantry',
        'infantrymen',
        'archers', 
        'slingers',
        'cavalry',
        'ships',
        'lions',
        'horses',
        'people',
        'soldiers',
        'citizens',
        'foot soldiers',
        'warships',
        'quinqueremes',
        'legions',
        'men',
        'slaves',
        'horsemen',
        'troops',
        'hoplites',
        'talents',
        'elephants',
        'wounded',
        'casualties',
        'years',
        'days',
        'times',
        'million',
        'billion',
        'january',
        'february',
        'march',
        'april',
        'may',
        'june',
        'july',
        'august',
        'september',
        'october',
        'november',
        'december',
        
    ].join('|')

    const pattern = `(?<!(Fig.|AD|A\\.D\\.|age|aged|page|p\\.|p\\..?\\d{1,4}–|<[^>]*?)(| |\\s|\\&nbsp;|\\&#160;))(\\b([0-9]{${digits}}(?!\\])\\b)(?!((${spacePattern})(${prohibitedWordsAfter})|,\\d{3}))(((<span.*?>)( |\\s|\\&nbsp;|\\&#160;)(</span>)| |\\s|\\&nbsp;|\\&#160;)(b\\.( |\\s|\\&nbsp;|\\&#160;)?c\\.|bc)(e)?)?)`;
    const reg = new RegExp(pattern, "gi");

    markTextsMatchingRegExp(reg, '$3')

}


// function selectNumbersWithBCs() {
//     if(shouldReturnBecauseOfTestingMode())return
//     splitUpTagsAndTexts()

//     const pattern = `(?<!<[^>]*?)(\\b([0-9]{1,4}(?!\\])\\b)(((<span.*?>)( |\\s|\\&nbsp;|\\&#160;)(</span>)| |\\s|\\&nbsp;|\\&#160;)(b\\.( |\\s|\\&nbsp;|\\&#160;)?c\\.|bc)(e)?))`;
//     const reg = new RegExp(pattern, "gi");

//     markTextsMatchingRegExp(reg, '$1')

// }

function findRoundYears() {
    if(shouldReturnBecauseOfTestingMode())return
    const pattern = new RegExp('<selection class="bc-y" data-t="(.*?)" style="background-color:green;color:white;">(\\b\\d+0\\b.*?)</selection>', 'g')
    currentHTML = currentHTML.replace(pattern, (match, fromTemplate, inner) => {
        return `<selection class="bc-i" data-t="${fromTemplate}" style="background-color:pink;">${inner}</selection>`
    })
    setBodyFromCurrentHTML()
    addToHistory(currentHTML)

}


function findDecades() {
    if(shouldReturnBecauseOfTestingMode())return
    splitUpTagsAndTexts()

    const pattern = `(?<!<[^>]*?)(\\b([0-9]+0'?s(?!\\]))\\b)`;
    const reg = new RegExp(pattern, "gi");

    markTextsMatchingRegExp(reg, '$1')
}

function findCenturiesMillennia() {
    if(shouldReturnBecauseOfTestingMode())return
    splitUpTagsAndTexts()
    const pattern = `(?<!<[^>]*?)(\\b((\\d+(st|nd|rd|th)))\\b)(?!(<span.*?>( |\\s|\\&nbsp;|\\&#160;)</span>| |\\s|\\&nbsp;|\\&#160;)(dynasty|year|ed\\.|edition))`;
    const reg = new RegExp(pattern, "gi");
    markTextsMatchingRegExp(reg, '$1')
}



function findNumberWords() {
    if(shouldReturnBecauseOfTestingMode())return
    splitUpTagsAndTexts()
    const pattern = `(?<!<[^>]*?)(\\b(${ordinalNumberWords.join('|')})\\b)`;
    const reg = new RegExp(pattern, "gi");
    markTextsMatchingRegExp(reg, '$1')
}

function markWordCentury() {
    if(shouldReturnBecauseOfTestingMode())return
    splitUpTagsAndTexts()
    const pattern = `(?<!<[^>]*?)(\\b(century|centuries)\\b)`;
    const reg = new RegExp(pattern, "gi");
    markTextsMatchingRegExp(reg, '$1')
}

function markWordMillennium() {
    if(shouldReturnBecauseOfTestingMode())return
    splitUpTagsAndTexts()
    const pattern = `(?<!<[^>]*?)(\\b(millennium|millennia)\\b)`;
    const reg = new RegExp(pattern, "gi");
    markTextsMatchingRegExp(reg, '$1')

}


function findBCs() {
   // enableAllLinks()
    if(shouldReturnBecauseOfTestingMode())return
    splitUpTagsAndTexts()



    const pattern = `(?<!<[^>]*?)((<span class="nowrap">( |\\s|\\&nbsp;|\\&#160;)</span>| |\\s|\\&nbsp;|\\&#160;)(b\\.( |\\s|\\&nbsp;|\\&#160;)?c\\.|bc)(e)?)`//(?!</selection>)`;
    const reg = new RegExp(pattern, "gi");

    markTextsMatchingRegExp(reg, '$1')


}

function findBCsWithoutSpaces() {
    if(shouldReturnBecauseOfTestingMode())return
    splitUpTagsAndTexts()

    const pattern = `(?<!<[^>]*?)((b\\.( |\\s|\\&nbsp;|\\&#160;)?c\\.|bc)(e)?)(?!&amp;oldid)`;
    const reg = new RegExp(pattern, "gi");

    markTextsMatchingRegExp(reg, '$1')
}

function selectRange() {
    if(shouldReturnBecauseOfTestingMode())return
   
    let element = document.createElement("selection")
    element.style.backgroundColor = 'red'
    element.style.color = 'white'
    element.className = 'marker'
    window.getSelection().getRangeAt(0).surroundContents(element)
    currentHTML = new XMLSerializer().serializeToString(document.body)
    currentHTML = removeProblematicPartsFromHtml(currentHTML)

    fixInnerSpans()
    setBodyFromCurrentHTML()
    addToHistory(currentHTML)
}



function clearSelection() {
    if(shouldReturnBecauseOfTestingMode())return

    const chunks = getThreeChunksFromHtml()
    if(!chunks) {
        if (selectionMode === 'markerMode') {
            currentHTML = currentHTML.replace(/<selection class="marker".*?>(.*?)<\/selection>/gm, '$1')
            setBodyFromCurrentHTML()
            addToHistory(currentHTML)
        }
        return
    }


    if (selectionMode === 'markerMode') {
        const pattern = new RegExp('<selection class="bc-i" data-t="(.*?)".*?>(.*?)</selection>', 'g')
        currentHTML = chunks[0] + chunks[1].replace(/<selection class="marker".*?>(.*?)<\/selection>/gm, '$1')
            .replace(pattern, '<selection class="bc-y" data-t="$1" style="background-color:green;color:white;">$2</selection>') + chunks[2]

    } else if (selectionMode === 'bookTitleMode') {
        const pattern = new RegExp(`<selection class="(${allClassesString})" data-t="(.*?)".*?>(.*?)</selection>`, 'g')
        currentHTML = chunks[0] + chunks[1].replace(/<selection class="marker".*?>(.*?)<\/selection>/gm, '$1')
            .replace(pattern, '<selection class="$1" data-t="$2" style="background-color:blue;">$3</selection>') + chunks[2]
    } else if (selectionMode === 'quoteMode') {
        const pattern = new RegExp(`<selection class="(${allClassesString})" data-t="(.*?)".*?>(.*?)</selection>`, 'g')
        currentHTML = chunks[0] + chunks[1].replace(/<selection class="marker".*?>(.*?)<\/selection>/gm, '$1')
            .replace(pattern, '<selection class="$1" data-t="$2" style="background-color:violet;">$3</selection>') + chunks[2]
    }

    setBodyFromCurrentHTML()
    addToHistory(currentHTML)


}


function roundYearsInRange(){
    if(shouldReturnBecauseOfTestingMode())return
    const chunks = getThreeChunksFromHtml()
    if(!chunks) return
    if (selectionMode === 'markerMode') {
        const pattern = new RegExp('<selection class="bc-y" data-t="(.*?)".*?>(.*?)</selection>', 'g')
        currentHTML = chunks[0] + chunks[1].replace(pattern, '<selection class="bc-i" data-t="$1" style="background-color:pink;">$2</selection>') + chunks[2]
    }

    setBodyFromCurrentHTML()
    addToHistory(currentHTML)
}


function deleteInRange() {
    if(shouldReturnBecauseOfTestingMode())return

    if(isEditingWikitext){
        clearSelectionInWikitext()
        return
    }


    const chunks = getThreeChunksFromHtml()
    if(!chunks) return
    const pattern = new RegExp('<selection class=".*?".*?>(.*?)(_substitute_.*?)?</selection>', 'g')
    currentHTML = chunks[0] + chunks[1].replace(pattern, '$1') + chunks[2]

    setBodyFromCurrentHTML()
    addToHistory(currentHTML)
}


function shouldReturnBecauseOfTestingMode() {
    if(isTestingMode){
        alert('Testing mode')
        return true
    }
    return false   
}