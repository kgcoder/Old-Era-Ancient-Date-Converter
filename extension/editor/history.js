/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

let browserHistory = []
let currentIndexInHistory = -1


function addToHistory(html) {
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
    console.log('go back', currentIndexInHistory)
    addListenersToSelections()
}

function goForwardInHistory() {
    console.log('forward')
    console.log('history.length', browserHistory.length)
    console.log('index', currentIndexInHistory)
    if (currentIndexInHistory < browserHistory.length - 1) {
        console.log('forward for sure')
        currentIndexInHistory += 1
        currentHTML = browserHistory[currentIndexInHistory]
        setBodyFromCurrentHTML()
    }
    addListenersToSelections()
}



