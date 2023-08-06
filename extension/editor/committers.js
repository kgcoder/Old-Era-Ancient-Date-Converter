/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

function commitColor(className,color){
    isEditingWikitext ? addColorToWikitext(color) : replaceMarkers(className, color)
}

function commitYears() {
    commitColor('bc-y', 'green;color:white')
}

function commitADYears() {
    commitColor('ad-y', 'rosyBrown')
}


function commitDecades() {
    commitColor('bc-d', 'olive;color:white')
}


function commitCenturies() {
    commitColor('bc-c', 'orange')
}

function commit00s() {
    commitColor('bc-00s', 'coral')
}

function commitMillennia() {
    commitColor('bc-m', 'darkcyan;color:white')
}

function commit000s() {
    commitColor('bc-000s', 'blueViolet')
}

function commitRemovals() {
    commitColor('bc-r', 'brown;color:white')
}


function commitOE() {
    commitColor('bc-tn', 'aqua')
}

function commitOfOE() {
    commitColor('bc-ot', 'lime')
}

function commitIgnoredPart() {
    commitColor('bc-ig', 'dimgray;color:white')
}


function replaceMarkers(className, color) {
    if(shouldReturnBecauseOfTestingMode())return

    const selection = window.getSelection()
    if(!selection || !selection.rangeCount)return

    closePopupOfClass("editorPopup")
    
    const chunks = getThreeChunksFromHtml()
    if(!chunks) {
        currentHTML = replaceMarkersInString(currentHTML,className, color)

    }else{

        let middle = replaceMarkersInString(chunks[1],className, color)

        if(middle === chunks[1]){
            if(middle.includes('>') || middle.includes('<')){
                //do nothing
            }else{
                middle = `<selection class="${className}" data-t="" style="background-color:${color};">${middle}</selection>`
            }
        }
        
        currentHTML = chunks[0] + middle + chunks[2]

    }

    setBodyFromCurrentHTML()
    addToHistory(currentHTML)

    addListenersToSelections()


}


function replaceMarkersInString(string, className, color){
    return string.replace(/<selection class="marker".*?>(.*?)<\/selection>/gm, (match, inner) => {
        return `<selection class="${className}" data-t="" style="background-color:${color};">${inner}</selection>`
    })
}