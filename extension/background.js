/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
   
    const message = request.message
  
   
    if (message === 'updateIcon') {
        chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
            updateIcon(tabs[0].id)
        })     
    }
  
});


chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if(!tab.url || !tab.url.includes('wikipedia') || !tab.active || !changeInfo.status || changeInfo.status !== 'complete')return
    updateIcon(tabId)

});

// chrome.tabs.onCreated.addListener(function (tab) {

// });

chrome.tabs.onActivated.addListener(function (activeInfo) {
    
    
    updateIcon(activeInfo.tabId)

});


function updateIcon(tabId){
    chrome.storage.local.get(['isExtensionOff'], function (result) {
     
        if (result.isExtensionOff) {
          
            chrome.browserAction.setIcon({ path: "/images/icon16gray.png" })
        } else {
            chrome.tabs.getSelected(null,function(tab) {
                const url = tab ? tab.url : '';
              
                if(!url || !url.includes('wikipedia')){
                    chrome.browserAction.setIcon({ path: "/images/icon16.png" });
                    return
                } 
                chrome.tabs.sendMessage(tabId, 'giveMePageStatus', function (response) {
                  
    
                    if (!response || response.currentVersionSeemsOK) {
                        chrome.browserAction.setIcon({ path: "/images/icon16.png" });
                    } else {
                        chrome.browserAction.setIcon({ path: "/images/icon16alert.png" });
                    }
    
                })

             });

        }
    })
}