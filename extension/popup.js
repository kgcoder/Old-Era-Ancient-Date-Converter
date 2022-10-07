/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
let isExtensionOff = false

let shouldTranslateYearsPrecisely = false
let shouldTranslateDatesInBookTitles = false
let shouldTranslateDatesInQuotes = false
let shouldNotUseServer = false
let pageHasIssues = false
//let lastOkVersion = ''


chrome.runtime.onMessage.addListener(function (message) {
    if(message === 'pageMetadataIsReady'){
        getPageMetadata()
    }
})


document.addEventListener('DOMContentLoaded', function () {

    const aboutLink = document.getElementById("aboutLink")

    aboutLink.addEventListener('click', function () {
        chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, 'openAbout')
            window.close();

        })
    })

    const whitePaperLink = document.getElementById("whitePaperLink")

    whitePaperLink.addEventListener('click', function () {
        chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, 'openWhitePaper')
            window.close();
        })
    })

    const timelineLink = document.getElementById("timelineLink")

    timelineLink.addEventListener('click', function () {
        chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, 'openTimeline')
            window.close();
        })
    })



    const a1 = document.getElementById("okVersion")

    a1.addEventListener('click', function () {
        chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, 'openLastOKVersion')
            window.close();
        })
    })

    const a2 = document.getElementById("verifiedVersion")

    a2.addEventListener('click', function () {
        chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, 'openLastVerifiedVersion')
            window.close();

        })
    })

    const editsLink = document.getElementById("seeEdits")

    editsLink.addEventListener('click', function () {
        chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, 'openEdits')
            window.close();

        })
    })

    chrome.storage.local.get(['isExtensionOff', 'shouldNotUseServer', 'shouldTranslateYearsPrecisely', 'shouldTranslateDatesInBookTitles', 'shouldTranslateDatesInQuotes'], function (result) {
        
        isExtensionOff = !!result.isExtensionOff
     
        updatePageInfoVisibility(!isExtensionOff)

        shouldNotUseServer = !!result.shouldNotUseServer
        document.getElementById('DontUseServerCheckbox').checked = shouldNotUseServer
        

        shouldTranslateYearsPrecisely = !!result.shouldTranslateYearsPrecisely
        document.getElementById('TranslateYearsPreciselyCheckbox').checked = shouldTranslateYearsPrecisely
        
        shouldTranslateDatesInBookTitles = !!result.shouldTranslateDatesInBookTitles
        document.getElementById('TranslateInBookTitlesCheckbox').checked = shouldTranslateDatesInBookTitles
        
        shouldTranslateDatesInQuotes = !!result.shouldTranslateDatesInQuotes
        document.getElementById('TranslateInQuotesCheckbox').checked = shouldTranslateDatesInQuotes
    })

    document.getElementById('DontUseServerCheckbox').addEventListener('click', () => {
        toggleUsageOfServer()
    }, false)


    document.getElementById('toggleOnOff').addEventListener('click', () => {
        toggleExtension()
    }, false)

    document.getElementById('TranslateYearsPreciselyCheckbox').addEventListener('click', () => {
        togglePreciseTranslationOfYears()
    }, false)

    document.getElementById('TranslateInBookTitlesCheckbox').addEventListener('click', () => {
        toggleTranslationsInBookTitles()
    }, false)

    document.getElementById('TranslateInQuotesCheckbox').addEventListener('click', () => {
        toggleTranslationsInQuotes()
    }, false)

    getPageMetadata()


}, false)


function getPageMetadata() {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {

        chrome.tabs.sendMessage(tabs[0].id, 'giveMePageMetadata', function (response, error) {
         
            updatePageMetadata(response)

        })
    })
}


function updatePageMetadata(response){
    const link1 = document.getElementById("aboutLink")
    const link2 = document.getElementById("whitePaperLink")
    const link3 = document.getElementById("timelineLink")
    if (!response) {
        updatePageStatus('Wrong site, page doesn\'t exist in the database, or page update is needed')
        link1.style = link2.style = link3.style = "pointer-events: none; color:lightgray"
        return
    }

    link1.style = link2.style = link3.style = ""

    const { lastOkVersion, translatedForVersion,
        currentVersionSeemsOK, isCurrentVersionVerified,
        pageHasNoBCDates, pageIsNotTranslatedYet, pageNotAnalysedYet } = response

    let message = currentVersionSeemsOK ? 'seems OK' : 'may have issues'
    if (currentVersionSeemsOK && isCurrentVersionVerified) message = 'is OK'
    if (pageIsNotTranslatedYet) message = 'dates were translated automatically'
    if (pageNotAnalysedYet) message = 'page hasn\'t been analyzed yet'
    if (pageHasNoBCDates) message = 'page doesn\'t have BC dates'
    let messageColor = currentVersionSeemsOK ? 'green' : 'red'
    if (pageHasNoBCDates || pageNotAnalysedYet || pageNotAnalysedYet) messageColor = 'black'
    updatePageStatus(message, messageColor)

    const title = document.getElementById("otherVersions")
    title.style.display = !pageIsNotTranslatedYet && (lastOkVersion || translatedForVersion) ? 'flex' : 'none'

    const a1 = document.getElementById("okVersion")
    a1.style.display = !pageIsNotTranslatedYet && lastOkVersion ? 'flex' : 'none'


    const a2 = document.getElementById("verifiedVersion")
    a2.style.display = !pageIsNotTranslatedYet && translatedForVersion ? 'flex' : 'none'

    const pageInfo = document.getElementById("pageInfo")
    pageInfo.style.display = pageIsNotTranslatedYet ? 'none' : 'flex'

    updatePageInfoVisibility(!isExtensionOff)
}



function updatePageStatus(message, color = 'black') {
    const span = document.getElementById('pageStatusLine')
    span.innerHTML = message
    span.style.color = color
}


function toggleExtension() {

    isExtensionOff = !isExtensionOff
    chrome.storage.local.set({ isExtensionOff }, function () {
     
        if(isExtensionOff)updatePageInfoVisibility(false)
        chrome.runtime.sendMessage({ message: 'updateIcon' });
        sendMessageToPage(isExtensionOff ? 'turnOff' : 'turnOn')

    })

}

function toggleUsageOfServer() {
    shouldNotUseServer = !shouldNotUseServer
    chrome.storage.local.set({ shouldNotUseServer })
    sendMessageToPage('toggleServer')
}

function togglePreciseTranslationOfYears() {
    shouldTranslateYearsPrecisely = !shouldTranslateYearsPrecisely
    chrome.storage.local.set({ shouldTranslateYearsPrecisely }, function(){
        sendMessageToPage('updateTranslation')

    })
    
}


function toggleTranslationsInBookTitles() {
    shouldTranslateDatesInBookTitles = !shouldTranslateDatesInBookTitles
    chrome.storage.local.set({ shouldTranslateDatesInBookTitles })

    sendMessageToPage('updateTranslation')
}

function toggleTranslationsInQuotes() {
    shouldTranslateDatesInQuotes = !shouldTranslateDatesInQuotes
    chrome.storage.local.set({ shouldTranslateDatesInQuotes })

    sendMessageToPage('updateTranslation')
}


function sendMessageToPage(message) {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message)
    })
}


function updatePageInfoVisibility(visible){
    const currentPageInfoDiv = document.getElementById("currentPageInfo")
    currentPageInfoDiv.style.display = visible ? 'flex' : 'none'
}