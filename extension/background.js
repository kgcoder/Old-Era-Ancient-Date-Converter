/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
   
    const message = request.message
  
   
    if (message === 'updateIcon') {

        getActiveTab((tabId)=> {
            if(tabId)updateIcon(tabId)
        })
        // const tabs = await chrome.tabs.query({ currentWindow: true, active: true })
        // if(tabs && tabs.length && tabs[0].id){
        //     updateIcon(tabs[0].id)
        // }

    }

    //for editor
    if (message === 'giveMeCurrentState') {
        sendMsg('giveMeCurrentState',({isTestingMode, selectionMode}) => {
            sendResponse({isTestingMode, selectionMode})
        })
    } else if (message === 'toggleTestingMode') {
        sendMsg('toggleTestingMode',({isTestingMode}) => {
            sendResponse({isTestingMode})
        })
    } else if (message === 'markerMode' || message === 'bookTitleMode' || message === 'quoteMode') {
        sendMsg(message,({selectionMode}) => {
            sendResponse({selectionMode})
        })
    }

    return true
  
});


chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
    if(!tab.url || !tab.url.includes('wikipedia') || !tab.active || !changeInfo.status || changeInfo.status !== 'complete')return
    updateIcon(tabId)

});


chrome.tabs.onActivated.addListener(async function (activeInfo) {
    
    
    updateIcon(activeInfo.tabId)

});

async function getActiveTab(callback){
    const tabs = await chrome.tabs.query({ currentWindow: true, active: true })
    if(tabs && tabs.length && tabs[0].id){
        callback(tabs[0].id)
    }
    callback(null)
}


function updateIcon(tabId){
    chrome.storage.local.get(['isExtensionOff'], function (result) {
        if (result.isExtensionOff) {
            chrome.action.setIcon({ path: "/images/icon16gray.png" })
        } else {
            chrome.tabs.query({
                active: true,
                lastFocusedWindow: true},
                async function(tabs) {
                const url = tabs && tabs.length ? tabs[0].url : '';
              
                if(!url || !url.includes('wikipedia')){
                    chrome.action.setIcon({ path: "/images/icon16.png" });
                    return
                } 
                chrome.tabs.sendMessage(tabId, 'giveMePageStatus', function (response) {
        
                    if (!response || response.currentVersionSeemsOK) {
                        chrome.action.setIcon({ path: "/images/icon16.png" });
                    } else {
                        chrome.action.setIcon({ path: "/images/icon16alert.png" });
                    }
    
                })

             });

        }
    })
}



chrome.commands.onCommand.addListener(function (command) {
    sendMsg(command)
});




function sendMsg(message,callback = null) {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message,callback)
    })
}

