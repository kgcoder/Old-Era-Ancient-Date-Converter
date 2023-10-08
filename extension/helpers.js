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



function checkIfSecondYearIsShortened(year1, year2, year2String) {
 
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
            const [match] = year2String.match(nakedYearPattern)
            if(match && match[0] === '0'){
                return { numberOfDigits: 2, realYear }
            }
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


function getEditFromLine(line,variant = ''){
    const chunks = chunksFromLine(line)
    if((chunks.length === 1 || chunks.length === 2) && chunks[0].includes("Template:")){
        let variant = ''
        if(chunks.length === 2){
            variant = chunks[1]
        }
        return {isTemplate:true,name:chunks[0],subEdits:[],variant}
    }
    if(chunks.length !== 7)return null
    const string = chunks[0]
    const target = chunks[1]
    const method = chunks[2]
    const type = chunks[3]
    const order = chunks[4]
    const originalSubstitute = chunks[5]
    const platform = chunks[6] //"m", "d", "" (mobile, desktop, or both)

    if(variant == '1'){//for template edits
        if(platform !== '' && platform !== variant)return null //for template edits with variants
    }else if (variant){
        if(platform !== variant)return null
    } 



    //TODO:validate data


    return {
        string,
        target,
        method,
        type,
        order,
        originalSubstitute,
        isTemplate:false,
        subEdits:[],
        platform
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
    uriComponent = uriComponent.replace('en.m.wikipedia.org','en.wikipedia.org')
    return `${webBaseUrl}/wiki/api.php?action=parse&origin=*&prop=wikitext&formatversion=2&format=json&page=Dates/${uriComponent}`

}

function getPageUrlOnMyServer(){
    let uriComponent = currentLocation.replace('https://','').replace('http://','').replace('www.','')
    uriComponent = uriComponent.replace('en.m.wikipedia.org','en.wikipedia.org')
    return `${webBaseUrl}/wiki/index.php/Dates/${uriComponent}`

    
}

function getPageUrlOnMyServerForEditing(){
    let uriComponent = currentLocation.replace('https://','').replace('http://','').replace('www.','')
    uriComponent = uriComponent.replace('en.m.wikipedia.org','en.wikipedia.org')
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


function getEditsFromLines(lines,variant = ''){
    const regN = new RegExp('\\\\n','g')
    const regT = new RegExp('\\\\t','g')

    
    return lines.map(line => getEditFromLine(line,variant))
    .filter(obj => obj !== null)
    .map(edit => {
        if(edit.isTemplate)return edit
        return convertMethodNameLongToShort(edit)
    })
    .map(edit => {
        if(edit.isTemplate)return edit
       
        return {...edit, string:edit.string.replace(regN,'\n').replace(regT,'\t')} 
    })
}



function prepareServerReplacements(allEdits,text){

    const editsToUse = allEdits.filter(edit => !edit.isTemplate)

    let {replacementsFromServer:repsFromServer, badReplacements} =  getReplacementsFromServerForWeb(editsToUse, text)

    repsFromServer = repsFromServer.sort((a,b) => a.index - b.index)


    if(!isOnMobile){

        let indexOfEditBeforeTemplate = 0
        let indexInAllEdits = 0
        let indexInFilteredEdits = 0
        let insideTemplate = false
        let lastTemplate = null

        if(repsFromServer.length){
            while (indexInAllEdits < allEdits.length || indexInFilteredEdits < repsFromServer.length){
                const replacement = repsFromServer[Math.min(indexInFilteredEdits,repsFromServer.length - 1)]
                const edit = allEdits[Math.min(indexInAllEdits,allEdits.length - 1)]
                

                if(edit.isTemplate){
                    if(lastTemplate && !lastTemplate.indexAfter){
                        lastTemplate.indexAfter = -1
                        edit.indexBefore = -1
                    }else{
                        edit.indexBefore = indexOfEditBeforeTemplate

                    }
                    lastTemplate = edit
                    insideTemplate = true
                    indexInAllEdits++
                    continue
                }


                
                if(edit.string === replacement.edit.string && edit.method === replacement.edit.method && ordersAreEqual(edit.order,replacement.edit.order)){
                    
                    if(insideTemplate){
                        lastTemplate.indexAfter = replacement.index 
                        insideTemplate = false
                        lastTemplate = null

                    }else{
                        indexOfEditBeforeTemplate = replacement.index + replacement.edit.target.length
                    }
                    
                    indexInAllEdits++
                    indexInFilteredEdits++


                }else{
                    indexInAllEdits++
                }
                if(indexInAllEdits >= allEdits.length || indexInFilteredEdits >= repsFromServer.length)break

            }

            if(insideTemplate){
                lastTemplate.indexAfter = text.length - 1
            }


        }

    
    
        let templates = allEdits.filter(edit => !!edit.isTemplate)


        if(!repsFromServer.length){
            templates = templates.map((item,index) => ({
                ...item,
                indexBefore:index == 0 ? 0 : -1,
                indexAfter:index == templates.length - 1 ? text.length - 1 : -1
            }))
        }

        let lastIndexBeforeTemplate = 0
        for(let template of templates){
            const startIndex = template.indexBefore == -1 ? lastIndexBeforeTemplate : template.indexBefore
            const endIndex = template.indexAfter == -1 ? text.length - 1 : template.indexAfter
            const textPart = text.substr(startIndex, endIndex - startIndex)

            let {replacementsFromServer:templateReps, badReplacements:badRepsInTemplate} =  getReplacementsFromServerForWeb(template.subEdits, textPart)


            templateReps = templateReps.map(rep => ({...rep,index:startIndex + rep.index}))

            repsFromServer = repsFromServer.concat(templateReps)

            badReplacements = badReplacements.concat(badRepsInTemplate)
            

            const healthyReps = templateReps.filter(rep => !rep.isBroken)

            if(healthyReps.length){
                const lastRep = healthyReps[healthyReps.length - 1]
                lastIndexBeforeTemplate = lastRep.index + lastRep.edit.target.length
            }


        }

    }


    


    return {repsFromServer: repsFromServer.sort((a,b) => a.index - b.index),badReplacements}
}



async function getTemplatesInfoFromServer(editsArray){
    const templates = editsArray.filter(item => item.isTemplate == true)

    const promises = templates.map(fetchTemplateData);
    await Promise.all(promises);
}



async function fetchTemplateData(template) {
    const url = getWikitextUrlOnMyServer(encodeURIComponent('en.wikipedia.org/wiki/' + template.name))
   
    try {
        const r = await fetch(url);
        const json = r.status !== 200 ? {} : await r.json()
        const wikitext = json.parse.wikitext

        if(!wikitext)return "not ok"

        const lines = wikitext.split('\n')
        const variant = template.variant ? template.variant : '1'
        const templateEdits = getEditsFromLines(lines,variant)
        template.subEdits = templateEdits
        return "ok";
    } catch (error) {
        return "some error";
    }
}


function areEditsEqual(editA, editB){

    return editA.string === editB.string &&
        editA.target === editB.target &&
        ordersAreEqual(editA.order, editB.order) &&
        editA.method === editB.method &&
       ( editA.originalSubstitute === editB.originalSubstitute || (!editA.originalSubstitute && !editB.originalSubstitute))
}


function areEditsInSamePlace(text, editA, editB, checkHideShow = false,ignoreBCEndings = false){

    let targetA = editA.target
    let targetB = editB.target

    let stringA = editA.string
    let stringB = editB.string

    if(ignoreBCEndings){



        const bcReg = new RegExp(bcPattern,'igm')

        targetA = targetA.replace(bcReg,' BC')
        stringA = stringA.replace(bcReg,' BC')

        targetB = targetB.replace(bcReg,' BC')
        stringB = stringB.replace(bcReg,' BC')


        const targetAIndex = getTargetIndexInsideString(stringA,targetA,editA.order)
        const targetBIndex = getTargetIndexInsideString(stringB,targetB,editB.order)

        stringA = stringA.substr(targetAIndex - 10,targetA.length + 2 * 10)
        stringB = stringB.substr(targetBIndex - 10,targetB.length + 2 * 10)


    }


    const normalComparison = stringA === stringB &&
    targetA === targetB &&
    ordersAreEqual(editA.order, editB.order)

    if(checkHideShow && !normalComparison){
        stringA = stringA.replace(/hide/g,"show")
        stringB = stringB.replace(/hide/g,"show")

        return stringA === stringB &&
        targetA === targetB &&
        ordersAreEqual(editA.order, editB.order)

    }

    return normalComparison
       
}


function ordersAreEqual(orderA,orderB){
    if(!orderA && !orderB) return true

    if(orderA){
        orderA = orderA.includes("d") ? getOrderChunks(orderA).join('.') : orderA
        if(orderA === '1.1.1.1')orderA = ''
    }
    if(orderB){
        orderB = orderB.includes("d") ? getOrderChunks(orderB).join('.') : orderB
        if(orderB === '1.1.1.1')orderB = ''
    }

    if(!orderA && !orderB) return true
    return orderA == orderB
}

function getOccurenceNumberInsideStringFromOrder(string, target, order){
    if(!order)return 1
    const chunks = getOrderChunks(order)
    if(!chunks || chunks.length != 4)return 1
    return chunks[3]
}



function addLinksToCategoryMembersOnServer(){
     const links = document.getElementsByTagName('a')
    for (let link of links){
        if(!link.href.includes(`https://${mediawikiDomain}/wiki/index.php/Dates/`))continue
        if(link.className == "external-link")continue
        const parent = link.parentElement
        if(parent.tagName === 'LI'){
            const newLink = document.createElement('a')
            newLink.innerText = "⏵"
            newLink.className = "external-link"
            newLink.style.marginLeft = "10px"
            newLink.href = "https://" + link.href.replace(`https://${mediawikiDomain}/wiki/index.php/Dates/`,"")
            newLink.target = "_blank"
            parent.appendChild(newLink)
        }
    }
}


function addLinkToTitleOnMediaWikiPage(){
    const h1s = document.getElementsByTagName('h1')
    if(!h1s || !h1s.length)return

    const header = h1s[0].innerText


    const reg = new RegExp('^(.*?Dates/)(.*?)("?)$')
    const newHeader = header.replace(reg, (match, firstPart, link, quotes) => {
        if(link === "SupportedWebsites")return match
        return `${firstPart}<a href="https://${link}" target="_blank">${link}</a>${quotes}`
    })

    h1s[0].innerHTML = newHeader

}


function addLinksToSupportedWebsitesPage(){
    const p = document.getElementsByTagName('p')[0]
    let list = p.innerText.split("\n")

    list = ["en.wikipedia.org"].concat(list.filter(domain => !!domain))

    const parent = p.parentNode
    parent.removeChild(p)

    const listNode = document.createElement('ul')
    const inner = list.map(domain=> {
        const externalLink = 'https://' + domain
        const internalLink = `https://${mediawikiDomain}/wiki/index.php/Category:${domain}`
        return `<li><a href="${internalLink}">${domain}</a> <a href="${externalLink}" target="_blank">⏵</a></li>`
    }).join("\n")

    listNode.innerHTML = inner

    parent.appendChild(listNode)


}


function getDataFormatVersionFromDataPage(wikitext){
    const reg = new RegExp('\\[\\[Category:Format version (.*?)\\]\\]')
    const match = wikitext.match(reg)
    if(!match)return 1
    const version = parseInt(match[1],10)
    return version
}


function canTargetContainBCLabelBasedOnMethod(method){
    return ["bc-y","bc-i","bc-y1","bc-y2","bc-i2","bc-d","bc-sd","bc-dp","bc-00s","bc-000s"].includes(method)
}

function getTargetIndexInsideString(string,target,order){
    const reg = new RegExp(escapeText(target))
    const occInsideString = getOccurenceNumberInsideStringFromOrder(order)
    let result
    let occA = 0
    while((result = reg.exec(string))){
        occA += 1
        if(occA === occInsideString){
            return result.index//string.substr(0,result.index) + string.substr(result.index + target.length,string.length - 1)
        }
    }
    return string
}


function getReplacementFromEdit(edit,text){
    const targetWithBCReg = new RegExp(`^(.*?)${bcPattern}`,'i')

    let { string, target, method, order, type, originalSubstitute } = edit

    const orderChunks = getOrderChunks(order)

    if (orderChunks.length !== 4) {
        console.log('orderChunks.length !== 4')
        return {edit,isBroken:true}
    }

    const [string_num_of_oc, string_oc, target_num_of_oc, target_oc] = orderChunks

    const newString =escapeText(string)// replaceNewLines(escapeText(string))


    const pattern1 = new RegExp(newString, 'gm')
    const matchesCount = (text.match(pattern1) || []).length

    if (matchesCount != string_num_of_oc) {
        console.log('matchesCount != string_num_of_oc')
        console.log('matchesCount',matchesCount)
        console.log('string_num_of_oc',string_num_of_oc)
        console.log('string',string)
        console.log('target',target)
        return {edit,isBroken:true}
    }

    if (string_oc < 1 || string_oc > string_num_of_oc) {
        console.log('string_oc < 1 || string_oc > string_num_of_oc')
     
        return {edit,isBroken:true}
    }

    const pattern2 = new RegExp(escapeText(target), 'g')
    const targetMatchesCount = (string.match(pattern2) || []).length

    if (targetMatchesCount != target_num_of_oc) {
        console.log('targetMatchesCount != target_num_of_oc')
        return {edit,isBroken:true}
    }

    if (target_oc < 1 || target_oc > target_num_of_oc) {
        console.log('target_oc < 1 || target_oc > target_num_of_oc')
        return {edit,isBroken:true}
    }


    const index1 = findIndexOfSubstringOccurrence(text, string, string_oc)
    const index2 = findIndexOfSubstringOccurrence(string, target, target_oc)

    const index = index1 + index2

    if(index){
        edit.targetIndex = index
    }
    let length = target.length

    if(canTargetContainBCLabelBasedOnMethod(method)){
        const matches = target.match(targetWithBCReg)
        if(matches){
            length = matches[1].length
        }
    }


    return {isBroken:false, edit, index, length, replacement: createMarker(target, method, type, originalSubstitute) }


    
}



function replacementsIntersect(repA,repB){
    const repAStart = repA.index
    const repAEnd = repA.index + repA.length - 1

    const repBStart = repB.index
    const repBEnd = repB.index + repB.length - 1

    return (repAStart <= repBStart && repAEnd >= repBEnd) ||
    (repAStart >= repBStart && repAStart <= repBEnd) ||
    (repAEnd >= repBStart && repAEnd <= repBEnd)    
}