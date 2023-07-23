/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */


function commitYears() {
    replaceMarkers('bc-y', 'green;color:white')
}

function commitADYears() {
    replaceMarkers('ad-y', 'rosyBrown')
}


function commitDecades() {
    replaceMarkers('bc-d', 'olive')
}


function commitCenturies() {
    replaceMarkers('bc-c', 'orange')
}

function commit00s() {
    replaceMarkers('bc-00s', 'coral')
}

function commitMillennia() {
    replaceMarkers('bc-m', 'darkcyan;color:white')
}

function commit000s() {
    replaceMarkers('bc-000s', 'blueViolet')
}

function commitRemovals() {
    replaceMarkers('bc-r', 'brown;color:white')
}


function commitOE() {
    replaceMarkers('bc-tn', 'aqua')
}

function commitOfOE() {
    replaceMarkers('bc-ot', 'lime')
}

function commitIgnoredPart() {
    replaceMarkers('bc-ig', 'dimgray')
}


function replaceMarkers(className, color) {
    if(shouldReturnBecauseOfTestingMode())return
    
    const chunks = getThreeChunksFromHtml()
    if(!chunks) {
        currentHTML = replaceMarkersInString(currentHTML,className, color)

    }else{
        currentHTML = chunks[0] + replaceMarkersInString(chunks[1],className, color) + chunks[2]
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