/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
let summariesDict = {}
let summaryTextsArray = []
let summaryTextNodesArray = []

const summaryCacheTTL = 24 * 60 * 60 * 1000
loadSummariesFromLocalStorage()




document.addEventListener('DOMNodeInserted', async (details) => {

   

    if(details.target.className && details.target.className.includes("mw-mmv-final-image")) {
        const img = details.target
        replaceSrcInImage(img)
    }

    if (details.target.className && details.target.className.includes("mwe-popups")) {

        chrome.storage.local.get(['isExtensionOff'], function (result) {
        
            isExtensionOff = result.isExtensionOff ? result.isExtensionOff : false
           
            editSummaryIfNeeded(details)
        })
    }




});


async function editSummaryIfNeeded(details){

    if(isExtensionOff)return
   
    const nonBreakableSpace = new RegExp(String.fromCharCode(160),'g')
    const innerHTML = details.target.innerHTML.replace(/<img([^>]*?)>/,'<img$1/>').replace(/&nbsp;/g,' ').replace(nonBreakableSpace,' ')
    const result = innerHTML.match(/mwe-popups-extract.*?href="(.*?)"/)
    const url = result[1]
    const lastComponent = url.split("/").pop()
    const fullUrl = 'https://en.wikipedia.org/wiki/' + lastComponent


    let editsArray = []
    let substituteImageUrl = ''
    // let summary = getSummaryFromLocalDict(fullUrl)
    // if (summary) {
    //     editsArray = summary.summaryEdits
    //     substituteImageUrl = summary.substituteSummaryImageUrl
    // } else {

    //     summary = await getSummaryFromServer(fullUrl)
    //     editsArray = summary.summaryEdits
    //     substituteImageUrl = summary.substituteSummaryImageUrl
    //     editsArray.forEach(edit => {
    //         edit.string = edit.string.replace(/&nbsp;/g,' ').replace(nonBreakableSpace,' ')
    //         edit.target = edit.target.replace(/&nbsp;/g,' ').replace(nonBreakableSpace,' ')
    //     })
    //     addSummaryToLocalArray(fullUrl, summary)
    // }
    
  
    


    const { htmlWithIgParts, ignoredParts } = htmlWithIgnoredParts(innerHTML)

    let replacementsArray = []
    getLocalReplacements(htmlWithIgParts, replacementsArray)

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
    getSummaryTextNodesArray(details.target)

    if(summaryTextsArray.length < summaryTextNodesArray.length){
        summaryTextsArray = [''].concat(summaryTextsArray)
    }

   
    doReplacementsInSummary()

    if(substituteImageUrl){
        const imgs = document.getElementsByClassName('mwe-popups-thumbnail')
        if(imgs){
            const img = imgs[0]
            img.src = substituteImageUrl
        }
    }



}

function loadSummariesFromLocalStorage() {
    chrome.storage.local.get(['summariesDict'], function (result) {
        if (result.summariesDict) {

            const newDict = {}
            const now = new Date()
            for (const [key, value] of Object.entries(result.summariesDict)) {
                if (value.timestamp > now.getTime() - summaryCacheTTL) {
                    newDict[key] = value
                }

            }



            summariesDict = newDict

            chrome.storage.local.set({ summariesDict })
        }

    })
}


function addSummaryToLocalArray(url, summary) {
    const newEntry = { summary, timestamp: (new Date()).getTime() }
    summariesDict[url] = newEntry
    chrome.storage.local.set({ summariesDict })
}


function getSummaryFromLocalDict(url) {
    const entry = summariesDict[url]
    if (!entry) return null
    if (entry.timestamp < (new Date()).getTime() - summaryCacheTTL) {
        summariesDict[url] = undefined
        return null
    }
    return entry.summary
}


async function getSummaryFromServer(url) {
    return new Promise(async (resolve, reject) => {

        const encodedUrl = encodeURIComponent(url)
        fetch(`${baseUrl}/api/summaries/${encodedUrl}`).then(r => r.json()).then(r => {

            resolve(r)

        }).catch(e => reject(e))
    })
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
    const newTextNodesArray = []
    for (let i = 0; i < summaryTextsArray.length; i++) {
        const text = summaryTextsArray[i]
        const nodes = summaryTextNodesArray[i]
        const pair = replaceTextInNodeIfNeeded(nodes, text)
        newTextNodesArray.push(pair)
    }
    summaryTextNodesArray = newTextNodesArray
}