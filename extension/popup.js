/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const mediawikiDomain = 'timeline.oldera.org'


let isExtensionOff = false
let isEditingMode = false

let isTestingMode = false

let isEditingWikitext = false


let shouldTranslateYearsPrecisely = false
let shouldTranslateDatesInBookTitles = false
let shouldTranslateDatesInQuotes = false
let shouldNotUseServer = false
let pageHasIssues = false

let allowedSites = []

let isCurrentSiteAllowed = false
let currentDomain = ''

let currentLocation = ''

//let lastOkVersion = ''

const firstYearOfOldEra_default = 10000
const lastTranslatedYearWithLabel_default = 6000
const timelineName_default = "Old Era"
const ofTimeline_default = "of the Old Era"
const abbreviatedTimelineName_default = "OE"

let firstYearOfOldEra = firstYearOfOldEra_default
let lastTranslatedYearWithLabel = lastTranslatedYearWithLabel_default
let timelineName = timelineName_default
let ofTimeline = ofTimeline_default
let abbreviatedTimelineName = abbreviatedTimelineName_default





chrome.runtime.onMessage.addListener(function (message) {
    if(message === 'pageMetadataIsReady'){
        getPageMetadata()
    }
    if(message === 'wikitextEditingPopupClosed'){
        isEditingWikitext = false
        updateButtons()
    }
})




document.addEventListener('DOMContentLoaded', function () {

 
    const startingYearInput = document.getElementById("startingYearInput")
    const lastTranslatedYearWithLabelInput = document.getElementById("lastTranslatedYearWithLabelInput")
    const timelineNameInput = document.getElementById("timelineNameInput")
    const ofTimelineInput = document.getElementById("ofTimelineInput")
    const abbreviatedTimelineNameInput = document.getElementById("abbreviatedTimelineNameInput")
    
    const saveSettingsButton = document.getElementById("saveSettingsButton")
    const cancelSettingsEditButton = document.getElementById("cancelSettingsEditButton")
    const restoreDefaultsButton = document.getElementById("restoreDefaultsButton")


    addListenersToEditorButtons()


    function updateSettingsButtons(){
        const saveSettingsButton = document.getElementById("saveSettingsButton")
    
        saveSettingsButton.className = didAnythingChangeInAdvancedSettings() && !isSomeFieldEmpty() ? "" : "disabledLink"
       
        const cancelSettingsEditButton = document.getElementById("cancelSettingsEditButton")
        cancelSettingsEditButton.className = didAnythingChangeInAdvancedSettings() ? "" : "disabledLink"
    
    
        const restoreDefaultsButton = document.getElementById("restoreDefaultsButton")
        restoreDefaultsButton.className = areAdvancedSettingsDifferentFromDefaults() ? "" : "disabledLink"
        
    
    
    }
    
    function isSomeFieldEmpty(){
        return !startingYearInput.value || 
            !lastTranslatedYearWithLabelInput.value || 
            !timelineNameInput.value ||
            !ofTimelineInput.value ||
            !abbreviatedTimelineNameInput.value
    }
    
    function didAnythingChangeInAdvancedSettings(){
        return startingYearInput.value != firstYearOfOldEra || 
        lastTranslatedYearWithLabelInput.value != lastTranslatedYearWithLabel ||
        timelineNameInput.value != timelineName ||
        ofTimelineInput.value != ofTimeline ||
        abbreviatedTimelineNameInput.value != abbreviatedTimelineName
    }
    
    function areAdvancedSettingsDifferentFromDefaults(){
    
        return firstYearOfOldEra != firstYearOfOldEra_default || 
        lastTranslatedYearWithLabel != lastTranslatedYearWithLabel_default ||
        timelineName != timelineName_default ||
        ofTimeline != ofTimeline_default ||
        abbreviatedTimelineName != abbreviatedTimelineName_default
    
    
    }

    prepareLink("seeSupportedWebsites","openSupportedWebsitesPage")
    prepareLink("aboutLink","openAbout")
    prepareLink("whitePaperLink","openWhitePaper")
    prepareLink("timelineLink","openTimeline")
    prepareLink("seeEdits","openEdits")
  
    function prepareLink(linkId, message){
        const linkNode = document.getElementById(linkId)
        linkNode.addEventListener('click', function () {
            chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, message)
                window.close();
            })
        })
    }


    //input listeners=========

    startingYearInput.addEventListener('input', function () {
        const reg = new RegExp('[^\\d]','g')
        const text = startingYearInput.value
        startingYearInput.value = text.replace(reg,'')
        if(startingYearInput.value == "0")startingYearInput.value = ""

       updateSettingsButtons()

    })

    lastTranslatedYearWithLabelInput.addEventListener('input', function () {
        const reg = new RegExp('[^\\d]','g')
        const text = lastTranslatedYearWithLabelInput.value
        lastTranslatedYearWithLabelInput.value = text.replace(reg,'')
        if(lastTranslatedYearWithLabelInput.value == "0")lastTranslatedYearWithLabelInput.value = ""

        updateSettingsButtons()


    })


    timelineNameInput.addEventListener('input', function () {
       updateSettingsButtons()
    })

    ofTimelineInput.addEventListener('input', function () {
        updateSettingsButtons()
     })

    abbreviatedTimelineNameInput.addEventListener('input', function () {
        updateSettingsButtons()
    })



    //===================


    
    saveSettingsButton.addEventListener('click', function () {
        
        if(isSomeFieldEmpty())return 
        
        firstYearOfOldEra = parseInt(startingYearInput.value,10)
        lastTranslatedYearWithLabel = parseInt(lastTranslatedYearWithLabelInput.value,10)

        timelineName = timelineNameInput.value
        ofTimeline = ofTimelineInput.value
        abbreviatedTimelineName = abbreviatedTimelineNameInput.value


        updateSettingsButtons()
        
        chrome.storage.local.set({ firstYearOfOldEra, lastTranslatedYearWithLabel, timelineName, ofTimeline, abbreviatedTimelineName }, function () {
            sendMessageToPage('advancedSettingsChanged')
        })
    
    })


    cancelSettingsEditButton.addEventListener('click', function () {
        updateInputTexts()
        updateSettingsButtons()
    })



    restoreDefaultsButton.addEventListener('click', function () {
        firstYearOfOldEra = firstYearOfOldEra_default
        lastTranslatedYearWithLabel = lastTranslatedYearWithLabel_default

        timelineName = timelineName_default
        ofTimeline = ofTimeline_default
        abbreviatedTimelineName = abbreviatedTimelineName_default

        updateInputTexts()
        updateSettingsButtons()

        chrome.storage.local.set({ firstYearOfOldEra, lastTranslatedYearWithLabel, timelineName, ofTimeline, abbreviatedTimelineName }, function () {
            sendMessageToPage('advancedSettingsChanged')
        })

    })





    function updateInputTexts(){
        const startingYearInput = document.getElementById("startingYearInput")
        const lastTranslatedYearWithLabelInput = document.getElementById("lastTranslatedYearWithLabelInput")
        const timelineNameInput = document.getElementById("timelineNameInput")
        const ofTimelineInput = document.getElementById("ofTimelineInput")
        const abbreviatedTimelineNameInput = document.getElementById("abbreviatedTimelineNameInput")
        
      
        startingYearInput.value = `${firstYearOfOldEra}`
        lastTranslatedYearWithLabelInput.value = `${lastTranslatedYearWithLabel}`
        timelineNameInput.value = timelineName
        ofTimelineInput.value = ofTimeline
        abbreviatedTimelineNameInput.value = abbreviatedTimelineName



    }



    chrome.storage.local.get(['isExtensionOff','isEditingMode', 'shouldNotUseServer', 'shouldTranslateYearsPrecisely', 'shouldTranslateDatesInBookTitles', 'shouldTranslateDatesInQuotes','sitesData','firstYearOfOldEra','lastTranslatedYearWithLabel','timelineName','ofTimeline','abbreviatedTimelineName','isEditingWikitext'], function (result) {
        
        isExtensionOff = !!result.isExtensionOff
        isEditingMode = !!result.isEditingMode

        isEditingWikitext = !!result.isEditingWikitext

        if(result.firstYearOfOldEra){
            firstYearOfOldEra = result.firstYearOfOldEra
        }

        if(result.lastTranslatedYearWithLabel){
            lastTranslatedYearWithLabel = result.lastTranslatedYearWithLabel
        }

        if(result.timelineName){
            timelineName = result.timelineName
        }
        if(result.ofTimeline){
            ofTimeline = result.ofTimeline
        }
        if(result.abbreviatedTimelineName){
            abbreviatedTimelineName = result.abbreviatedTimelineName
        }
     
        updatePageInfoVisibility(false)

        if(result.sitesData){
            const sitesData = JSON.parse(result.sitesData)
            allowedSites = sitesData.allowedSites
        }


        shouldNotUseServer = !!result.shouldNotUseServer
        document.getElementById('DontUseServerCheckbox').checked = shouldNotUseServer
        

        shouldTranslateYearsPrecisely = !!result.shouldTranslateYearsPrecisely
        document.getElementById('TranslateYearsPreciselyCheckbox').checked = shouldTranslateYearsPrecisely
        
        shouldTranslateDatesInBookTitles = !!result.shouldTranslateDatesInBookTitles
        //document.getElementById('TranslateInBookTitlesCheckbox').checked = shouldTranslateDatesInBookTitles
        
        shouldTranslateDatesInQuotes = !!result.shouldTranslateDatesInQuotes
        //document.getElementById('TranslateInQuotesCheckbox').checked = shouldTranslateDatesInQuotes

        document.getElementById('startingYearInput').value = `${firstYearOfOldEra}`
        document.getElementById('lastTranslatedYearWithLabelInput').value = `${lastTranslatedYearWithLabel}`


        updateInputTexts()
        updateSettingsButtons()
        updateUIInAccordanceWithMode()

        updateButtons()

    })

    document.getElementById('toggleEditingMode').addEventListener('click', () => {
        toggleEditingMode()
    }, false)

    document.getElementById('UseOnThisSiteCheckbox').addEventListener('click', () => {
        toggleWebsiteUsage()
    }, false)

    

    document.getElementById('DontUseServerCheckbox').addEventListener('click', () => {
        toggleUsageOfServer()
    }, false)



    document.getElementById('toggleOnOff').addEventListener('click', () => {
        toggleExtension()
    }, false)

    document.getElementById('TranslateYearsPreciselyCheckbox').addEventListener('click', () => {
        togglePreciseTranslationOfYears()
    }, false)

    // document.getElementById('TranslateInBookTitlesCheckbox').addEventListener('click', () => {
    //     toggleTranslationsInBookTitles()
    // }, false)

    // document.getElementById('TranslateInQuotesCheckbox').addEventListener('click', () => {
    //     toggleTranslationsInQuotes()
    // }, false)


    const advancedSettingsButton = document.getElementById('ShowHideAdvancedSettingsButton')
    advancedSettingsButton.addEventListener('click', () => {
        const div = document.getElementById("AdvancedSettings")
        div.hidden = !div.hidden
        advancedSettingsButton.innerHTML = div.hidden ? "Show" : "Hide"
        
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
        updateUIInAccordanceWithMode()
        return
    }

    
    link1.style = link2.style = link3.style = ""
    
    const { isThisSiteAllowed, domain,  pageStatus } = response
        
    isOnWikipedia = response.isOnWikipedia

    currentLocation = response.currentLocation
    
    isCurrentSiteAllowed = isThisSiteAllowed
    currentDomain = domain

    document.getElementById('UseOnThisSiteCheckbox').checked = isThisSiteAllowed
    document.getElementById('DomainNameLabel').innerText = `Use on this website (${domain})`

    let message = pageStatus
    let messageColor = pageStatus === 'has issues' ||  pageStatus === 'small issues' ? 'red' : 'green'

    
    updatePageStatus(message, messageColor)

    const pageInfo = document.getElementById("pageInfo")
    pageInfo.style.display = pageStatus === 'page not analysed yet' || pageStatus === 'dates were translated automatically' ? 'none' : 'flex'


    updatePageInfoVisibility(!isExtensionOff)
    updateUIInAccordanceWithMode()
    updateButtons()
}



function updatePageStatus(message, color = 'black') {
    const span = document.getElementById('pageStatusLine')
    span.innerHTML = message
    span.style.color = color
}


function toggleExtension() {

    isExtensionOff = !isExtensionOff
    updateUIInAccordanceWithMode()
    chrome.storage.local.set({ isExtensionOff }, function () {
     
        if(isExtensionOff){
            updatePageInfoVisibility(false)
        }
        chrome.runtime.sendMessage({ message: 'updateIcon' });
        sendMessageToPage(isExtensionOff ? 'turnOff' : 'turnOn')

    })

}


function toggleEditingMode() {
    isEditingMode = !isEditingMode
    if(!isEditingMode)isEditingWikitext = false
    chrome.storage.local.set({ isEditingMode, isEditingWikitext }, function () {

        updateUIInAccordanceWithMode()

        sendMessageToPage(isEditingMode ? 'editingModeOn' : 'editingModeOff')

    })
}

function updateUIInAccordanceWithMode(){
    const a = document.getElementById("toggleEditingMode")
    a.innerText = isEditingMode ? "Stop editing" : "Edit"

    const editingButton = document.getElementById("editingModeButton")
    editingButton.style.display = !isExtensionOff && isCurrentSiteAllowed ? 'flex' : 'none'



    const mainMenu = document.getElementById("mainMenu")
    mainMenu.style.display = isEditingMode  && isCurrentSiteAllowed  ? 'none' : 'flex'

    const editingMenu = document.getElementById("editingMenu")
    editingMenu.style.display = isEditingMode && isCurrentSiteAllowed ? 'flex' : 'none'

}




function toggleWebsiteUsage() {
    if(!currentLocation)return
    isCurrentSiteAllowed = !isCurrentSiteAllowed
    if(!isCurrentSiteAllowed){
        allowedSites = allowedSites.filter(site => site !== currentDomain)

    }else{
        allowedSites.push(currentDomain)
    }

    updateUIInAccordanceWithMode()

    chrome.storage.local.set({ ['sitesData']:JSON.stringify({allowedSites}) }).then(() => {
        sendMessageToPage('toggleSiteUsage')
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



function updateLinksSectionVisibility(visible){
    const div = document.getElementById("LinksSection")
    div.style.display = visible ? 'flex' : 'none'
}


