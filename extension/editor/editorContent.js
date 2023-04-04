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
//let isServerDataReady = false

let originalHTML = ''

let htmlBeforeTesting = ''


let instructions = []
let finalInstructions = []
let texts = []
let tags = []

let localReplacementsArray = []


const allClassesString = allClasses.join('|')



function onEditorLoad() {
     if(!isEditingMode)return
     console.log('editing mode')
     setInitialHtml()
     addToHistory(currentHTML)
     openAllWikipediaDropDowns(()=>{
        openAllBritannicaDropDowns(() => {
            editsFromServer = editsArray
        
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
    if(!currentLocation || !currentLocation.includes('britannica.com')){
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
            //tell the browser not to respond to the link click
            e.preventDefault();
        }

    }else{
        console.log('target.tagName',target.tagName)
      //  e.preventDefault();
    }
}


chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.log('message',message)
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
        case 'findNumbersWithBCs':
            selectNumbersWithBCs()
            break
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
            sendResponse({isTestingMode,selectionMode})
            break
        case 'toggleTestingMode':{
            console.log('toggleTestingMode')
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

    


    setBodyFromCurrentHTML()
    addToHistory(currentHTML)

    instructions = editsFromServer
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
        console.log('replacements',replacements)
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
            console.log('currentGap',currentGap)
            currentGap = null
        }

    })


    const filteredEdits = replacements.filter(rep => !rep.isBroken)

    pageHasIssues = filteredEdits.length !== replacements.length
    replacements = filteredEdits

    console.log('filteredEdits',filteredEdits)


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
        console.log('replacements before moving to html',replacements)
        moveReplacementsFromTextToHtml(text,htmlWithIgParts,replacements, finalReplacements, insertions)
    }

    console.log('final replacements',finalReplacements)


    localReplacementsArray = []

    findIfPageIsAboutEarlyCenturyOrMillennium(html)


    getLocalReplacements(htmlWithIgParts, localReplacementsArray, currentPageData)
    localReplacementsArray = localReplacementsArray.map(item => {
        item.edit.targetIndex = item.index
        if(['bc-y','bc-y-r1','bc-y-r2'].includes(item.edit.method))item.edit.method = 'year'
        if(['bc-i','bc-i-r1','bc-i-r2'].includes(item.edit.method))item.edit.method = 'impreciseYear'
        return item
    })

    console.log('local replacements',localReplacementsArray)

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
        let color = 'red'
        if (originalSubstitute) {
            target = target + '_substitute_' + originalSubstitute
        }
        switch (method) {
            case 'year':
            case 'bc-y':
            case 'bc-y-r1':
            case 'bc-y-r2':
                color = 'green'
                break
            case 'ad-y':
                color = 'rosyBrown'
                break
            case 'bc-y1':
            case 'oneDigitYear':
                color = 'gainsboro'
                break
            case 'bc-y2':
            case 'twoDigitYear':
                color = 'dimgray'
                break
            case 'bc-i':
            case 'bc-i-r1':
            case 'bc-i-r2':
            case 'impreciseYear':
                color = 'pink'
                break
            case 'decade':
                color = 'olive'
                break
            case 'century':
                color = 'orange'
                break
            case '00s':
                color = 'coral'
                break
            case 'millennium':
                color = 'darkcyan'
                break
            case '000s':
                color = 'blueViolet'
                break
            case 'remove':
                color = 'brown'
                break
            case 'OE':
                color = 'aqua'
                break
            case 'ofOE':
                color = 'lime'
                break
            case 'bc-ig':
                color = 'dimgray'
                break
            default:
                color = 'red'
        }

        if (type === 'quote') {
            color = 'violet'
        } else if (type === 'bookTitle') {
            color = 'blue'
        }
     

        return `<selection class="${method}" data-t="${fromTemplate}" style="background-color:${color};">${target}</selection>`
    })

}




function addListenersToSelections() {
    const selections = document.getElementsByTagName('selection') 
    for (let i = 0; i < selections.length; i++) {
        let sel = selections[i]
        sel = removeListeners(sel)
        sel.addEventListener('click', (e) => {
            console.log('selection', sel)
            //  e.preventDefault()
            document.getSelection().removeAllRanges();
            console.log('clicked', e)
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
                    console.log('cancel')
                    return
                }
                sel.innerHTML = newSubstitute ? target + '_substitute_' + newSubstitute : target

            } else if (e.altKey) {
                let newClassName = ''
                let color = ''
                if (sel.className === 'year') {
                    newClassName = 'oneDigitYear'
                    color = 'gainsboro'
                } else if (sel.className === 'oneDigitYear') {
                    newClassName = 'twoDigitYear'
                    color = 'dimgray'
                } else if (sel.className === 'twoDigitYear') {
                    newClassName = 'year'
                    color = 'green'
                } else {
                    return
                }
                sel.outerHTML = `<selection class="${newClassName}" data-t="${sel.outerHTML.includes('data-t="true"') ? 'true' : ''}" style="background-color:${color};">` + sel.innerHTML + '</selection>'

            } else {
                console.log('style', sel.style)
                if (sel.style.backgroundColor === 'blue' || sel.style.backgroundColor === 'violet') {
                    console.log('yes')
                    return
                }
                console.log('className',sel.className)
                if (!['year','impreciseYear'].includes(sel.className)) return
                const newClassName = ['year',].includes(sel.className) ? 'impreciseYear' : 'year'
                const color = newClassName === 'year' ? 'green' : 'pink'
                sel.outerHTML = `<selection class="${newClassName}" data-t="${sel.outerHTML.includes('data-t="true"') ? 'true' : '' }" style="background-color:${color};">` + sel.innerHTML + '</selection>'
            }

            const currentLocation = window.location.toString()
            if (currentLocation.includes('localhost')) {
                // const p = document.getElementsByClassName('p')[0]
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

function yearNumberClicked() {
    console.log('year number clicked')
}


function createInstructions() {
    console.log('createInstructions')

    const occurrencesOfRawStrings = []


    const pattern = new RegExp(`<selection class="(${allClassesString.replace('marker|', '')})" data-t="(.*?)".*?:(.*?);">(.*?)</selection>`, 'gm')  //(<span.*?>.*?</span>)?



    const { htmlWithIgParts: ignHtml } = htmlWithIgnoredParts(currentHTML)




    while ((result = pattern.exec(ignHtml))) {
        const method = result[1]
        const fromTemplate = result[2]
        const color = result[3]
        
      

      //  console.log('color', color)
        let type = 'normal'
        if (color === 'blue') type = 'bookTitle'
        if (color === 'violet') type = 'quote'

        const target = result[4]
        const chunks = target.split('_substitute_')
       // console.log('result[0]', result[0])
      //  console.log('target', target)
      //  console.log('chunks', chunks)
        const text = chunks[0]
        let substitute = ''
        if (chunks.length === 2) {
            substitute = chunks[1]
        }
      //  console.log('substitute', substitute)

        const obj = { index: result.index, length: result[0].length, method, text, type, substitute, fromTemplate }


        occurrencesOfRawStrings.push(obj)



    }

    // console.log('all replacements', occurrencesOfRawStrings)
    // console.log('local replacements',localReplacementsArray)







    const cleanTexts = []
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

    //console.log('cleanTexts', cleanTexts)

    let cleanHTML = ''
    cleanTexts.forEach(obj => {
        cleanHTML += obj.text
    })


    if(!isOnWikipedia){
        const instructions = getFinalReplacementsForWeb(cleanHTML,cleanTexts.filter(obj => obj.method !== 'text'))
        return instructions
    }

    cleanTexts.forEach((cleanTextObj, index) => {
        if (cleanTextObj.method === 'text') {
            // currentIndex += cleanTextObj.text.length
        } else {
            // console.log('currentIndex', currentIndex)

            const left = getLeftSide(cleanTexts, index)
            const right = getRightSide(cleanTexts, index)


            const targetIndex = cleanTextObj.index
            //console.log('target index', targetIndex)
            const bigStringIndex = targetIndex - left.length

            //console.log('string index', bigStringIndex)





            // console.log('left', left)
            // console.log('right', right)
            const bigLine = left + cleanTextObj.text + right
            const stringOccurrences = getOccurrences2(cleanHTML, bigLine)

            let numberOfOccurrence = 1

            if (stringOccurrences.length !== 1) {
                //console.log('line to find:', bigLine)
                numberOfOccurrence = getNumberOfOccurrence(stringOccurrences, bigStringIndex)
            }

            if(!cleanTextObj.text)return

            const targetOccurrences = getOccurrences2(bigLine, cleanTextObj.text)
            let numberOfTargetOccurrence = 1
            if (targetOccurrences.length !== 1) {
                const relTargetIndex = left.length
                numberOfTargetOccurrence = getNumberOfOccurrence(targetOccurrences, relTargetIndex)
            }


            //console.log('cleanTextObj', cleanTextObj)

           
            // console.log('bigLine: ', bigLine)
            // console.log('target', cleanTextObj.text)
            // console.log('calculated target index', cleanTextObj.index)

            // console.log('string occurrences', stringOccurrences.length)
            // console.log('needed index', bigStringIndex)
            // console.log('numberOfOccurrence', numberOfOccurrence)

            // console.log('number of target occurrences', targetOccurrences.length)
            // console.log('numberOfTargetOccurrence', numberOfTargetOccurrence)



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

    console.log('instructions',instructions)

    localReplacementsArray = []

    getLocalReplacements(cleanHTML, localReplacementsArray, currentPageData)
    localReplacementsArray = localReplacementsArray.map(item => {
        item.edit.targetIndex = item.index
        if(['bc-y','bc-y-r1','bc-y-r2'].includes(item.edit.method))item.edit.method = 'year'
        if(['bc-i','bc-i-r1','bc-i-r2'].includes(item.edit.method))item.edit.method = 'impreciseYear'
        return item
    })



    localReplacementsArray = localReplacementsArray.sort((a, b) => a.edit.targetIndex - b.edit.targetIndex)


    const replacementsFromInstructions = getReplacementsFromEdits(instructions,cleanHTML)

    console.log('replacementsFromInstructions',replacementsFromInstructions)

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
    console.log('something wrong', allMatches, 'nIndex', neededIndex)
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
            return result.substr(result.length - 15, 15)
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
            return result.substr(0, 15)
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
    console.log('test')
    finalInstructions = createInstructions()

    console.log('finalInstructions before',JSON.stringify(finalInstructions))
    finalInstructions = finalInstructions.map(edit => {
        const newEdit = JSON.parse(JSON.stringify(edit))
        if(edit.method == 'bc-y-r2')newEdit.method = 'year'
        if(['bc-y','bc-y-r1','bc-y-r2'].includes(edit.method))edit.method = 'year'
        if(['bc-i','bc-i-r1','bc-i-r2'].includes(edit.method))edit.method = 'impreciseYear'
        return newEdit
    })




    // chrome.storage.local.set({ instructions }, function () {
    //     console.log('instructions saved')
    // })

    htmlBeforeTesting = currentHTML


    setBodyFromHTML(originalHTML)


    if(isOnWikipedia){
        translateEverything(null,JSON.parse(JSON.stringify(finalInstructions)))
    }else{
        const lines = finalInstructions.map(({string,target,method,type,order,fromTemplate}) => {
            return `${string};${target};${method};${type ?? ""};${order ? order : ""};${fromTemplate ? "1" : ""}`
        })
    
        const finalText = lines.join('\n')
    
        console.log('finalInstructions',JSON.stringify(finalInstructions))
    
        console.log('finalText:\n',finalText)
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
    console.log('send to server')
    // if(!isTestingMode){
    //     alert('Editing mode')
    //     return 
    // }

    if(!isOnWikipedia){
        //TODO:show popup
        return
    }
   
    let currentLocation = window.location.toString()
    currentLocation = currentLocation.split('?')[0].split('#')[0]
    console.log('url', currentLocation)
    console.log('edits', finalInstructions)


    const data = {
        url: currentLocation,
        edits: finalInstructions
    }
    const result = await fetch('http://localhost:3200/api/pages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })

    console.log('post result', result)

    const json = await result.json()
    pageId = json.id


    if(pageId){
        window.open(`http://localhost:3000/#/translatedPages/${pageId}/show`)
    }

    

}



function getFinalReplacementsForWeb(cleanHTML,cleanTexts){
 


    localReplacementsArray = []

    getLocalReplacements(cleanHTML, localReplacementsArray, currentPageData)
    localReplacementsArray = localReplacementsArray.map(item => {
        item.edit.targetIndex = item.index
        if(['bc-y','bc-y-r1','bc-y-r2'].includes(item.edit.method))item.edit.method = 'year'
        if(['bc-i','bc-i-r1','bc-i-r2'].includes(item.edit.method))item.edit.method = 'impreciseYear'
        return item
    })



    localReplacementsArray = localReplacementsArray.sort((a, b) => a.edit.targetIndex - b.edit.targetIndex)


    console.log('cleanTexts',cleanTexts)
    console.log('localReplacementsArray',localReplacementsArray)



    //const replacementsFromInstructions = getReplacementsFromEdits(instructions,cleanHTML)




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


    console.log('filteredCleanTexts',filteredCleanTexts)

    const {result:text,insertions} = extractTextFromHtml(cleanHTML)
    console.log('text',text)
    const replacementsInText = moveReplacementsHtmlToText(cleanHTML,text,insertions,filteredCleanTexts)

    console.log('replacementsInText',replacementsInText)



    const finalInstructions = []
    replacementsInText.forEach((edit) => {
     
            const left = getLeftSideInText(text,edit)
            const right = getRightSideInText(text,edit)


            const targetIndex = edit.index
            const bigStringIndex = targetIndex - left.length

            const bigLine = left + edit.text + right

            console.log('bigLine',bigLine)
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
                string: bigLine,
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