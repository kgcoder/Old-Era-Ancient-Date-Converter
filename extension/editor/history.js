/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

let browserHistory = []
let currentIndexInHistory = -1


function addToHistory(html) {
    if(isDefaultPopupActive)return
    if (currentIndexInHistory < browserHistory.length - 1) {
        browserHistory = browserHistory.slice(0, currentIndexInHistory + 1)
    }
    browserHistory.push(html)
    currentIndexInHistory = browserHistory.length - 1
    addListenersToSelections()
}

function goBackInHistory() {
    if (currentIndexInHistory > 0) {
        currentIndexInHistory -= 1
        currentHTML = browserHistory[currentIndexInHistory]
        setBodyFromCurrentHTML()
    }
    addListenersToSelections()
}

function goForwardInHistory() {
    if (currentIndexInHistory < browserHistory.length - 1) {
        currentIndexInHistory += 1
        currentHTML = browserHistory[currentIndexInHistory]
        setBodyFromCurrentHTML()
    }
    addListenersToSelections()
}



