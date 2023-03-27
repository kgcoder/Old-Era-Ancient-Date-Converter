//let isTestingMode = false
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



async function sendMsg(message) {
    if (message === 'test') {
        console.log('test clicked')
       // await chrome.runtime.sendMessage('toggleTestingMode',(response) => {
       //     console.log('resonse',response)
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


function updateButtons() {
    buttonIDs.forEach(id => {
        const button = document.getElementById(id)
        if(id === 'loadFromServer' || id === 'loadFromServerOnlyFixed' || id === 'loadFromServerWithoutFixed'){
            button.disabled = isTestingMode || !isServerDataReady
        }else if (id === 'test') {
            button.innerHTML = isTestingMode ? 'Back to editing' : 'Test'
        } else if (id === 'sendToServer') {
            button.disabled = !isTestingMode
        } else if (isTestingMode) {
            button.disabled = true
        } else if (id === 'markerMode' || id === 'bookTitleMode' || id === 'quoteMode') {
            button.disabled = (id === 'markerMode' && selectionMode === 'markerMode') ||
                (id === 'bookTitleMode' && selectionMode === 'bookTitleMode') ||
                (id === 'quoteMode' && selectionMode === 'quoteMode')
        } else {
            button.disabled = false
        }
    })
}