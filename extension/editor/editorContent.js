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
let texts = []
let tags = []


const allClassesString = allClasses.join('|')



function onEditorLoad() {
//     if(!isEditingMode)return
     console.log('editing mode')
//     //disableAllLinks()
     setInitialHtml()
     addToHistory(currentHTML)
     openAllWikipediaDropDowns(()=>{

 
//    // getPageData()

    editsFromServer = editsArray


    loadEdits(editsFromServer,true,false)


    if (document.addEventListener) {
        console.log('addeventlistener')
        document.addEventListener('click', interceptClickEvent);
    }

    })
 
}


function setInitialHtml() {

    let currentLocation = window.location.toString()
 
    const inner = document.body.innerHTML
    console.log('inner', inner)

    if (currentLocation.includes('localhost')) {
        // const p = document.getElementsByClassName('p')
        // console.log('PPP', p)
        originalHTML = document.body.innerHTML
    } else {
        originalHTML = new XMLSerializer().serializeToString(document.body)
    }


   // originalHTML = removeProblematicPartsFromHtml(originalHTML)

    currentHTML = originalHTML

}

function openAllWikipediaDropDowns(callback){
    if(!currentLocation || !currentLocation.includes('en.wikipedia.org'))return
    console.log('we are on wikipedia')

    setTimeout(() => {
        const links = document.getElementsByClassName('mw-collapsible-text')
        console.log('links',links)
    
        console.log('links.length',Array.from(links).length)
    
    
        // links.forEach(link => {
        //     console.log('link:',link)
    
        // })
    
     
    
        Array.prototype.forEach.call(links, link => {
            if(link.innerHTML == "show"){
                console.log('link:',link)
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





function loadEdits(edits,shouldFixBrokenEdits = false,showOnlyFixed = false){
    if (currentIndexInHistory !== 0) {
        alert("can't load after edits")
        return
    }
  //  currentHTML = currentHTML.replace(/mw-collapsed/g, 'mw-expanded')




    console.log('edits',edits)
    console.log('shouldFixBrokenEdits',shouldFixBrokenEdits)
    console.log('showOnlyFixed',showOnlyFixed)
    const htmlWithMarkers = createHTMLWithMarkersForEditor(edits,shouldFixBrokenEdits,showOnlyFixed)
    currentHTML = replaceCurlyBracesWithMarkup(htmlWithMarkers)

    

   // currentHTML = currentHTML.replace(/mw-collapsed/g, 'mw-expanded')

    console.log('html after download',currentHTML)


    setBodyFromCurrentHTML()
    addToHistory(currentHTML)

    instructions = edits
}




function createHTMLWithMarkersForEditor(editsArray,shouldFixBrokenEdits = false,showOnlyFixed = false) {

    let html = new XMLSerializer().serializeToString(document.body)
    html = removeProblematicPartsFromHtml(html)

    const { htmlWithIgParts, ignoredParts } = htmlWithIgnoredParts(html)

    console.log('htmlwithig length',htmlWithIgParts.length)
    console.log('ig parts length',ignoredParts.length)

    let replacements = getReplacementsFromEdits(editsArray,htmlWithIgParts)
   
    console.log('replacements from edits',replacements)
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

    console.log('filtered replacements',replacements)

    if(shouldFixBrokenEdits){
        const fixedEdits = fixBrokenEdits(gaps,htmlWithIgParts)
        if(showOnlyFixed){
            replacements = fixedEdits
        }else{
            replacements = replacements.concat(fixedEdits)
        }
    }

    console.log('replacements after fixing',replacements)


    let localReplacementsArray = []

    findIfPageIsAboutEarlyCenturyOrMillennium(html)


    getLocalReplacements(htmlWithIgParts, localReplacementsArray, currentPageData)
    console.log('local replacements', localReplacementsArray)
    localReplacementsArray = localReplacementsArray.map(item => {
        item.edit.targetIndex = item.index
        if(['bc-y','bc-y-r1','bc-y-r2'].includes(item.edit.method))item.edit.method = 'year'
        if(['bc-i','bc-i-r1','bc-i-r2'].includes(item.edit.method))item.edit.method = 'impreciseYear'
        return item
    })

    console.log('replacmenents from server',replacements)
    replacements = resolveReplacements(localReplacementsArray, replacements)

    replacements = replacements.sort((a, b) => a.edit.targetIndex - b.edit.targetIndex)


    console.log('local replacements',localReplacementsArray)
    console.log('number of replacements',replacements.length)
  



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
    console.log('replaceCurlyBracesWithMarkup html', html)
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
        // console.log('target', target)
        // console.log('method', method)
        // console.log('type', type)


        return `<selection class="${method}" data-t="${fromTemplate}" style="background-color:${color};">${target}</selection>`
    })

}




function addListenersToSelections() {
    const selections = document.getElementsByTagName('selection') 
    console.log('selection', selections[0])
    for (let i = 0; i < selections.length; i++) {
        let sel = selections[i]
        sel = removeListeners(sel)
        sel.addEventListener('click', (e) => {
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


    const text = extractTextFromHtml(ignHtml)
    


    console.log('ignHtml before creating instructions', ignHtml)

    console.log('clean text',text)

    while ((result = pattern.exec(ignHtml))) {
        console.log('result',result)
        const fromTemplate = result[2]
        const color = result[3]

        console.log('color', color)
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
        console.log('substitute', substitute)

        const obj = { index: result.index, length: result[0].length, method: result[1], text, type, substitute, fromTemplate }


        occurrencesOfRawStrings.push(obj)



    }
    console.log('indexes of raw strings', occurrencesOfRawStrings)







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

    console.log('cleanTexts', cleanTexts)

    let cleanHTML = ''
    cleanTexts.forEach(obj => {
        cleanHTML += obj.text
    })


    const instructions = []

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

    console.log('instructions', JSON.stringify(instructions))

    return instructions


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
    console.log('original index', index)
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



function test() {
    console.log('test')
    instructions = createInstructions()
    console.log('instructions',instructions)

    chrome.storage.local.set({ instructions }, function () {
        console.log('instructions saved')
    })

    //  const originalWithOpenedViews = originalHTML.replace(/mw-collapsed/g, 'mw-expanded')
    setBodyFromHTML(originalHTML)

    const htmlWithMarkers = createHTMLWithMarkersForEditor(instructions)

    console.log('htmlWithMarkers100',htmlWithMarkers)
    const parser = new DOMParser();
    const cleanHtml = removeAttributesFromTags(htmlWithMarkers)
    const bodyDOM = parser.parseFromString(cleanHtml, "text/xml");

    textsArray = []
    getTextsArray(bodyDOM.documentElement)

    textNodesArray = []
    getTextNodesArray(document.body)

    console.log('textsArray',textsArray)
    console.log('textNodesArray',textNodesArray)


    // const textInFirstNode = textNodesArray[1].firstNode.data
  
    // if(textNodesArray.length < textsArray.length){
  
    //     const index = textsArray.findIndex(item => {
    //         return textInFirstNode === item
    //     })

       
    //     if(index > 0){
    //         textsArray.splice(0, index);
    //     }
    // }


    doReplacements()
    htmlBeforeTesting = currentHTML
    currentHTML = new XMLSerializer().serializeToString(document.body)
    currentHTML = removeProblematicPartsFromHtml(currentHTML)
    //currentHTML = currentHTML.replace(/mw-collapsed/g, 'mw-expanded')
    setBodyFromCurrentHTML()
   // openAllWikipediaDropDowns()
   

}


function backToEditing() {
    currentHTML = htmlBeforeTesting
    setBodyFromCurrentHTML()
    addListenersToSelections()
}


function doReplacements2() {
    for (let i = 0; i < textsArray.length; i++) {
        const text = textsArray[i]
        const node = textNodesArray[i]
        replaceTextInNodeIfNeeded(node, text)
    }
}