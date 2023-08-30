/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//let originalTextsArray = []
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
let isPageDecadeCategory = false


let issuesInCurrentPageExist = false
let numberOfBCsHasChangedInCurrentPage = false

let shouldUseDotNotation = false

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
let sitesSupportedByBackend = []
let allowedSites = []

let dontShowPopupAgain = false

let isThisSiteAllowed = false

let images = []


let editsArray = []
let domain = ''


let isEditingMode = false

let pageNotFoundOnServer = false


let editsLoadedFromServer = []

let replacementsLoadedFromServer = []

let pageStatus = 'page not analysed yet'



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

if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", onContentLoad);
}else(
    onContentLoad()
)


chrome.storage.local.set({isEditingWikitext:false})

function getConfigFromLocalStorage(callback){
        chrome.storage.local.get(['isExtensionOff', 'isEditingMode', 'shouldNotUseServer', 
        'shouldTranslateYearsPrecisely', 'shouldTranslateDatesInBookTitles', 
        'shouldTranslateDatesInQuotes','sitesData',
        'firstYearOfOldEra','lastTranslatedYearWithLabel',
        'timelineName','ofTimeline','abbreviatedTimelineName','dontShowPopupAgain','templatesToLoadAtStartup'], function (result) {
        isExtensionOff = !!result.isExtensionOff
        isEditingMode = !!result.isEditingMode
        shouldNotUseServer = !!result.shouldNotUseServer
        shouldTranslateYearsPrecisely = !!result.shouldTranslateYearsPrecisely
        shouldTranslateDatesInBookTitles = !!result.shouldTranslateDatesInBookTitles
        shouldTranslateDatesInQuotes = !!result.shouldTranslateDatesInQuotes
        dontShowPopupAgain = !!result.dontShowPopupAgain

        const templateNamesString = result.templatesToLoadAtStartup


        if(templateNamesString){
            const lines = templateNamesString.split('\n')
            templatesToLoadAtStartup = lines.filter(line => line.includes('Template:'))
        }
        chrome.storage.local.set({templatesToLoadAtStartup:""})


        
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

        if(result.sitesData){
            const sitesData = JSON.parse(result.sitesData)
            allowedSites = sitesData.allowedSites
        }else{
            allowedSites = ['en.wikipedia.org']
            chrome.storage.local.set({ ['sitesData']: JSON.stringify({allowedSites}) }).then(() => {
               // console.log("Value is set");
            });
        }

        callback()
    })
}


chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
   
    if(message === 'toggleOnOff'){
        isExtensionOff = !isExtensionOff
        chrome.storage.local.set({ isExtensionOff }, function () {
            if(isExtensionOff){
                turnOff()
            }else{
                turnOn()
            }
        })
    }
    if(message === "toggleEditingMode"){
        isEditingMode = !isEditingMode
        chrome.storage.local.set({ isEditingMode }, function () {
            window.location.reload()
         })
    }
    if (message === 'turnOff') {
        turnOff() 
    }

    if (message === 'turnOn') {
        turnOn()
    }

    if(message === 'togglePageInfo'){
        togglePageInfoPopup()
        
    }

    if (message === 'openEdits') {

        if(!pageNotFoundOnServer){
            showPageInfoPopup()
            return
        }

    }

    if (message === 'openAbout') {
        const link = 'https://oldera.org'
        window.open(link)
    }

    if (message === 'openWhitePaper') {
        const link = 'https://github.com/kgcoder/Detectable-BC-dates/blob/main/detectable-bc-dates.pdf'
        window.open(link)
    }

    if (message === 'openTimeline') {
        const link = 'https://timeline.oldera.org/timeline/'
        window.open(link)
    }

    if(message === 'openSupportedWebsitesPage'){
        const link = `https://${mediawikiDomain}/wiki/index.php/Dates/SupportedWebsites`
        window.open(link)
    }

    if(message === 'advancedSettingsChanged'){

        updateTranslation()
    }

    
    

    if (message === 'updateTranslation') {
        updateTranslation()
    }

    if(message === 'clearCache') {
        clearCache()
    }
            
    if (message === 'toggleServer') {
        window.location.reload()
    }

    if(message === 'editingModeOn'){
        window.location.reload()
    }

    if(message === 'editingModeOff'){
        window.location.reload()
    }

    if(message === 'toggleSiteUsage'){
        window.location.reload()
    }
    if (message === 'giveMePageMetadata') {
        sendPageMetadata(sendResponse)  
    }
    if (message === 'giveMePageStatus') {
    
        sendResponse({
            currentVersionSeemsOK,
            pageStatus
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

    return true
   
})





prepareLocation()



const initialHTML = new XMLSerializer().serializeToString(document.body)

const fullHTML = new XMLSerializer().serializeToString(document)


function sendPageMetadata(sendResponse) {
    sendResponse({
        lastOkVersion, translatedForVersion,
        currentVersionSeemsOK, isCurrentVersionVerified,
        pageHasNoBCDates, pageIsNotTranslatedYet,
        isThisSiteAllowed,
        domain,
        isOnWikipedia,
        pageStatus,
        pageNotFoundOnServer,
        currentLocation
    })
}





 async function onContentLoad() {
    if(!isOnWikipedia){
        await prepareListOfWebsitesSupportedByBackend()
    }

    pageIsLoaded = true

    getConfigFromLocalStorage(function(){
        updateIcon()

        if(isOnMediaWikiCategoryPage){
            addLinksToCategoryMembersOnServer()
        }

        if(isOnMediaWikiDataPage){
            addLinkToTitleOnMediaWikiPage()
        }

        if(isOnSupportedWebsitesPage){
            addLinksToSupportedWebsitesPage()
        }

        if(currentLocation){
            const index = allowedSites.findIndex(site => domain === site)
            isThisSiteAllowed = index !== -1
        }else{
            isThisSiteAllowed = false
            
           

        }
        
        if(!isThisSiteAllowed){
            chrome.runtime.sendMessage('pageMetadataIsReady') //message for the popup script
            return
        }

       



        navigator.permissions.query({ name: "clipboard-write" }).then((result) => {
            if (result.state == "granted" || result.state == "prompt") {
              //console.log("Write access granted!");
            }
        });
    
        if (!isExtensionOff  && currentLocation && !isOnMediaWikiCategoryPage) {
            if(!shouldNotUseServer && (sitesSupportedByBackend.includes(domain) || domain === 'en.wikipedia.org') ){
                isEditingMode ? startWebRequestForEditor() :  startWebRequest()
            } else {
                if(isEditingMode){
                    editsArray = []
                    onEditorLoad()
                }else{
                    translateEverythingOnWeb(null) 
                }
            }
        }
    
    

      
    })


    
}







function getTextsArray(node) {
    if (node.nodeType === 3) {
      //  isOriginalHTML ?
           // originalTextsArray.push(node.data) :
            textsArray.push(node.data)
    }
    if (node = node.firstChild) do {
        getTextsArray(node);
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




async function requestListOfWebsites() {

    const url = getWikitextUrlOnMyServer('SupportedWebsites')

    return new Promise(async (resolve,reject) => {
        try{
    
            const r = await fetch(url)
            const json = r.status !== 200 ? {} : await r.json()
        
            const wikitext = json.parse.wikitext
            if (!wikitext) {
                return reject()
            }
    
            resolve(wikitext)
           
        }catch(e){
            console.log(e)
        }

    })
  

}


async function startWebRequest() {
    if(!pageIsLoaded || requestHasStarted)return
    requestHasStarted = true

    const url = getWikitextUrlOnMyServer()
      
    try{

        const r = await fetch(url)
        const json = r.status !== 200 ? {} : await r.json()
        
        if(json.error){
            if(json.error.code === "missingtitle"){
                pageNotFoundOnServer = true   
            }
            translateEverythingOnWeb(null)
            return 
        }
        
        const wikitext = json.parse.wikitext
        if (!wikitext) {
            translateEverythingOnWeb(null)
            return 
        }


        currentPageDataFormatVersion = getDataFormatVersionFromDataPage(wikitext)
        
        const lines = wikitext.split('\n')
        
        editsArray = getEditsFromLines(lines)
        
       
        await getTemplatesInfoFromServer(editsArray)
       

        editsLoadedFromServer = editsArray

        



        try{
            if(!isEditingMode){
                translateEverythingOnWeb(null,editsArray)
            }

        }catch(e){
            console.log(e)

        }
        
    }catch(e){
        console.log(e)
        translateEverythingOnWeb(null)
    }

}




async function startWebRequestForEditor(){

    if(!pageIsLoaded || requestHasStarted)return
    requestHasStarted = true


    if(templatesToLoadAtStartup.length){
        const templates = templatesToLoadAtStartup.map(template => ({isTemplate:true,name:template}))
        await getTemplatesInfoFromServer(templates)
        preloadedTemplates = templates
    }

    const url = getWikitextUrlOnMyServer()
    
    try{
        const r = await fetch(url)
        const json = r.status !== 200 ? {} : await r.json()

        if(json.error){
             if(json.error.code === "missingtitle"){
                 pageNotFoundOnServer = true
             }

            editsArray = []
            if(isEditingMode){
                onEditorLoad()
            }
            return
        }

        const wikitext = json.parse.wikitext
        if (!wikitext) {
            editsArray = []
            if(isEditingMode){
                onEditorLoad()
            }
            return
        }

        currentPageDataFormatVersion = getDataFormatVersionFromDataPage(wikitext)

        const lines = wikitext.split('\n')

        editsArray = lines.map(line => getEditFromLine(line)).filter(obj => obj !== null).map(edit => convertMethodNameLongToShort(edit))
       
        await getTemplatesInfoFromServer(editsArray)

        


        editsLoadedFromServer = JSON.parse(JSON.stringify(editsArray))

        try{
            if(isEditingMode){
                onEditorLoad()
            }

        }catch(e){
            console.log(e)

        }
    }catch(e){
        console.log(e)
         editsArray = []
         if(isEditingMode){
            onEditorLoad()
        }
    }

 
}





function translateEverythingOnWeb(r,finalInstructions = []) {
    findIfPageIsMillenniumOrCenturyCategory()
    findIfPageIsDecadeCategory()
    findIfPageIsAboutEarlyCenturyOrMillennium()
    findIfPageContainsCenturiesTemplate()
  
    
    let html = new XMLSerializer().serializeToString(document.body)

    let htmlWithMarkers

    const { htmlWithIgParts, ignoredParts } = htmlWithIgnoredParts(html)

    const {text, insertions} = extractTextFromHtml(htmlWithIgParts, currentPageDataFormatVersion >= 2)

    let replacementsArray = []
    getLocalReplacements(htmlWithIgParts, text, insertions, replacementsArray, currentPageData)
    replacementsArray = replacementsArray.sort((a, b) => a.index - b.index)
 
    if (finalInstructions.length) {
        const allEdits = finalInstructions.length ? finalInstructions : editsArray

        let {repsFromServer, badReplacements} = prepareServerReplacements(allEdits,text)


        replacementsLoadedFromServer = repsFromServer

        flattenedListOfEdits = flattenListOfEdits(editsLoadedFromServer)

        pageIsNotTranslatedYet = repsFromServer.length == 0

        const rawRepsInHtmlArray = []


        moveReplacementsFromTextToHtml(text,htmlWithIgParts,JSON.parse(JSON.stringify(repsFromServer)), rawRepsInHtmlArray, insertions)

        const normalReplacementsInHtmlFromServer = mergeReplacements(rawRepsInHtmlArray)

        replacementsArray = resolveReplacements(replacementsArray, normalReplacementsInHtmlFromServer)


    }

    
    replacementsArray = replacementsArray.filter(replacement => replacement.edit.method !== 'bc-ig')
    replacementsArray = replacementsArray.sort((a, b) => a.index - b.index)

    
    editsArray = replacementsArray.map(item => item.edit)

    
    htmlWithMarkers = createHTMLWithMarkers(replacementsArray, htmlWithIgParts, ignoredParts)


    if (htmlWithMarkers) {

        const parser = new DOMParser();
        //const originalBodyDOM = parser.parseFromString(html, "text/xml");
        const cleanHtml = removeAttributesFromTags(htmlWithMarkers)
        const bodyDOM = parser.parseFromString(cleanHtml, "text/xml");


        textsArray = []
        getTextsArray(bodyDOM.documentElement)

   
        textNodesArray = []
        getTextNodesArray(document.body)

  

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

    replaceImagesOnWeb()





       


    allWorkFinishedForPage = true


    updatePageStatus()

    updateIcon()

    updatePageTitle()

    chrome.runtime.sendMessage('pageMetadataIsReady') //message for the popup script
    

}


function updatePageStatus(){
    let hasSmallIssues = false
    let hasIssues = false
    for (let edit of flattenedListOfEdits){
        if(edit.isSus)hasSmallIssues = true
        if(edit.notFound){
            hasIssues = true
            break
        }
    }


    if(pageNotFoundOnServer){
        pageStatus = 'page not analysed yet'
    }else if(!flattenedListOfEdits.length){
        pageStatus = 'dates were translated automatically'
    }else{
        pageStatus = hasIssues ? "has issues" : (hasSmallIssues ? "small issues" : "seems OK")
    }




}


function resolveReplacements(replacementsArray, repsFromServer) {

    repsFromServer.forEach(repFromServer => {
        const duplicates = replacementsArray.filter(local =>{ 

            const localStart = local.index
            const localEnd = local.index + local.length

            const remoteStart = repFromServer.index
            const remoteEnd = repFromServer.index + repFromServer.length

            // console.log('!!!')
            // console.log('remote rep',repFromServer)
            // console.log('local',local)
                
            

            return (localStart <= remoteStart && localEnd >= remoteEnd) ||
            (localStart >= remoteStart && localStart <= remoteEnd) ||
            (localEnd >= remoteStart && localEnd <= remoteEnd)        
        })

        duplicates.forEach(sameLocalRep => {
            const serverRepWins = repFromServer.replacement !== sameLocalRep.replacement
            if (serverRepWins) {
                sameLocalRep["duplicate"] = true

                const serverMethod = repFromServer.edit.method

                
                const isServerMethodAYearMethod = serverMethod === 'bc-y' || serverMethod === 'bc-i'
                if(isServerMethodAYearMethod){
                    const localMethod = sameLocalRep.edit.method
                    let properMethod = serverMethod
                    if(!isEditingMode && localMethod === 'bc-y-r1' || localMethod === 'bc-y-r2' || localMethod === 'bc-i-r1' || localMethod === 'bc-i-r2'){
                        properMethod = localMethod
                    }
                    if((!isEditingMode || isTestingMode) && serverMethod === 'bc-i' ){
                        if(localMethod === 'bc-y-r1')properMethod = 'bc-i-r1'
                        if(localMethod === 'bc-y-r2')properMethod = 'bc-i-r2'
                    }
                 

                    const edit = repFromServer.edit
                    edit["method"] = properMethod

                    const {
                        target,
                        originalSubstitute,
                        type,
                        fromTemplate
                    } = edit
                    repFromServer["edit"] = edit
                    repFromServer["replacement"] = isEditingMode ?
                    createMarkerForEditor(target, properMethod, type, originalSubstitute,fromTemplate) :
                    createMarker(target,properMethod,type,originalSubstitute)
                }
         

            } else {
                repFromServer["duplicate"] = true
            }
        })
    
    })

    replacementsArray = replacementsArray.concat(repsFromServer)

    replacementsArray = replacementsArray.filter(item => !item.duplicate)

    return replacementsArray   
}



function updateIcon() {
    chrome.runtime.sendMessage({ message: 'updateIcon'})
}



function getPageTitle(){
    const h1 = document.getElementsByTagName('h1')
    if(!h1 || !h1[0])return ""
    const title = h1[0].innerText
    if(title)return title
    return ""
}

function findIfPageIsMillenniumOrCenturyCategory(){

    const title = getPageTitle()

    const reg = new RegExp(`^Category:${nakedCenturyPattern}(-|${spacePattern})(millennium|century)( BCE?)?.*?$`)
    const matches = title.match(reg)
    if(matches){
        isPageCenturyCategory = matches[5] === "century"
        isPageMillenniumCategory = matches[5] === "millennium"
    }
}

function findIfPageIsDecadeCategory(){
    const title = getPageTitle()

    const reg = new RegExp(`^Category:${nakedDecadePattern}( BCE?)?.*?$`)
    const matches = title.match(reg)
    if(matches){
       isPageDecadeCategory = true
    }
}


function findIfPageIsAboutEarlyCenturyOrMillennium(){
    const title = getPageTitle()


    const reg = new RegExp(`^${nakedCenturyPattern} (millennium|century)( BCE?)$`)
    const matches = title.match(reg)
    if(matches){
        const word = matches[4]

        const millennium = word === "millennium" ? parseInt(matches[2],10) : 1
        const century = word === "century" ? parseInt(matches[2],10) : 1


        currentPageData.isPageAboutEarlyCenturyOrMillennium = millennium >= 3 || century >= 30
    

    }
}


function findIfPageContainsCenturiesTemplate(){

}

function updatePageTitle() {
    if(!isOnWikipedia)return
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
    const reg = new RegExp('\\s|\\&nbsp;|\\&#160;|\\&#8201;','gi')
    const newTextNodesArray = []
    targets = []
    let lastIndexInNodes = 0;
    
    for (let i = 0; i < textsArray.length; i++) {
        let j = lastIndexInNodes;
        const text = textsArray[i]
        let nodes;
        let cleanText = getTextWithoutMarkup(text)?.replace(reg, ' ');;

       if(cleanText){
            while(true){
                if(j >= textNodesArray.length)break;
                nodes = textNodesArray[j];
                if(!nodes){
                    j++;
                    continue;
                }
                var textInNode = nodes.firstNode.data.replace(reg, ' ');
            
                if(cleanText !== textInNode) {
                    // console.log('something is wrong while replacing')
                    // console.log('text',text)
                    // console.log('clean text:',cleanText)
                    // console.log('text in node',textInNode)
                    // console.log('i',i)
                
                    j++;
                    continue;
                }else{
                    lastIndexInNodes = j + 1;
                    var pair = replaceTextInNodeIfNeeded(nodes, text);
                    newTextNodesArray.push(pair);
                    break;
                }
            }   
        }
       

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
    const otherNumberStringInRange = span.getAttribute("other-number")
    const method = span.getAttribute("m")
    const type = span.getAttribute("t")

    const translations = getReplacementStrings(originalText,originalSubstitute,otherNumberStringInRange,method)

    if(!translations)return

    const [translated, originalForToast, translatedForToast] = translations

    if(isExtensionOff 
    // || (type === 'bookTitle' && !shouldTranslateDatesInBookTitles)
    // || (type === 'quote' && !shouldTranslateDatesInQuotes)
    ){

        span.innerHTML = originalText
        span.title = translatedForToast ?? undefined
        
    }else{
        span.innerHTML = translated
        span.title = originalForToast ?? undefined

    }
}

function turnOff(){
    updateTranslation()
    replaceImages(images, true)
}

function turnOn(){
    getConfigFromLocalStorage(function() {
        if (allWorkFinishedForPage) {
            updateTranslation()
            replaceImages(images)
            chrome.runtime.sendMessage('pageMetadataIsReady') //message for the popup script  
        } else if (currentLocation && !shouldNotUseServer && isOnWikipedia) {
            isEditingMode ? startWebRequestForEditor() : startWebRequest()
        }
        
    })
}

function replaceImages(images, reverse = false) {

    if (!images || images.length === 0) return
    const allImages = document.getElementsByTagName('img')

    for (let image of allImages) {

        replaceSrcInImage(image,reverse)

    }

}


async function replaceImagesOnWeb(){
    var dataString = await getDataStringFromStorage('OE-imageUrls');
    if(dataString){
        parseImageData(dataString);
        replaceImages(images);

    }else{

        const url = `https://${mediawikiDomain}/wiki/api.php?action=parse&prop=wikitext&formatversion=2&format=json&origin=*&page=OldEraImages.csv`

        fetch(url).then(function(res) {return res.json();}).then(function(page) {
            var wikitext = page.parse.wikitext;
            if (!wikitext) return;
    
            saveTimestampedDataString('OE-imageUrls',wikitext);
       
            parseImageData(wikitext);
        
            replaceImages(images);
        
        }).catch(function(error) {console.log('fetch failed',error);});
    }
}


function parseImageData(dataString){
    var lines = dataString.split('\n');
    
    var imgArray = [];
    lines.forEach(function(line) {
        var [originalImageURL, substituteImageURL] = line.split(';');
        var imageObj = {originalImageURL,substituteImageURL};
        imgArray.push(imageObj);
    });

    images = imgArray;

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
    const pattern = new RegExp('\\{\\{(.*?)\\|(.*?)\\|(.*?)\\|(.*?)\\|(.*?)\\}\\}', 'g')
    while ((result = pattern.exec(sourceText))) {
        const obj = { index: result.index, length: result[0].length, method: result[1], originalText: result[2], type: result[3], originalSubstitute: result[4], otherNumberStringInRange: result[5] }
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


        const replacementNode = getDateCaseNode(obj.originalText, obj.originalSubstitute,obj.otherNumberStringInRange, obj.method, obj.type)

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



function getDateCaseNode(originalText, originalSubstitute, otherNumberStringInRange, method, type = 'normal'){
    const span = document.createElement('span')

    span.setAttribute("o",originalText)
    span.setAttribute("s",originalSubstitute)
    span.setAttribute("other-number",otherNumberStringInRange)
    span.setAttribute("m",method)
    span.setAttribute("t",type)
    span.className = "rt-commentedText oedatecase"
    const textNode = document.createTextNode(originalText)
    span.appendChild(textNode)
  
    return span
}


function getReplacementStrings(text, originalSubstitute,otherNumberStringInRange, method) {
    const originalText = text
    text = text.replace(',','')
   
    const originalNumber = originalSubstitute ? numberFromString(originalSubstitute, 10) : numberFromString(text, 10)
        
    switch (method) {
   
        case 'bc-y': {
            return getYearReplacementString(text,originalNumber)
        }
        case 'bc-y-r1': {
            return getFirstYearInRangeReplacementString(originalText,originalNumber,otherNumberStringInRange)
        }
        case 'bc-y-r2':{
            return getSecondYearInRangeReplacementString(originalText,originalNumber,otherNumberStringInRange)
        }
        // case 'yearShort': {
        //     return getYearReplacementString(text,originalNumber,false,true)
        // }


        case 'bc-i': {
            return getYearReplacementString(text, originalNumber,true)
        }
        case 'bc-i-r1': {
            return getFirstYearInRangeReplacementString(originalText,originalNumber,otherNumberStringInRange,true)
        }
        case 'bc-i-r2': {
            return getSecondYearInRangeReplacementString(originalText,originalNumber,otherNumberStringInRange,true)
        }

        case 'bc-y1': {
            const year = originalNumber
            if (isNaN(year)) return null
            const translatedYear = translateYearPrecisely(year)
            const translatedYearString = `${translatedYear % 10}`
            return [translatedYearString, `${year} BC`,`${translatedYear}`]
        }
        case 'bc-y2': {
            const year = originalNumber
            if (isNaN(year)) return null
            const translatedYear = translateYearPrecisely(year)
            const translatedYearString = `${translatedYear % 100}`
            return [`${translatedYear % 100 < 10 ? '0' : ''}${translatedYearString}`, `${year} BC`, `${translatedYear}`]
        }
            
        case 'bc-i2': {
            const year = originalNumber
            if (isNaN(year)) return null
            const translatedYear = firstYearOfOldEra - year
            const translatedYearString = `${translatedYear % 100}`
            return [`${translatedYear % 100 < 10 ? '0' : ''}${translatedYearString}`, `${year} BC`, `${translatedYear}`]
        }
        case 'bc-d':
        case 'bc-dp':
        case 'bc-sd': {
            const decadeWord = method === 'bc-sd' ? '' : method === 'bc-dp' ? ' decades' :' decade'
            const decade = originalNumber
            if (isNaN(decade)) return null

            const secondYear = decade
            const firstYear = secondYear + 9

            const translatedFirstYear = translateYearPrecisely(firstYear)
            const translatedSecondYear = translateYearPrecisely(secondYear)

            if (translatedSecondYear === lastTranslatedYearWithLabel + 1) translatedSecondYear = lastTranslatedYearWithLabel
            const secondYearShort = translatedSecondYear % 100
            let translated = ""
            if(translatedFirstYear % 10 === 0){
                translated = `${translatedFirstYear}s`
            }else{
                translated = `${translatedFirstYear}/${secondYearShort < 10 ? translatedSecondYear : secondYearShort}${decadeWord}`
            }
            
            return [translated, `${numberFromString(text, 10)}s BC`, translated]
        }

        case 'bc-c': {
            let century = originalNumber
            if (isNaN(century)) {
                century = numbersFromWords[text.toLowerCase()]
            }
            const secondYear = (century - 1) * 100 + 1
            const firstYear = secondYear + 99

            const translatedFirstYear = translateYearPrecisely(firstYear)
            const translatedSecondYear = translateYearPrecisely(secondYear)

            let translatedCenturyString = ""
           if(translatedFirstYear % 100 !== 1){
               translatedCenturyString = `${translatedFirstYear}/${translatedSecondYear}`
           }else{
                const translatedCentury = translatedSecondYear / 100
                translatedCenturyString = `${translatedCentury}${numberSuffix(translatedCentury)}`
                
            }
            const originalCenturyWithEnding = `${century}${numberSuffix(century)}`

            return [translatedCenturyString, `${originalCenturyWithEnding} century BC`, `${translatedCenturyString} century`]
        }

        case 'bc-00s': {
            const x00s = originalNumber
            if (isNaN(x00s)) return null

            const secondYear = x00s
            const firstYear = secondYear + 99

            const translatedFirstYear = translateYearPrecisely(firstYear)
            const translatedSecondYear = translateYearPrecisely(secondYear)


            let translated00sString = ""
            if(translatedFirstYear % 100 !== 2){
                translated00sString = `${translatedFirstYear}/${translatedSecondYear}`
            }else{
                translated00sString = `${translatedFirstYear - 2}s`
            }

            return [translated00sString, `${numberFromString(text, 10)}s BC`, translated00sString]
        }

        case 'bc-m': {
            let millennium = originalNumber
            if (isNaN(millennium)) {
                millennium = numbersFromWords[text.toLowerCase()]
            }

            const secondYear = (millennium - 1) * 1000 + 1
            const firstYear = secondYear + 999

            const translatedFirstYear = translateYearPrecisely(firstYear)
            const translatedSecondYear = translateYearPrecisely(secondYear)

            let translatedMillenniumString = ""
           if(translatedFirstYear % 1000 !== 1){
               translatedMillenniumString = `${translatedFirstYear}/${translatedSecondYear}`
           }else{
                const translatedMillennium = translatedSecondYear / 1000
                translatedMillenniumString = `${translatedMillennium}${numberSuffix(translatedMillennium)}` 
            }

            const originalMillenniumWithEnding = `${millennium}${numberSuffix(millennium)}`
            return [translatedMillenniumString, `${originalMillenniumWithEnding} millennium BC`, `${translatedMillenniumString} millennium`]
        }



        case 'bc-000s': {
            const x000s = originalNumber
            if (isNaN(x000s)) return null

            const secondYear = x000s
            const firstYear = secondYear + 999

            const translatedFirstYear = translateYearPrecisely(firstYear)
            const translatedSecondYear = translateYearPrecisely(secondYear)


            let translated000sString = ""
            if(translatedFirstYear % 1000 !== 2){
                translated000sString = `${translatedFirstYear}/${translatedSecondYear}`
            }else{
                translated000sString = `${translatedFirstYear - 2}s`
            }

            return [translated000sString, `${numberFromString(text)}s BC`, translated000sString]
        }

        case 'bc-r': {
            return ["", "", ""]
        }

        case 'bc-tn': {
            return [timelineName, "", ""]
        }

        case 'bc-ot': {
            return [ofTimeline, "", ""]
        }
            
        case 'bc-at': {
            return [abbreviatedTimelineName, "", ""]
        }
        

        default:
            return [originalText, "", ""]
    }
}


function translateYearPrecisely(year){
    return firstYearOfOldEra + 1 - year
}

function translateYearImprecisely(year){
    let translatedYear = `${firstYearOfOldEra + (shouldTranslateYearsPrecisely ? 1 : 0) - year}`
    if(translatedYear == 0)translatedYear = 1
    return translatedYear
}



function getFirstYearInRangeReplacementString(originalText,year,otherNumberStringInRange = "",isImprecise = false){
    if (isNaN(year)) return null

    const secondYear = parseInt(otherNumberStringInRange,10)
   
    if(year > firstYearOfOldEra && secondYear > firstYearOfOldEra){
        return [originalText, '', '']
    }
    if(year > firstYearOfOldEra && secondYear <= firstYearOfOldEra){
        return [`${year} BC`, '', '']
    }
    const translatedYearString = `${isImprecise ? translateYearImprecisely(year) : translateYearPrecisely(year)}`  
    return [translatedYearString, `${year} BC`, translatedYearString]
}

function getSecondYearInRangeReplacementString(originalText,year,otherNumberStringInRange = "", isImprecise = false){
    if (isNaN(year)) return null

    const firstYear = parseInt(otherNumberStringInRange,10)

    if(year > firstYearOfOldEra){
        return [originalText, '', '']
    }
    const translatedYear = `${isImprecise ? translateYearImprecisely(year) : translateYearPrecisely(year)}`
    
    if((year <= firstYearOfOldEra && firstYear > firstYearOfOldEra) || translatedYear <= lastTranslatedYearWithLabel){
        const translatedYearString = `${translatedYear} ${abbreviatedTimelineName}`
        return [translatedYearString, `${year} BC`, translatedYearString]
    }

    const translatedYearString = translatedYear
  
    return [translatedYearString, `${year} BC`, translatedYearString]
}


function getYearReplacementString(originalText, year, isImprecise = false, shortened = false){
    if (isNaN(year)) return null
    const translatedYear = `${isImprecise ? translateYearImprecisely(year) : translateYearPrecisely(year)}`

    if(year > firstYearOfOldEra){
        return [originalText, '', '']
    }

    let translatedYearString = ''
    if(translatedYear <= lastTranslatedYearWithLabel){
        translatedYearString = `${translatedYear} ${abbreviatedTimelineName}`
    }else{
        translatedYearString = `${translatedYear}`
    }
    return [translatedYearString, `${year} BC`, translatedYearString]
  
}



function createMarker(text, method, type = 'normal', originalSubstitute = '',otherNumberStringInRange = '') { 
    return `{{${method}|${text}||${originalSubstitute}|${otherNumberStringInRange}}}`
}




function numberSuffix(number) {
    if (number > 10 && number < 20) return 'th'
    const lastDigit = number % 10
    if (lastDigit === 1) return 'st'
    if (lastDigit === 2) return 'nd'
    if (lastDigit === 3) return 'rd'
    return 'th'
}
