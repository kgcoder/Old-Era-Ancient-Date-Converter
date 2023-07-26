/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

function giRegForHtml(pattern) {
    pattern = negativeLookaheadPattern + pattern
    return new RegExp(pattern, "gi");
}


function giRegForText(pattern) {
    return new RegExp(pattern, "gi");
}


function convertTypeFromMakup(typeInMarkup) {
    if (!typeInMarkup) {
            return 'normal'
    } else if (typeInMarkup.includes('t')) {
            return 'bookTitle'
    } else if (typeInMarkup.includes('q')) {
            return'quote'
    }
    return 'normal'
}
 
function numberFromString(string) {
    const newString = string.replace(/[^\d]/g, '')
    return parseInt(newString, 10)
}

function methodForYear(year, pageData) {
    if(year > firstYearOfOldEra) return 'bc-ig'
    if (!pageData.isPageAboutEarlyCenturyOrMillennium && year >= 3000 && year % 10 === 0) return'bc-i'
    return 'bc-y'
}

function getPageDataForSummary(html){
    const reg = new RegExp(`href="/wiki/(\\d+(st|nd|rd|th))_(millennium|century)_BCE?`,"gi")

    const result = reg.exec(html)
    if(!result){
     return {isPageAboutEarlyCenturyOrMillennium:false }
    }

    const number = parseInt(result[1],10)

    const word = result[3]

    const millennium = word === "millennium" ? number : 1
    const century = word === "century" ? number : 1

    const pageData = {isPageAboutEarlyCenturyOrMillennium:millennium >=3 || century >= 30 }
    return pageData
}


function getTextWithoutMarkup(text){
    var pattern = new RegExp('(\\{\\{(.*?)\\|)(.*?)\\|(.*?)\\|(.*?)\\}\\}', 'g');

    var replacements = [];
    while(result = pattern.exec(text)){
        var fullString = result[0];
        var dateString = result[3];
        var index = result.index;
        
        var replacement = {
            index,
            length:fullString.length,
            replacement: dateString
        };
        replacements.push(replacement);
    }
    
    if(!replacements.length)return null;

    var cleanText = '';
    var lastIndex = 0;

    replacements.forEach(function({ index, length, replacement }) {
        cleanText += text.substr(lastIndex, index - lastIndex);
        cleanText += replacement;
        lastIndex = index + length;
    });

    cleanText += text.substr(lastIndex, text.length - lastIndex);
       
    return cleanText;
}



function checkIfSecondYearIsShortened(year1, year2) {
 
    if (year2 < 10 && year1 > 9) {
        const lastDigit = year1 % 10

        if ((lastDigit === 2 && year2 === 1) || (lastDigit === 1 && year2 === 0)) {
            const realYear = year1 - 1
            if((realYear - 1) % 100 == 0){
                return { numberOfDigits: 4, realYear }
            }
            return { numberOfDigits: 2, realYear }
        }
        if (lastDigit > year2) {
            const realYear = Math.floor(year1 / 10.0) * 10 + year2
            return { numberOfDigits: 1, realYear }
        }
    }

    if (year2 < 100 && year2 > 9 && year1 > 99) {
        const lastTwoDigits = year1 % 100
        if (lastTwoDigits > year2) {
            const realYear = Math.floor(year1 / 100.0) * 100 + year2
            return { numberOfDigits: 2, realYear }  
        }
    }

    return { numberOfDigits: 0, realYear:year2 }
}


function isIndexInsideTag(index,text){
    while(index < text.length){
        const character = text.slice(index,index + 1)
        if(character === '>')return true
        if(character === '<')return false
        index++
    }
    return false
}




function chunksFromLine(line) {
    const escapedLine = line.replace(/\\;/g, '!!!SEMICOLON!!!')
    const chunks = escapedLine.split(';')
    return chunks.map(chunk => chunk.replace(/!!!SEMICOLON!!!/g, ';'))
}



function addEscapesToSemicolons(text) {
    return text.replace(/;/g, '\\;')
}

function removeEscapesFromSemicolons(text){
    return text.replace(/\\;/g,';')
}


function getEditFromLine(line){
    const chunks = chunksFromLine(line)
    if(chunks.length !== 7)return null
    const string = chunks[0]
    const target = chunks[1]
    const method = chunks[2]
    const type = chunks[3]
    const order = chunks[4]
    const originalSubstitute = chunks[5]
    const fromTemplate = chunks[6] == "1"

    //TODO:validate data


    return {
        string,
        target,
        method,
        type,
        order,
        originalSubstitute,
        fromTemplate
    }
}


function convertMethodNameLongToShort(edit){
    const newName = longToShortMethodConversions[edit.method]
    if(newName){
        return {...edit,method:newName}
    }
    return edit
}


function fixNsAndTsInEditString(edit){
    const newName = longToShortMethodConversions[edit.method]
    if(newName){
        return {...edit,method:newName}
    }
    return edit
}

function clearCache(){

    try{
        chrome.storage.local.remove(["WebsitesSupportedByBackend"],function(){
            let error = chrome.runtime.lastError;
               if (error) {
                   console.error(error);
               }
        })

    }catch(e){
        console.log('e',e)
    }
}


async function prepareListOfWebsitesSupportedByBackend(){

   let websitesSupportedByBackendString = await getDataStringFromStorage('WebsitesSupportedByBackend')
   if(!websitesSupportedByBackendString){
        try{
            websitesSupportedByBackendString = await requestListOfWebsites()
            saveTimestampedDataString('WebsitesSupportedByBackend',websitesSupportedByBackendString)
        }catch(e){
            console.log('error while fetching list of websites',e)
        }
   }

   if(websitesSupportedByBackendString){
        const websites = websitesSupportedByBackendString.split('\n').filter(line => !line.includes('<')).map(line => line.trim())
        sitesSupportedByBackend = websites
   }

}


function saveTimestampedDataString(key, value) {
    const object = { value: value, timestamp: new Date().getTime() }
    chrome.storage.local.set({ [key]: JSON.stringify(object) }).then(() => {
         //console.log("Value is set:",value);
     });
}


function getDataStringFromStorage(key) {
    return new Promise((resolve,reject) => {
        chrome.storage.local.get([key], function (result) {
            const dataObjectString = result[key]
            if (!dataObjectString) return resolve(null)
            const obj = JSON.parse(dataObjectString)
            if (!obj) return resolve(null)
    
            const timestamp = obj.timestamp
            if(!timestamp) return resolve(null)
            const now = new Date().getTime()
            const diff = now - timestamp
    
            if (diff > kCacheTTL) return resolve(null)
    
            resolve(obj.value)
        })

    })
}


function getWikitextUrlOnMyServer(uriComponent = ''){
    if(!uriComponent){
        uriComponent = currentLocation.replace('https://','').replace('http://','').replace('www.','')
    }
    return `${webBaseUrl}/wiki/api.php?action=parse&origin=*&prop=wikitext&formatversion=2&format=json&page=Dates/${uriComponent}`
}

function getPageUrlOnMyServer(){
    const uriComponent = currentLocation.replace('https://','').replace('http://','').replace('www.','')
    return `${webBaseUrl}/wiki/index.php/Dates/${uriComponent}`

    
}

function getPageUrlOnMyServerForEditing(){
    const uriComponent = currentLocation.replace('https://','').replace('http://','').replace('www.','')
    return `${webBaseUrl}/wiki/index.php?title=Dates/${uriComponent}&action=edit`
}



function showDefaultPopup(message){

    const popup = document.createElement('div')
    popup.className = 'defaultPopup'
    popup.innerHTML = `
        <p>${message}</p>
        <label>
        <input type="checkbox" id="dontShowAgain"> Don't show this popup again
        </label>
        <button id="closeDefaultPopup">Close</button>
    `
    document.body.appendChild(popup)
    isDefaultPopupActive = true

  


    
  
}

function addListenerToDefaultPopupCloseButton(){
    const closeButton = document.getElementById('closeDefaultPopup')   
    if(!closeButton)return

    const popup = document.getElementsByClassName("defaultPopup")[0]

 closeButton.addEventListener('click', function (event) {
   event.stopPropagation()

     const input = document.getElementById("dontShowAgain")


     if(input.checked){
         chrome.storage.local.set({ dontShowPopupAgain:true }, function () {})
     }

     popup.parentElement.removeChild(popup)
     isDefaultPopupActive = false
 })

}

