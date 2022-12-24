/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

let summaryTextsArray = []
let summaryTextNodesArray = []

const summaryCacheTTL = 24 * 60 * 60 * 1000


const observer = new MutationObserver(function(mutations) {
     mutations.forEach(function(mutation) {
         if(mutation.addedNodes.length){
             mutation.addedNodes.forEach(node => {
                // console.log('node added',node.className)
                // if(node.className && node.className.includes("loaded-infinite-scroll-container")){
                //     console.log('node contents',node.innerHTML)
                // }
                if(node.className && node.className.includes("mw-mmv-final-image")) {
                    const img = node
                    replaceSrcInImage(img)
                }
                 chrome.storage.local.get(['isExtensionOff'], function (result) {
                    isExtensionOff = result.isExtensionOff ? result.isExtensionOff : false


                    if (node.className && node.className.includes("mwe-popups")) {
                        editSummaryIfNeeded(node);
                    }
                    else if (node.className && node.className.includes("CategoryTreeSection")) {
                        editSummaryIfNeeded(node);
                    }
                    else if(node.className && node.className.includes("cdx-menu-item__text__description")){
                        editSummaryIfNeeded(node.parentElement);
                    }
                    else if (node.className && node.className.includes("mw-ui-icon")) {
                        if(node.parentElement && node.parentElement.className && node.parentElement.className.includes("page-summary")){
                            editSummaryIfNeeded(node.parentElement);
                        }
                    }
                    else if (node.className && node.className.includes("cdx-menu-item")) {
                        editSummaryIfNeeded(node);
                    }
                    else if(node.className && node.className.includes("ra-read-more")){
                        editSummaryIfNeeded(node);
                    }

                 })
              
            })

         }
     
     })
})

observer.observe(document, { childList: true, subtree: true });



async function editSummaryIfNeeded(node){

    if(isExtensionOff)return
   
    const nonBreakableSpace = new RegExp(String.fromCharCode(160),'g')
    const innerHTML = node.innerHTML.replace(/<img([^>]*?)>/,'<img$1/>').replace(/&nbsp;/g,' ').replace(nonBreakableSpace,' ')
 

    let substituteImageUrl = ''
   
    


    const { htmlWithIgParts, ignoredParts } = htmlWithIgnoredParts(innerHTML)

    let replacementsArray = []

    const pageData = getPageDataForSummary(innerHTML)

    getLocalReplacements(htmlWithIgParts, replacementsArray, pageData)

    replacementsArray = replacementsArray.filter(replacement => replacement.edit.method !== 'bc-ig')

    replacementsArray = replacementsArray.sort((a,b) => a.index - b.index)

      
    editsArray = []
 


    const htmlWithMarkers = createHTMLWithMarkers(replacementsArray, htmlWithIgParts, ignoredParts)

         if (!htmlWithMarkers) return


    const parser = new DOMParser();
    const targetDOM = parser.parseFromString(htmlWithMarkers, "text/xml");


    summaryTextsArray = []
    getSummaryTextsArray(targetDOM.documentElement)

    summaryTextNodesArray = []
    getSummaryTextNodesArray(node)

   
    doReplacementsInSummary()
    updateDatesInSummary(node)

    if(substituteImageUrl){
        const imgs = document.getElementsByClassName('mwe-popups-thumbnail')
        if(imgs){
            const img = imgs[0]
            img.src = substituteImageUrl
        }
    }



}



function getSummaryTextsArray(node) {
    if (node.nodeType === 3){
        summaryTextsArray.push(node.data)
    }
    if (node = node.firstChild) do {
        getSummaryTextsArray(node);
    } while (node = node.nextSibling);
}

function getSummaryTextNodesArray(node) {
    if (node.nodeType === 3){
        summaryTextNodesArray.push({ firstNode: node, lastNode: node })
    }
    if (node = node.firstChild) do {
        getSummaryTextNodesArray(node);
    } while (node = node.nextSibling);
}


function doReplacementsInSummary() {
    const reg = new RegExp('\\s|\\&nbsp;|\\&#160;|\\&#8201;','gi')
    const newTextNodesArray = []
    let j = 0
    for (let i = 0; i < summaryTextsArray.length; i++) {
        const text = summaryTextsArray[i]
        let nodes;
        let cleanText = getTextWithoutMarkup(text)?.replace(reg, ' ');
        if(cleanText){
            while(true){
                if(j >= summaryTextNodesArray.length)break;
                nodes = summaryTextNodesArray[j];
                if(!nodes){
                    j++;
                    continue;
                }
                if(!nodes)break;
                var textInNode = nodes.firstNode.data.replace(reg, ' ');
            
                if(cleanText !== textInNode) {
                    j++;
                    continue;
                }else{
                    var pair = replaceTextInNodeIfNeeded(nodes, text);
                    newTextNodesArray.push(pair);
                    break;
                }
            }   
        }
        j++


    }
    summaryTextNodesArray = newTextNodesArray
}

function updateDatesInSummary(node){
    const spans = Array.from(node.getElementsByClassName('oedatecase'))

    spans.forEach(span => {
      updateDataInSpan(span)
    })
}