/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */


function commitYears() {
    replaceMarkers('year', 'green')
}

function commitADYears() {
    replaceMarkers('ad-y', 'rosyBrown')
}


function commitDecades() {

    replaceMarkers('decade', 'olive')
}


function commitCenturies() {
    replaceMarkers('century', 'orange')
}

function commit00s() {
    replaceMarkers('00s', 'coral')
}

function commitMillennia() {
    replaceMarkers('millennium', 'darkcyan')
}

function commit000s() {
    replaceMarkers('000s', 'blueViolet')
}

function commitRemovals() {
    replaceMarkers('remove', 'brown')
}


function commitOE() {
    replaceMarkers('OE', 'aqua')
}

function commitOfOE() {
    replaceMarkers('ofOE', 'lime')
}

function commitIgnoredPart() {
    replaceMarkers('bc-ig', 'dimgray')
}


function replaceMarkers(className, color) {
    if(shouldReturnBecauseOfTestingMode())return
    currentHTML = currentHTML.replace(/<selection class="marker".*?>(.*?)<\/selection>/gm, (match, inner) => {
        return `<selection class="${className}" data-t="" style="background-color:${color};">${inner}</selection>`
    })
    setBodyFromCurrentHTML()
    addToHistory(currentHTML)

    // addListenersToSelections()


}