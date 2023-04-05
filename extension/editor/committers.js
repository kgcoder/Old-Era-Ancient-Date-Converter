/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */


function commitYears() {
    replaceMarkers('bc-y', 'green')
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
    replaceMarkers('bc-m', 'darkcyan')
}

function commit000s() {
    replaceMarkers('bc-000s', 'blueViolet')
}

function commitRemovals() {
    replaceMarkers('bc-r', 'brown')
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
    currentHTML = currentHTML.replace(/<selection class="marker".*?>(.*?)<\/selection>/gm, (match, inner) => {
        return `<selection class="${className}" data-t="" style="background-color:${color};">${inner}</selection>`
    })
    setBodyFromCurrentHTML()
    addToHistory(currentHTML)

    addListenersToSelections()


}