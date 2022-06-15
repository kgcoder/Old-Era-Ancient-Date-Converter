/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

let originalTextsArray = []
let textsArray = []
let textNodesArray = []
let targets = []
let isExtensionOff = false
let shouldNotUseServer = false
let shouldTranslateYearsPrecisely = false
let shouldTranslateDatesInBookTitles = false
let shouldTranslateDatesInQuotes = false
let lastOkVersion = ''
let currentVersion = ''
let translatedForVersion = ''
let numberOfBCsHasChanged = false
let editsCount = 0
let properBCs = 0
let locallyFoundBCs = 0
let isTranslated = false

let isPageCenturyCategory = false
let isPageMillenniumCategory = false


let issuesInCurrentPageExist = false
let numberOfBCsHasChangedInCurrentPage = false

let currentPageData = {
    isPageAboutEarlyCenturyOrMillennium:false,
    doesPageContainCenturiesTemplate:false
}

let currentVersionSeemsOK = true
let isCurrentVersionVerified = false

let allWorkFinishedForPage = false
let pageHasNoBCDates = false
let pageIsNotTranslatedYet = true
let pageNotAnalysedYet = false
let pageId = ''
let requestHasStarted = false
let pageIsLoaded = false




let images = []


let editsArray = []





function getConfigFromLocalStorage(callback){
    chrome.storage.local.get(['isExtensionOff', 'shouldNotUseServer', 'shouldTranslateYearsPrecisely', 'shouldTranslateDatesInBookTitles', 'shouldTranslateDatesInQuotes'], function (result) {
        isExtensionOff = !!result.isExtensionOff
        shouldNotUseServer = !!result.shouldNotUseServer
        shouldTranslateYearsPrecisely = !!result.shouldTranslateYearsPrecisely
        shouldTranslateDatesInBookTitles = !!result.shouldTranslateDatesInBookTitles
        shouldTranslateDatesInQuotes = !!result.shouldTranslateDatesInQuotes
        callback()
    })
}

getConfigFromLocalStorage(function(){
    updateIcon()
    startRequest()
})


chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
   

    if (message === 'turnOff') {
      
        updateTranslation()
        replaceImages(images, true)
    }
    if (message === 'turnOn') {
        
        getConfigFromLocalStorage(function() {
            if (allWorkFinishedForPage) {
                updateTranslation()
                replaceImages(images)
                chrome.runtime.sendMessage('pageMetadataIsReady') //message for the popup script  
            } else if (currentLocation) {
                startRequest()
            }
            
        })

    }

    if (message === 'openEdits') {
        const link = `${frontendBaseUrl}/#/translatedPages/${pageId}/show`
        window.open(link)
    }

    if (message === 'openAbout') {
        const link = 'https://oldera.org'
        window.open(link)
    }

    if (message === 'updateTranslation') {
        updateTranslation()
    }

    if (message === 'toggleServer') {
        toggleServer()
    }
    if (message === 'giveMePageMetadata') {

        sendPageMetadata(sendResponse)
        
    }
    if (message === 'giveMePageStatus') {
    
        sendResponse({
            currentVersionSeemsOK
        })
    }
    if (message === 'openLastOKVersion') {
        const link = `https://en.wikipedia.org/w/index.php?title=${titleInURL}&oldid=${lastOkVersion}`
        window.open(link, "_self")
    }
    if (message === 'openLastVerifiedVersion') {
        const link = `https://en.wikipedia.org/w/index.php?title=${titleInURL}&oldid=${translatedForVersion}`
        window.open(link, "_self")
    }
   
})






prepareLocation()



const initialHTML = new XMLSerializer().serializeToString(document.body)

const fullHTML = new XMLSerializer().serializeToString(document)


function sendPageMetadata(sendResponse) {
    sendResponse({
        lastOkVersion, translatedForVersion,
        currentVersionSeemsOK, isCurrentVersionVerified,
        pageHasNoBCDates, pageIsNotTranslatedYet,
        pageNotAnalysedYet
    })
}



window.onload = () => {

    pageIsLoaded = true

    getConfigFromLocalStorage(() => null)

    if (currentLocation && !isExtensionOff) {
        if (!shouldNotUseServer) {
            startRequest()  
        } else {
            translateEverything(null)
        }
    }

    
}







function getTextsArray(node, isOriginalHTML) {
    if (node.nodeType === 3) {
        isOriginalHTML ?
            originalTextsArray.push(node.data) :
            textsArray.push(node.data)
    }
    if (node = node.firstChild) do {
        getTextsArray(node, isOriginalHTML);
    } while (node = node.nextSibling);
}

function getTextNodesArray(node) {
    if (node.nodeType === 3) { 
        textNodesArray.push({ firstNode: node, lastNode: node })
    }
    if (node = node.firstChild) do {
        getTextNodesArray(node);
    } while (node = node.nextSibling);
}

function getPageVersionFromHtml(html) {
    const pattern = new RegExp('oldid=(\\d+)', 'i')
    const result = pattern.exec(html)
    return result ? result[1] : ''
}

function startRequest() {
    if(!pageIsLoaded || requestHasStarted)return
    requestHasStarted = true
    //getConfigFromLocalStorage(function(){})
    const encodedUrl = encodeURIComponent(currentLocation)
  

    fetch(`${baseUrl}/api/pages/${encodedUrl}`).then(r => {
        console.log('response',r)
        if(r.status !== 200)return {}
        return r.json()
    }).then(r => {

        editsArray = r.edits
        pageHasIssues = r.hasIssues 
        pageId = r.id
        
        isTranslated = r.isTranslated

     
        lastOkVersion = r.lastOkVersion
        numberOfBCsHasChanged = r.numberOfBCsHasChanged || false
        editsCount = r.editsCount || 0
        properBCs = r.properBCs || 0
        translatedForVersion = r.translatedForVersion

        images = r.images


        translateEverything(r)



    }).catch(error => {
        console.log(error)
        translateEverything(null)
    })

}


function translateEverything(r) {
    findIfPageIsMillenniumOrCenturyCategory()
    findIfPageIsAboutEarlyCenturyOrMillennium()
    findIfPageContainsCenturiesTemplate()
    preparePageMetadata(fullHTML)

    
    
    let html = new XMLSerializer().serializeToString(document.body)

    html = html.replace('"=""','') 
    currentVersion = getPageVersionFromHtml(html)

    let htmlWithMarkers

    const { htmlWithIgParts, ignoredParts } = htmlWithIgnoredParts(html)

    let replacementsArray = []
    getLocalReplacements(htmlWithIgParts, replacementsArray, currentPageData)
    replacementsArray = replacementsArray.sort((a, b) => a.index - b.index)
 

    if (isTranslated) {
        const repsFromServer = getReplacementsFromServer(editsArray, htmlWithIgParts)
        replacementsArray = resolveReplacements(replacementsArray, repsFromServer)
    }

    
    replacementsArray = replacementsArray.filter(replacement => replacement.edit.method !== 'bc-ig')
    replacementsArray = replacementsArray.sort((a, b) => a.index - b.index)
    
    editsArray = replacementsArray.map(item => item.edit)
    console.log('htmlWithIgParts',htmlWithIgParts)
    
    htmlWithMarkers = createHTMLWithMarkers(replacementsArray, htmlWithIgParts, ignoredParts)




    if (htmlWithMarkers) {

        console.log('htmlWithMarkers',htmlWithMarkers)

        const parser = new DOMParser();
        const originalBodyDOM = parser.parseFromString(html, "text/xml");
        const bodyDOM = parser.parseFromString(htmlWithMarkers, "text/xml");


        textsArray = []
        getTextsArray(bodyDOM.documentElement, false)

        originalTextsArray = []
        getTextsArray(originalBodyDOM.documentElement, true)

        textNodesArray = []
        getTextNodesArray(document.body)

        // console.log('textsArray',textsArray)
        // console.log('originalTextsArray',originalTextsArray)
        // console.log('textNodesArray',textNodesArray)


        // textsArray.forEach((text,index) => {
        //     if(textNodesArray.length - 1 < index)return
        //     const textInFirstNode = textNodesArray[index].firstNode.data
        //     if(text !== textInFirstNode){
        //         console.log('failed at index:',index)
        //         console.log('text:',text)
        //         console.log('textInFirstNode:',textInFirstNode)

        //     }
        // })

        const textInFirstNode = textNodesArray[1].firstNode.data
  
        if(textNodesArray.length < textsArray.length){
      
            const index = textsArray.findIndex(item => {
                return textInFirstNode === item
            })

           
            if(index > 0){
                textsArray.splice(0, index);
            }
        }

      

        
        doReplacements()
        updateDates()

    }

    replaceImages(images)


    if (r) {
        prepareVersionInfo(r)    
    }

       


    allWorkFinishedForPage = true

    updateIcon()

    updatePageTitle()

    chrome.runtime.sendMessage('pageMetadataIsReady') //message for the popup script
    

}



function resolveReplacements(replacementsArray, repsFromServer) {
    repsFromServer.forEach(repFromServer => {
        const localRepIndex = replacementsArray.findIndex(local => local.index === repFromServer.index)
        if (localRepIndex !== -1) {
            const sameLocalRep = replacementsArray[localRepIndex]
            const serverRepWins = repFromServer.replacement !== sameLocalRep.replacement
            if (serverRepWins) {
                sameLocalRep["duplicate"] = true
            } else {
                repFromServer["duplicate"] = true
            }
        }
    })

    replacementsArray = replacementsArray.concat(repsFromServer)
    replacementsArray = replacementsArray.filter(item => !item.duplicate)
    return replacementsArray   
}



function updateIcon() {
    chrome.runtime.sendMessage({ message: 'updateIcon'})
}


function findIfPageIsMillenniumOrCenturyCategory(){
    const html = document.body.innerHTML
    const reg = new RegExp(`<h1.*>Category:${nakedCenturyPattern}(-|${spacePattern})(millennium|century)( BCE?)?[^<]*?</h1>`)
    const matches = html.match(reg)
    if(matches){
        isPageCenturyCategory = matches[5] === 'century'
        isPageMillenniumCategory = matches[5] === 'millennium'

    }
}


function findIfPageIsAboutEarlyCenturyOrMillennium(){
    const html = document.body.innerHTML
    const reg = new RegExp(`<h1.*>${nakedCenturyPattern} (millennium|century)( BCE?)</h1>`)
    const matches = html.match(reg)
    if(matches){
        console.log('matches',matches)
        const word = matches[4]

        const millennium = word === 'millennium' ? parseInt(matches[2],10) : 1
        const century = word === 'century' ? parseInt(matches[2],10) : 1


        currentPageData.isPageAboutEarlyCenturyOrMillennium = millennium >= 3 || century >= 30
    
        console.log('isPageAboutEarlyCenturyOrMillennium',currentPageData.isPageAboutEarlyCenturyOrMillennium)

    }
}


function findIfPageContainsCenturiesTemplate(){

}

function updatePageTitle() {
    try{
        const html = document.body.innerHTML
        const reg = new RegExp('<h1.*>(.*?)</h1>')
        const fullTitle = html.match(reg)[0]
        const tag = new RegExp('<.*?>','g')
        document.title = fullTitle.replace(tag,'') + ' - Wikipedia'
    }catch(error){
       //do nothing
    }
}


function doReplacements() {
    const newTextNodesArray = []
    targets = []
    for (let i = 0; i < textsArray.length; i++) {
        const text = textsArray[i]
        const nodes = textNodesArray[i]
      
        if(!nodes)continue
        const pair = replaceTextInNodeIfNeeded(nodes, text)

        newTextNodesArray.push(pair)
    }
    textNodesArray = newTextNodesArray

}


function updateDates(){
      const spans = Array.from(document.body.getElementsByClassName('oedatecase'))

      spans.forEach(span => {
        updateDataInSpan(span)
      })





}


function updateDataInSpan(span){
    const originalText = span.getAttribute("o")
    const originalSubstitute = span.getAttribute("s")
    const method = span.getAttribute("m")
    const type = span.getAttribute("t")

    const translations = getReplacementStrings(originalText,originalSubstitute,method)

    if(!translations)return

    const [translated, originalForToast, translatedForToast] = translations

    if(isExtensionOff 
    || (type === 'bookTitle' && !shouldTranslateDatesInBookTitles)
    || (type === 'quote' && !shouldTranslateDatesInQuotes)){

        span.innerHTML = originalText
        span.title = translatedForToast ?? undefined
        
    }else{
        span.innerHTML = translated
        span.title = originalForToast ?? undefined

    }
}



function replaceImages(images, reverse = false) {

    if (!images || images.length === 0) return
    const allImages = document.getElementsByTagName('img')

    for (let image of allImages) {

        replaceSrcInImage(image,reverse)

    }

}



function replaceSrcInImage(image,reverse){
    const index = images.findIndex(imgObj => {
        const originalImageNameFromServer = getImageNameFromUrl(imgObj.originalImageURL)
        const currentImageNameFromSrc = getImageNameFromUrl(image.src)
        return reverse ? image.src === imgObj.substituteImageURL :  originalImageNameFromServer === currentImageNameFromSrc
    })

    if (index === -1) return
    const imgObj = images[index]

    image.crossOrigin = undefined

    image.src = reverse ? imgObj.originalImageURL : imgObj.substituteImageURL
    image.srcset = reverse ? imgObj.originalImageURL : imgObj.substituteImageURL
}


function getImageNameFromUrl(url){
    const chunks = url.split('/')
    const imageName = chunks[chunks.length - 1]
    return imageName.replace(/\d+px-/,'')
}




function replaceTextInNodeIfNeeded(oldNodes, sourceText) {
    
    const occurrences = []
    const pattern = new RegExp('\\{\\{(.*?)\\|(.*?)\\|(.*?)\\|(.*?)\\}\\}', 'g')
    while ((result = pattern.exec(sourceText))) {
        
        const obj = { index: result.index, length: result[0].length, method: result[1], originalText: result[2], type: result[3], originalSubstitute: result[4] }
        occurrences.push(obj)
    }
    if (!occurrences.length) return oldNodes

    const { firstNode: firstOldNode, lastNode: lastOldNode } = oldNodes


    let lastIndex = 0
    let firstNode = undefined

    for (let obj of occurrences) {
        const precedingTextNode = document.createTextNode(
            sourceText.substr(lastIndex, obj.index - lastIndex)
        );

        firstOldNode.parentNode.insertBefore(precedingTextNode, firstOldNode)


        if (!firstNode) {
            firstNode = precedingTextNode
        }

        const replacementNode = getDateCaseNode(obj.originalText, obj.originalSubstitute, obj.method, obj.type)

        if (replacementNode) {
            firstOldNode.parentNode.insertBefore(replacementNode, firstOldNode)

            targets.push(obj.originalText)
        }

        lastIndex = obj.index + obj.length

    }

    const lastNode = document.createTextNode(
        sourceText.substr(lastIndex, sourceText.length - lastIndex)
    );

    firstOldNode.parentNode.insertBefore(lastNode, firstOldNode)

    while (lastNode.nextSibling && lastNode.nextSibling !== lastOldNode) {
        lastNode.parentNode.removeChild(lastNode.nextSibling)
    }

    lastOldNode.parentNode.removeChild(lastOldNode);

    return { firstNode, lastNode }
}



function getDateCaseNode(originalText, originalSubstitute, method, type = 'normal'){
    const span = document.createElement('span')
    span.setAttribute("o",originalText)
    span.setAttribute("s",originalSubstitute)
    span.setAttribute("m",method)
    span.setAttribute("t",type)
    span.className = "rt-commentedText oedatecase"
    const textNode = document.createTextNode(originalText)
    span.appendChild(textNode)
    return span
}


function getReplacementStrings(text, originalSubstitute, method) {
    const originalText = text
    text = text.replace(',','')
   
    const originalNumber = originalSubstitute ? numberFromString(originalSubstitute, 10) : numberFromString(text, 10)
    switch (method) {

        case 'year': {
            const year = originalNumber
            if (isNaN(year)) return null
            const translatedYear = `${10001 - year}`
            const translatedYearString = `${translatedYear}${translatedYear <= 6000 ? '\u00A0OE' : ''}`
            return [translatedYearString, `${year} BC`, translatedYearString]
        }
        case 'impreciseYear': {
            const year = originalNumber
            if (isNaN(year)) return null
            const translatedYear = `${(shouldTranslateYearsPrecisely ? 10001 : 10000) - year}`
            const translatedYearString = `${translatedYear}${translatedYear <= 6000 ? '\u00A0OE' : ''}`  
            
            return [translatedYearString, `${year} BC`, translatedYearString]
            
        }
        case 'oneDigitYear': {
            const year = originalNumber
            if (isNaN(year)) return null
            const translatedYear = 10001 - year
            const translatedYearString = `${translatedYear % 10}`
            return [translatedYearString, `${year} BC`,`${translatedYear}`]
        }
        case 'twoDigitYear': {
            const year = originalNumber
            if (isNaN(year)) return null
            const translatedYear = 10001 - year
            const translatedYearString = `${translatedYear % 100}`
            return [`${translatedYear % 100 < 10 ? '0' : ''}${translatedYearString}`, `${year} BC`, `${translatedYear}`]
        }
            
        case 'bc-i2': {
            const year = originalNumber
            if (isNaN(year)) return null
            const translatedYear = 10000 - year
            const translatedYearString = `${translatedYear % 100}`
            return [`${translatedYear % 100 < 10 ? '0' : ''}${translatedYearString}`, `${year} BC`, `${translatedYear}`]
        }
        case 'decade':
        case 'bc-dp':
        case 'bc-sd': {
            const decadeWord = method === 'bc-sd' ? '' : method === 'bc-dp' ? ' decades' :' decade'
            const decade = originalNumber
            if (isNaN(decade)) return null
            const baseYear = 9990 - decade
            const firstYear = baseYear + 2
            let lastYear = (baseYear + 11)
            if (lastYear === 10001) lastYear = 10000
            const lastYearShort = lastYear % 100
            const translated = `${firstYear}/${lastYearShort < 10 ? lastYear : lastYearShort}${decadeWord}`
            
            return [translated, `${numberFromString(text, 10)}s BC`, translated]
        }

        case 'century': {
            let century = originalNumber
            if (isNaN(century)) {
                century = numbersFromWords[text.toLowerCase()]
            }
            const translatedCentury = 101 - century
            const translatedCenturyWithEnding = `${translatedCentury}${numberSuffix(translatedCentury)}`
            const originalCenturyWithEnding = `${century}${numberSuffix(century)}`

            return [translatedCenturyWithEnding, `${originalCenturyWithEnding} century BC`, `${translatedCenturyWithEnding} century`]
        }

        case '00s': {
            const x00s = originalNumber
            if (isNaN(x00s)) return null
            const translated = `${9900 - x00s}s`
            return [translated, `${numberFromString(text, 10)}s BC`, translated]
        }

        case 'millennium': {
            let millennium = originalNumber
            if (isNaN(millennium)) {
                millennium = numbersFromWords[text.toLowerCase()]
            }
            const translatedMillennium = 11 - millennium
            const translatedMillenniumWithEnding = `${translatedMillennium}${numberSuffix(translatedMillennium)}`
            const originalMillenniumWithEnding = `${millennium}${numberSuffix(millennium)}`
            return [translatedMillenniumWithEnding, `${originalMillenniumWithEnding} millennium BC`, `${translatedMillenniumWithEnding} millennium`]
        }



        case '000s': {
            const x000s = originalNumber
            if (isNaN(x000s)) return null
            const translated = `${9000 - x000s}s`
            return [translated, `${numberFromString(text, 10)}s BC`, translated]
        }

        case 'remove': {
            return ["", "", ""]
        }

        case 'OE': {
            return ["Old Era", "", ""]
        }

        case 'ofOE': {
            return ["of the Old Era", "", ""]
        }
            
        case 'abbreviatedTimeline': {
            return ["OE", "", ""]
        }

        default:
            return [originalText, "", ""]
    }
}



function createMarker(text, method, type = 'normal', originalSubstitute = '') {
    return `{{${method}|${text}|${type}|${originalSubstitute}}}`
}




function numberSuffix(number) {
    if (number > 10 && number < 20) return 'th'
    const lastDigit = number % 10
    if (lastDigit === 1) return 'st'
    if (lastDigit === 2) return 'nd'
    if (lastDigit === 3) return 'rd'
    return 'th'
}

function escapeText(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}