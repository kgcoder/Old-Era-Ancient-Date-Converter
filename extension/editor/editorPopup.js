let isTestingMode = false
let selectionMode = 'markerMode'
let isServerDataReady = false

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
    'findBCsWithoutSpaces',
    'commitYears',
    'commitADYears',
    'commitDecades',
    'commitCenturies',
    'commit00s',
    'commitMillennia',
    'commit000s',
    'commitRemovals',
    'commitOE',
    'commitOfOE',
    'commitIgnoredPart',
    'markerMode',
    'bookTitleMode',
    'quoteMode',
    'test',
    'sendToServer'
]


function addListenersToEditorButtons(){
    buttonIDs.forEach(id => {

        document.getElementById(id).addEventListener('click', () => sendMsg(id), false)
    })
}



function sendMsg(message) {
    if (message === 'test') {
  
        chrome.runtime.sendMessage('toggleTestingMode',(response) => {
            isTestingMode = response.isTestingMode
            updateButtons()
            if (!isTestingMode) message = 'backToEditing'

            chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, message)
            })

        })
        return
    }
    if (message === 'markerMode' || message === 'bookTitleMode' || message === 'quoteMode') {
   
        chrome.runtime.sendMessage(message,(response) => {
            selectionMode = response.selectionMode
            updateButtons()
        })
    }
    console.log('message before sending', message)
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message)
    })
}