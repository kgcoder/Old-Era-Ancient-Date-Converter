/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */




let currentHTML = ''
let editsFromServer = []

let isTestingMode = false
let selectionMode = 'markerMode'
let isEditingWikitext = false

let initialWikitext = ''
let initialInstructionsForWikitext = []
//let isServerDataReady = false

let originalHTML = ''

let htmlBeforeTesting = ''

let threshold = 18

let instructions = []
let finalInstructions = []
let texts = []
let tags = []

let localReplacementsArray = []

let isDefaultPopupActive = false

let currentWikitext = ""



const allClassesString = allClasses.join('|')



function onEditorLoad() {
     if(!isEditingMode)return
     setInitialHtml()
     addToHistory(currentHTML)
     openAllWikipediaDropDowns(()=>{
        openAllBritannicaDropDowns(() => {

            const regN = new RegExp('\\\\n','g')
            const regT = new RegExp('\\\\t','g')

            editsFromServer = editsArray.map(edit => {
                return {...edit, string:edit.string.replace(regN,'\n').replace(regT,'\t')} 
            })
    
        
            loadEdits(editsFromServer,true,false)
        
            if (document.addEventListener) {
                document.addEventListener('click', interceptClickEvent);
            }

        })

 


    })
 
}


function setInitialHtml() {

    let currentLocation = window.location.toString()
 
    if (currentLocation.includes('localhost')) {
        originalHTML = document.body.innerHTML
    } else {
        originalHTML = new XMLSerializer().serializeToString(document.body)
    }

    currentHTML = originalHTML

}

function openAllWikipediaDropDowns(callback){
    if(!currentLocation || !isOnWikipedia){
        callback()
        return
    }

    setTimeout(() => {
        const links = document.getElementsByClassName('mw-collapsible-text')
   
        Array.prototype.forEach.call(links, link => {
            if(link.innerHTML == "show"){
                link.click()
            }      
        });


        callback()

    },1000)

}


function openAllBritannicaDropDowns(callback){
    if(!currentLocation || domain !== 'britannica.com'){
        callback()
        return
    }

    setTimeout(() => {
        const links = document.getElementsByClassName('js-content link-blue')
   
        Array.prototype.forEach.call(links, link => {
            if(link.innerHTML.toLowerCase().includes('show more')){
                link.click()
            }      
        });


        callback()

    },1000)
}



function interceptClickEvent(e) {
    const target = e.target || e.srcElement;
    if (target.tagName === 'A' || target.tagName === 'SELECTION') {
        href = target.getAttribute('href');

        

        if(isEditingMode){
            e.preventDefault();
        }

    }else{
      //  console.log('target.tagName',target.tagName)
    }
}


chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if(!isEditingMode)return
    switch (message) {

        case 'giveMePageMetadata':
        //    sendResponse({isServerDataReady: editsFromServer && editsFromServer.length > 0 ? true : false})
            break
        case 'goBackInHistory':
            goBackInHistory()
            break
        case 'goForwardInHistory':
            goForwardInHistory()
            break
        case 'loadFromTemplates':
        //    loadFromTemplates()
            break
        case 'loadFromServer':
         //   loadFromServer()
            break
        case 'loadFromServerOnlyFixed':
       //     loadFromServerOnlyFixed()
            break
        case 'loadFromServerWithoutFixed':
       //     loadFromServerWithoutFixed()
            break
        case 'loadFromStorage':
        //    loadFromLocalStorage()
            break
        case 'find1DigitNumbers':
            selectNumbers(1)
            break
        case 'find2DigitNumbers':
            selectNumbers(2)
            break
        case 'find3DigitNumbers':
            selectNumbers(3)
            break
        case 'find4DigitNumbers':
            selectNumbers(4)
            break
        // case 'findNumbersWithBCs':
        //     selectNumbersWithBCs()
        //     break
        case 'findRoundYears':
            findRoundYears()
            break
        case 'findDecades':
            findDecades()
            break
        case 'findCenturiesMillennia':
            findCenturiesMillennia()
            break

        case 'findNumberWords':
            findNumberWords()
            break
        case 'markWordCentury':
            markWordCentury()
            break
        case 'markWordMillennium':
            markWordMillennium()
            break

        case 'findBCs':
            findBCs()
            break
        case 'findBCsWithoutSpaces':
            findBCsWithoutSpaces()
            break
        case 'selectRange':
            selectRange()
            break
        case 'deselectRange':
            clearSelection()
            break
        case 'roundYearsInRange':
            roundYearsInRange()
            break
        case 'deleteInRange':
            deleteInRange()
            break
        case 'commitYears':
            commitYears()
            break
        case 'commitADYears':
            commitADYears()
            break
        case 'commitDecades':
            commitDecades()
            break
        case 'commitCenturies':
            commitCenturies()
            break
        case 'commit00s':
            commit00s()
            break
        case 'commitMillennia':
            commitMillennia()
            break
        case 'commit000s':
            commit000s()
            break
        case 'sendToServer':
            sendToServer()
            break
        case 'startWikitextEditing':
            isEditingWikitext = true
            startWikitextEditing()
            sendResponse({isEditingWikitext})
            break
        case 'toggleTestingModeFromShortcut':
            toggleTestingModeFromShortcut()
            break
        case 'test':
            test()
            break
        case 'backToEditing':
            backToEditing()
            break
        case 'commitRemovals':
            commitRemovals()
            break
        case 'commitOE':
            commitOE()
            break
        case 'commitOfOE':
            commitOfOE()
            break
        case 'commitIgnoredPart':
            commitIgnoredPart()
            break
        case 'giveMeCurrentState':
            sendResponse({isTestingMode,selectionMode,isEditingWikitext})
            break
        case 'toggleTestingMode':{
            isTestingMode = !isTestingMode
            sendResponse({isTestingMode})
        }
            break
        case 'markerMode':
            selectionMode = 'markerMode'
            sendResponse({selectionMode})
            break
        case 'bookTitleMode':
            selectionMode = 'bookTitleMode'
            sendResponse({selectionMode})
            break
        case 'quoteMode':
            selectionMode = 'quoteMode'
            sendResponse({selectionMode})
            break
        default:
        //do nothing
    }
    return true
})





function loadEdits(editsFromServer,shouldFixBrokenEdits = false,showOnlyFixed = false){
    if (currentIndexInHistory !== 0) {
        alert("can't load after editsFromServer")
        return
    }


    const htmlWithMarkers = createHTMLWithMarkersForEditor(editsFromServer,shouldFixBrokenEdits,showOnlyFixed)
    currentHTML = replaceCurlyBracesWithMarkup(htmlWithMarkers)

    


    setBodyFromCurrentHTML(true)
    addToHistory(currentHTML)

    instructions = editsFromServer

 
    if(!dontShowPopupAgain){
        showDefaultPopup('In editing mode all links are disabled to prevent you from losing your progress by accidentally clicking one of them. To enable links click "Stop editing" in the OE extension pupup.')
    }


    addListenerToDefaultPopupCloseButton()
}




function createHTMLWithMarkersForEditor(editsFromServer,shouldFixBrokenEdits = false,showOnlyFixed = false) {

    let html = new XMLSerializer().serializeToString(document.body)
    html = removeProblematicPartsFromHtml(html)

    const { htmlWithIgParts, ignoredParts } = htmlWithIgnoredParts(html)

    let replacements = []
    const {result:text,insertions} = extractTextFromHtml(htmlWithIgParts)
    if(isOnWikipedia){
        replacements = getReplacementsFromEdits(editsFromServer,htmlWithIgParts)
    }else{
        replacements = getReplacementsFromEdits(editsFromServer,text)
    }

   
    let currentGap = null
    let lastGoodEdit = null
    const gaps = []

    replacements.forEach(rep => {

    
        if(!currentGap && rep.isBroken === false){
            lastGoodEdit =  rep.edit
        }else if(!currentGap && rep.isBroken === true){
            currentGap = {firstGoodEdit:lastGoodEdit,brokenEdits:[rep.edit],lastGoodEdit:null}
            gaps.push(currentGap)
        }else if(currentGap && rep.isBroken === true){
            currentGap.brokenEdits.push(rep.edit)
        }else if(currentGap && rep.isBroken === false){
            lastGoodEdit = rep.edit
            currentGap.lastGoodEdit = rep.edit
            currentGap = null
        }

    })


    const filteredEdits = replacements.filter(rep => !rep.isBroken)

    pageHasIssues = filteredEdits.length !== replacements.length
    replacements = filteredEdits


    if(shouldFixBrokenEdits){
        const fixedEdits = fixBrokenEdits(gaps,isOnWikipedia ? htmlWithIgParts : text)
        if(showOnlyFixed){
            replacements = fixedEdits
        }else{
            replacements = replacements.concat(fixedEdits)
        }
    }

    let finalReplacements = replacements
    if(!isOnWikipedia){
        finalReplacements = []
        moveReplacementsFromTextToHtml(text,htmlWithIgParts,replacements, finalReplacements, insertions)
    }


    localReplacementsArray = []

    findIfPageIsAboutEarlyCenturyOrMillennium(html)


    getLocalReplacements(htmlWithIgParts, localReplacementsArray, currentPageData)
    localReplacementsArray = localReplacementsArray.map(item => {
        item.edit.targetIndex = item.index
        if(['bc-y-r1','bc-y-r2'].includes(item.edit.method))item.edit.method = 'bc-y'
        if(['bc-i-r1','bc-i-r2'].includes(item.edit.method))item.edit.method = 'bc-i'
        return item
    })

    replacements = resolveReplacements(localReplacementsArray, finalReplacements)

    replacements = replacements.sort((a, b) => a.index - b.index)


  
 



    if (!replacements.length) return null

    let result = ''
    let lastIndex = 0

    replacements.forEach(({ index, length, replacement }) => {
        result += htmlWithIgParts.substr(lastIndex, index - lastIndex)
        result += replacement
        lastIndex = index + length
    })

    result += htmlWithIgParts.substr(lastIndex, htmlWithIgParts.length - lastIndex)


    const chunks = result.split('<IgnoredPart>')
    if (chunks < 2) return result
    // return chunks.join('')
    let newHtml = ''
    for (let i = 0; i < ignoredParts.length; i++) {
        newHtml += chunks[i] + ignoredParts[i]
    }
    newHtml += chunks[chunks.length - 1]

    return newHtml

}


function replaceCurlyBracesWithMarkup(html) {
    const pattern = new RegExp('\\{\\{(.*?)\\|(.*?)\\|(.*?)\\|(.*?)\\|(.*?)\\}\\}', 'g')
    return html.replace(pattern, (match, method, target, type, originalSubstitute,fromTemplate) => {
        if (originalSubstitute) {
            target = target + '_substitute_' + originalSubstitute
        }

        const color = getColorForMethod(method)
       
        return `<selection class="${method}" data-t="${fromTemplate}" style="background-color:${color};">${target}</selection>`
    })

}




function addListenersToSelections() {
    const selections = document.getElementsByTagName('selection') 
    for (let i = 0; i < selections.length; i++) {
        let sel = selections[i]
        sel = removeListeners(sel)
        sel.addEventListener('click', (e) => {
            //  e.preventDefault()
            document.getSelection().removeAllRanges();
            const text = sel.innerHTML
            const chunks = text.split('_substitute_')
            const target = chunks[0]
            if (e.shiftKey) {
                let substitute = ''
                if (chunks.length === 2) {
                    substitute = chunks[1]
                }
                const newSubstitute = prompt("Substitute", substitute);
                if (newSubstitute == null) {
                    return
                }
                sel.innerHTML = newSubstitute ? target + '_substitute_' + newSubstitute : target

            } else if (e.altKey) {
                let newClassName = ''
                let color = ''
                if (sel.className === 'bc-y') {
                    newClassName = 'bc-y1'
                    color = 'gainsboro'
                } else if (sel.className === 'bc-y1') {
                    newClassName = 'bc-y2'
                    color = 'lightslategray;color:white'
                } else if (sel.className === 'bc-y2') {
                    newClassName = 'bc-y'
                    color = 'green;color:white'
                } else {
                    return
                }
                sel.outerHTML = `<selection class="${newClassName}" data-t="${sel.outerHTML.includes('data-t="true"') ? 'true' : ''}" style="background-color:${color};">` + sel.innerHTML + '</selection>'

            } else {
                if (sel.style.backgroundColor === 'blue' || sel.style.backgroundColor === 'violet') {
                    return
                }
                if (!['bc-y','bc-i'].includes(sel.className)) return
                const newClassName = ['bc-y',].includes(sel.className) ? 'bc-i' : 'bc-y'
                const color = newClassName === 'bc-y' ? 'green;color:white' : 'pink'
                sel.outerHTML = `<selection class="${newClassName}" data-t="${sel.outerHTML.includes('data-t="true"') ? 'true' : '' }" style="background-color:${color};">` + sel.innerHTML + '</selection>'
            }

            const currentLocation = window.location.toString()
            if (currentLocation.includes('localhost')) {
                currentHTML = document.body.innerHTML
            } else {
                currentHTML = new XMLSerializer().serializeToString(document.body)
            }
            currentHTML = removeProblematicPartsFromHtml(currentHTML)
            addToHistory(currentHTML)

        })
    }


}

function removeListeners(node) {
    const new_element = node.cloneNode(true);
    node.parentNode.replaceChild(new_element, node);
    return new_element
}



function createInstructions(forWikitext = false) {

    const occurrencesOfRawStrings = []


    const pattern = new RegExp(`<selection class="(${allClassesString.replace('marker|', '')})" data-t="(.*?)".*?:(.*?);">(.*?)</selection>`, 'gm')  //(<span.*?>.*?</span>)?


    let ignHtml = currentHTML
    if(!forWikitext){
        const { htmlWithIgParts } = htmlWithIgnoredParts(currentHTML)
        ignHtml = htmlWithIgParts

    }


    while ((result = pattern.exec(ignHtml))) {
        const method = result[1]
        const fromTemplate = result[2]
        const color = result[3]

        let type = 'normal'
        if (color === 'blue') type = 'bookTitle'
        if (color === 'violet') type = 'quote'

        const target = result[4]
        const chunks = target.split('_substitute_')
  
        const text = chunks[0]
        let substitute = ''
        if (chunks.length === 2) {
            substitute = chunks[1]
        }

        const obj = { index: result.index, length: result[0].length, method, text, type, substitute, fromTemplate }


        occurrencesOfRawStrings.push(obj)



    }

    let cleanTexts = []
    let lastIndex = 0

    let indexInOriginalText = 0
    occurrencesOfRawStrings.forEach(obj => {
        const fillerText = ignHtml.substr(lastIndex, obj.index - lastIndex)
        lastIndex = obj.index + obj.length
        const targetText = obj.text
        indexInOriginalText += fillerText.length

     

        cleanTexts.push({ text: fillerText, method: 'text' })
        cleanTexts.push({ text: targetText, method: obj.method, index: indexInOriginalText, type: obj.type, originalSubstitute: obj.substitute, fromTemplate:obj.fromTemplate })

        indexInOriginalText += targetText.length

    })
    const fillerText = ignHtml.substr(lastIndex, ignHtml.length - lastIndex)
    cleanTexts.push({ text: fillerText, method: 'text' })


    let cleanHTML = ''
    cleanTexts.forEach(obj => {
        cleanHTML += obj.text
    })


    
    
    if(!isOnWikipedia || forWikitext){
        let filteredCleanTexts = cleanTexts.filter(cleanTextObj => cleanTextObj.method !== 'text')
       

        if(forWikitext && !titleInURL.includes("Template:")){
            const prohibitedRanges = findTemplatesInHtml(ignHtml)
            filteredCleanTexts = filteredCleanTexts.filter(item => {
                for(let prohibitedRange of prohibitedRanges){
                    if(item.index > prohibitedRange.startIndex && item.index < prohibitedRange.endIndex) return false
                }
                return true
            })
        }
       
        const instructions = getFinalReplacementsForWeb(cleanHTML,filteredCleanTexts)
        

        
        return instructions
    }



    const instructions = []


    cleanTexts.forEach((cleanTextObj, index) => {
    
        if (cleanTextObj.method === 'text') {
            // skip
        } else {

            const left = getLeftSide(cleanTexts, index)
            const right = getRightSide(cleanTexts, index)


            const targetIndex = cleanTextObj.index
            const bigStringIndex = targetIndex - left.length
            const bigLine = left + cleanTextObj.text + right

            const stringOccurrences = getOccurrences2(cleanHTML, bigLine)

            let numberOfOccurrence = 1

            if (stringOccurrences.length !== 1) {
                numberOfOccurrence = getNumberOfOccurrence(stringOccurrences, bigStringIndex)
            }

            if(!cleanTextObj.text)return

            const targetOccurrences = getOccurrences2(bigLine, cleanTextObj.text)
            let numberOfTargetOccurrence = 1
            if (targetOccurrences.length !== 1) {
                const relTargetIndex = left.length
                numberOfTargetOccurrence = getNumberOfOccurrence(targetOccurrences, relTargetIndex)
            }

            const order = `${stringOccurrences.length}.${numberOfOccurrence}.${targetOccurrences.length}.${numberOfTargetOccurrence}`

            const instruction = {
                string: bigLine,
                target: cleanTextObj.text,
                method: cleanTextObj.method,
            }
            if (order !== '1.1.1.1') instruction['order'] = order
            if (cleanTextObj.type !== 'normal') instruction['type'] = cleanTextObj.type
            if (cleanTextObj.originalSubstitute) instruction['originalSubstitute'] = cleanTextObj.originalSubstitute
            if(cleanTextObj.fromTemplate)instruction['fromTemplate'] = true

            instructions.push(instruction)

        }
        
    })


    localReplacementsArray = []

    getLocalReplacements(cleanHTML, localReplacementsArray, currentPageData)
    localReplacementsArray = localReplacementsArray.map(item => {
        item.edit.targetIndex = item.index
        if(['bc-y-r1','bc-y-r2'].includes(item.edit.method))item.edit.method = 'bc-y'
        if(['bc-i-r1','bc-i-r2'].includes(item.edit.method))item.edit.method = 'bc-i'
        return item
    })



    localReplacementsArray = localReplacementsArray.sort((a, b) => a.edit.targetIndex - b.edit.targetIndex)


    const replacementsFromInstructions = getReplacementsFromEdits(instructions,cleanHTML)


    const finalInstructions = []

    replacementsFromInstructions.forEach((repFromInstr) => {
     
        const localReplacementInTheSamePlace = localReplacementsArray.find(localRep => localRep.index == repFromInstr.index)
        if(localReplacementInTheSamePlace && repFromInstr.replacement == localReplacementInTheSamePlace.replacement){
            //no instruction is needed
        }else{
            finalInstructions.push(repFromInstr.edit)
        }
    })
    
    return finalInstructions
}


function getOccurrences2(string, target) {

    
    const pattern = new RegExp(escapeText(target), 'g')
    const occurrences = []
    
    let result
    while ((result = pattern.exec(string))) {
        const obj = { index: result.index, length: result[0].length, text: result[0] }
        occurrences.push(obj)
    }

    return occurrences
}

function getNumberOfOccurrence(allMatches, neededIndex) {
    const index = allMatches.findIndex(item => item.index === neededIndex)
    if (index >= 0) return index + 1
    //console.log('something wrong', allMatches, 'nIndex', neededIndex)
    return index
}


function getLeftSide(array, index) {
    if (index <= 0) return ''
    let result = ''
    while (index > 0) {
        index--
        const obj = array[index]
        let text = obj.text
        let shouldReturn = false
        if (text.includes('<IgnoredPart>')) {
            const chunks = text.split('<IgnoredPart>')
            text = chunks[chunks.length - 1]
            shouldReturn = true
        }
        result = text + result
        if (result.length > 15) {
            return result.slice(result.length - 15, result.length)
        }
        if (shouldReturn) {
            return result
        }
    }
    return result
}

function getRightSide(array, index) {
    if (index >= array.length - 1) return ''
    let result = ''
    while (index < array.length - 1) {
        index++
        const obj = array[index]
        let text = obj.text
        let shouldReturn = false
        if (text.includes('<IgnoredPart>')) {
            const chunks = text.split('<IgnoredPart>')
            text = chunks[0]
            shouldReturn = true
        }
        result = result + text
        if (result.length > 15) {
            return result.slice(0, 15)
        }
        if (shouldReturn) {
            return result
        }
    }
    return result
}

function toggleTestingModeFromShortcut(){
    if(!isEditingMode)return
    isTestingMode = !isTestingMode
    if(isTestingMode){
        test()
    }else{
        backToEditing()
    }
}


function test() {
    finalInstructions = createInstructions()

    finalInstructions = finalInstructions.map(edit => {
        const newEdit = JSON.parse(JSON.stringify(edit))
        if(edit.method == 'bc-y-r2')newEdit.method = 'bc-y'
        if(['bc-y','bc-y-r1','bc-y-r2'].includes(edit.method))edit.method = 'bc-y'
        if(['bc-i','bc-i-r1','bc-i-r2'].includes(edit.method))edit.method = 'bc-i'
        return newEdit
    })

    htmlBeforeTesting = currentHTML


    setBodyFromHTML(originalHTML)


    if(isOnWikipedia){
        translateEverything(null,JSON.parse(JSON.stringify(finalInstructions)))
    }else{    
        translateEverythingOnWeb(null,JSON.parse(JSON.stringify(finalInstructions)))
    }


    currentHTML = new XMLSerializer().serializeToString(document.body)
    currentHTML = removeProblematicPartsFromHtml(currentHTML)
    setBodyFromCurrentHTML()
   

}


function backToEditing() {
    currentHTML = htmlBeforeTesting
    setBodyFromCurrentHTML()
    addListenersToSelections()
}


async function sendToServer() {


    if(!isOnWikipedia){
        showPopupWithInstructions()
        return
    }

    if(!kIsDevEnv){
        alert("You can't save data related to Wikipedia at this moment.")
        return
    }
   
    let currentLocation = window.location.toString()
    currentLocation = currentLocation.split('?')[0].split('#')[0]

    const editsWithLongMethodNames = finalInstructions.map(edit =>( {...edit,method:shortToLongMethodConversions[edit.method]}))


    const data = {
        url: currentLocation,
        edits: editsWithLongMethodNames
    }
    const result = await fetch('http://localhost:3200/api/pages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })


    const json = await result.json()
    pageId = json.id


    if(pageId && kIsDevEnv){
        window.open(`http://localhost:3000/#/translatedPages/${pageId}/show`)
    }

    

}


function findTemplatesInHtml(html){
    const reg = new RegExp("(<table[\\s\\S]*?>|Template:|</table>)","gm")


    let allTablesArray = [] //{startIndex,endIndex,childTables:[],isTemplate}[]
    let stack = []
    let result 
    while((result = reg.exec(html))){
        if(result[0] === "</table>"){
            if(!stack.length)continue 
            const currentTable = stack[stack.length - 1]
            currentTable.endIndex = result.index + "</table>".length
            stack.pop()
        }else if(result[0] === "Template:"){
            if(!stack.length)continue
            const currentTable = stack[stack.length - 1]
            currentTable.isTemplate = true
        }else{
            const startIndex = result.index
            const tableObj = {startIndex,endIndex:-1,childTables:[],isTemplate:false}
            if(stack.length){
                const parent = stack[stack.length - 1]
                parent.childTables.push(tableObj)
            }else{
                allTablesArray.push(tableObj)
            }
            stack.push(tableObj)

        }
    }



    let prohibitedRanges = []
    for(let tableInfo of allTablesArray){
      
        const ranges = getProhibitedRangesFromTemplateInfo(tableInfo)
        if(ranges && ranges.length){
            prohibitedRanges = prohibitedRanges.concat(ranges)
        }
    }


    return prohibitedRanges

    
}


function getProhibitedRangesFromTemplateInfo(oneTableInfo){
    if(oneTableInfo.isTemplate) return [{startIndex:oneTableInfo.startIndex, endIndex:oneTableInfo.endIndex}]
    let result = []
    for(let childTable of oneTableInfo.childTables){
        const childRanges = getProhibitedRangesFromTemplateInfo(childTable)
        if(childRanges){
            result = result.concat(childRanges)
        }
    }
    if(result.length)return result
    return null
}




async function startWikitextEditing(){
    if(!isOnWikipedia)return

    finalInstructions = createInstructions(true)
    finalInstructions = finalInstructions.map(instruction => ({...instruction,string:removeEscapesFromSemicolons(instruction.string)}))


   let wikitext = await getWikitextForPage()



   if(!wikitext)return


   wikitext = escapeHtml(wikitext)


   wikitext = moveRefsToBottom(wikitext)


   initialWikitext = wikitext


   initialInstructionsForWikitext = finalInstructions


   const {wikitextWithDates,updatedInstructions} = findDatesInWikitext(finalInstructions,wikitext)

   currentWikitext = wikitextWithDates
    

    const popup = document.createElement('div')
    popup.className = 'wikitextPopup'
    popup.innerHTML = `
        <a href="#" id="wikitextPopupCloseButton" class="popup-close">&times;</a>
        <div class="wikitextPopupLeftColumn">
            <textarea class="wikitextPopup-textarea" style="display: none;"></textarea>
            <iframe name="wikitextEditor" id="wikitextEditor" width="100%" height="90%"></iframe>
       
            <div class="wikitextPopupBottomBar">
                <span>Threshhold:</span>
                <input id="thresholdInput" style="width:50px;"/>
                <button id="recalculateButton" disabled>Recalculate</button>
                <button id="wikitextPopupSubsButton">__substitute__</button>
                <button id="wikitextPopupBCButton">&amp;nbsp;BC</button>
                <button id="wikitextPopupBCEButton">&amp;nbsp;BCE</button>
                <button id="generateMarkupButton">Generate markup</button>
                <button id="copyWikitextButton">Copy</button>
                <button id="gotoWikipediaButton">Go to Wikipedia</button>



            </div>
       
         </div>

        <div class="sidebarWithDates">
            ${renderListOfEditsInSideBar(updatedInstructions)}   
        </div>
    `
    document.body.appendChild(popup)
    wikitextEditor.document.designMode = "on";

    markupGenerated = false


    renderCurrentWikitext()

    const closeButton = popup.getElementsByClassName('popup-close')[0]
    closeButton.addEventListener('click', () => {
        isEditingWikitext = false
        chrome.storage.local.set({ isEditingWikitext }, function () {})
        chrome.runtime.sendMessage('wikitextEditingPopupClosed')
        popup.parentElement.removeChild(popup)
    })


    const subsButton = document.getElementById('wikitextPopupSubsButton')
    subsButton.addEventListener('click', addSubstituteInWikitext)
    
    const bcButton = document.getElementById('wikitextPopupBCButton')
    bcButton.addEventListener('click', addBCInWikitext)

    const bceButton = document.getElementById('wikitextPopupBCEButton')
    bceButton.addEventListener('click', addBCEInWikitext)

    const generateWikiMarkupButton = document.getElementById('generateMarkupButton')
    generateWikiMarkupButton.addEventListener('click', generateWikiMarkup)

    const copyWikitextButton = document.getElementById('copyWikitextButton')
    copyWikitextButton.addEventListener('click', copyWikitextToClipboard)

    const openWikipediaButton = document.getElementById('gotoWikipediaButton')
    openWikipediaButton.addEventListener('click', openEditorOnWikipedia)

    const thresholdInput = document.getElementById('thresholdInput')
    const recalculateButton = document.getElementById('recalculateButton')

    thresholdInput.value = `${threshold}`
    thresholdInput.addEventListener('input', thresholdInputDidChange)
    recalculateButton.addEventListener('click', recalculateButtonPressed)


  
    
}


function renderListOfEditsInSideBar(instructions){
    return instructions.map(item => `
            <div class="sideListRow">
                <div class="sideListTextContainer"><p>${markupDateInSideList(item.string,item.target,item.method,item.order,item.originalSubstitute)}</p></div>
                <span class="sideListExclamation">${item.isSus ? "!" : (item.notFound ? "!!" : " ")}</span>
            </div>
            `).join("\n")
}


function markupDateInSideList(string,target,method,order,originalSubstitute){

    if (!order) order = '1.1.1.1'

    const orderChunks = order.split('.').map(chunk => parseInt(chunk, 10))
    if (orderChunks.length !== 4) {
        console.log('orderChunks.length !== 4 (in a date for wikitext)')
        return string
    }

    const target_oc = orderChunks[3]


    const index = findIndexOfSubstringOccurrence(string, target, target_oc)

    const left =  string.substr(0, index)

    const right = string.substr(index + target.length,string.length - 1)


    const finalString = left + `<span class="${method.replace('-','-editing-')}" s="${originalSubstitute}">${target}</span>` + right

    return finalString
}



function showPopupWithInstructions(){
    const nReg = new RegExp('\n','g')
    const tReg = new RegExp('\t','g')
    let lines = finalInstructions.map(({string,target,method,type,originalSubstitute,order,fromTemplate}) => {

        string = string.replace(nReg,'\\n').replace(tReg,'\\t')

        return `${string};${target};${method};${type ?? ""};${order ? order : ""};${originalSubstitute ? originalSubstitute : ""};${fromTemplate ? "1" : ""}`
    })


    lines = ['<poem><nowiki>'].concat(lines).concat([
        '</nowiki></poem>',
        '[[Category:Pages with dates]]',
        `[[Category:${domain}]]`
    ])

    const finalText = lines.join('\n')


    const url = getPageUrlOnMyServerForEditing()


    const popup = document.createElement('div')
    popup.className = 'popup'
    popup.innerHTML = `
        <a href="#" class="popup-close">&times;</a>
		<textarea class="popup-input">${finalText}</textarea>
		<a href="#" class="popup-link">Copy to clipboard and open data page on the server</a>
    `
    document.body.appendChild(popup)

    const closeButton = popup.getElementsByClassName('popup-close')[0]
    closeButton.addEventListener('click', () => {
        popup.parentElement.removeChild(popup)
    })

    const linkButton = popup.getElementsByClassName('popup-link')[0]
    linkButton.addEventListener('click', async() => {
        try {
            await navigator.clipboard.writeText(finalText);
        } catch (err) {
            console.error('Failed to copy to clipboard: ', err);
        }
        window.open(url)
    })
}





function getFinalReplacementsForWeb(cleanHTML,cleanTexts){
 


    localReplacementsArray = []

    getLocalReplacements(cleanHTML, localReplacementsArray, currentPageData)
    localReplacementsArray = localReplacementsArray.map(item => {
        item.edit.targetIndex = item.index
        if(['bc-y-r1','bc-y-r2'].includes(item.edit.method))item.edit.method = 'bc-y'
        if(['bc-i-r1','bc-i-r2'].includes(item.edit.method))item.edit.method = 'bc-i'
        return item
    })



    localReplacementsArray = localReplacementsArray.sort((a, b) => a.edit.targetIndex - b.edit.targetIndex)



    const filteredCleanTexts = []
    cleanTexts.forEach((cleanText) => {
     
        const localReplacementInTheSamePlace = localReplacementsArray.find(localRep => localRep.index == cleanText.index)
        if(localReplacementInTheSamePlace && 
            cleanText.method == localReplacementInTheSamePlace.edit.method &&
            cleanText.text == localReplacementInTheSamePlace.edit.target &&
            cleanText.type == localReplacementInTheSamePlace.edit.type &&
            cleanText.originalSubstitute == localReplacementInTheSamePlace.edit.originalSubstitute
            ){
            //no instruction is needed
        }else{
            filteredCleanTexts.push(cleanText)
        }
    })



    const {result:text,insertions} = extractTextFromHtml(cleanHTML)
    const replacementsInText = moveReplacementsHtmlToText(cleanHTML,text,insertions,filteredCleanTexts)


    const finalInstructions = []
    replacementsInText.forEach((edit) => {
     
            const left = getLeftSideInText(text,edit)
            const right = getRightSideInText(text,edit)


            const targetIndex = edit.index
            const bigStringIndex = targetIndex - left.length

            const bigLine = left + edit.text + right

            const stringOccurrences = getOccurrences2(text, bigLine)

            let numberOfOccurrence = 1

            if (stringOccurrences.length !== 1) {
                numberOfOccurrence = getNumberOfOccurrence(stringOccurrences, bigStringIndex)
            }

            if(!edit.text)return

            const targetOccurrences = getOccurrences2(bigLine, edit.text)
            let numberOfTargetOccurrence = 1
            if (targetOccurrences.length !== 1) {
                const relTargetIndex = left.length
                numberOfTargetOccurrence = getNumberOfOccurrence(targetOccurrences, relTargetIndex)
            }

            const order = `${stringOccurrences.length}.${numberOfOccurrence}.${targetOccurrences.length}.${numberOfTargetOccurrence}`

            const instruction = {
                string: addEscapesToSemicolons(bigLine),
                target: edit.text,
                method: edit.method,
            }
            if (order !== '1.1.1.1') instruction['order'] = order
            if (edit.type !== 'normal') instruction['type'] = edit.type
            if (edit.originalSubstitute) instruction['originalSubstitute'] = edit.originalSubstitute
          //  if(edit.fromTemplate)instruction['fromTemplate'] = true

          finalInstructions.push(instruction)


        
    })

    return finalInstructions

}


function getLeftSideInText(text,edit) {
    if (edit.index <= 0) return ''
    let startIndex = Math.max(edit.index - 15,0)
    const leftPart = text.slice(startIndex,edit.index)
    return leftPart

}

function getRightSideInText(text,edit) {
    if (edit.index >= text.length - 1) return ''
    let startIndex = edit.index + edit.text.length
    let endIndex = Math.min(startIndex + 15,text.length - 1)
    const rightPart = text.slice(startIndex,endIndex)
    return rightPart
}