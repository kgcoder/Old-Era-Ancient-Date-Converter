/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */


//let isTestingMode = false
let selectionMode = 'markerMode'
let isServerDataReady = false
let isOnWikipedia = false

const buttonIDs = [
    'goBackInHistory',
    'goForwardInHistory',
    'find1DigitNumbers',
    'find2DigitNumbers',
    'find3DigitNumbers',
    'find4DigitNumbers',
    'findRoundYears',
    'findDecades',
    'findCenturiesMillennia',
    'findNumberWords',
    'markWordCentury',
    'markWordMillennium',
    'findBCs',
    // 'findBCsWithoutSpaces',
    'commitYears',
    // 'commitADYears',
    'commitDecades',
    'commitCenturies',
    'commit00s',
    'commitMillennia',
    'commit000s',
    'commitRemovals',
    'commitOE',
    'commitOldEra',
    'commitOfOldEra',
    'commitIgnoredPart',
    // 'markerMode',
    // 'bookTitleMode',
    // 'quoteMode',
    'test',
    'openEditor',
    'startWikitextEditing'
]




function addListenersToEditorButtons(){
    buttonIDs.forEach(id => {
        document.getElementById(id).addEventListener('click', () => sendMsg(id), false)
    })
}




async function sendMsg(message) {
    if (message === 'test') {
       // await chrome.runtime.sendMessage('toggleTestingMode',(response) => {
       //     console.log('response',response)
       //     console.log('error',chrome.runtime.lastError)
            isTestingMode = !isTestingMode
            updateButtons()
            if (!isTestingMode) message = 'backToEditing'

            chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, message)
            })

      //  })
        return
    }
    if(message === 'startWikitextEditing'){
        isEditingWikitext = true
        updateButtons()

        chrome.storage.local.set({ isEditingWikitext }, function () {

        })
    }
    
     chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message)
    })
}


function updateButtons() {
    buttonIDs.forEach(id => {
        const button = document.getElementById(id)
        if(id === 'startWikitextEditing'){
            button.disabled = !isOnWikipedia || isEditingWikitext || isTestingMode
        }else if (id === 'test') {
            button.innerHTML = isTestingMode ? 'Back to editing' : 'Test'
        } else if (isTestingMode) {
            button.disabled = true
        } else {
            button.disabled = false
        }
    })
}