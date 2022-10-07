/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
   
    const message = request.message
  
   
    if (message === 'updateIcon') {
        const tabs = await chrome.tabs.query({ currentWindow: true, active: true })
        updateIcon(tabs[0].id)
    }
  
});


chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
    if(!tab.url || !tab.url.includes('wikipedia') || !tab.active || !changeInfo.status || changeInfo.status !== 'complete')return
    updateIcon(tabId)

});


chrome.tabs.onActivated.addListener(async function (activeInfo) {
    
    
    updateIcon(activeInfo.tabId)

});


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