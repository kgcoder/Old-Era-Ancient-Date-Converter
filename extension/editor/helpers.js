/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */


function getOrderChunks(order){
    if (!order) order = '1.1.1.1'
    let orderChunks = order.split('.')
    if(orderChunks.length !== 4)return orderChunks

    if(isOnWikipedia && orderChunks[0].includes("d")){
        const firstChunk = orderChunks[0].replace("d","")
        orderChunks[0] = firstChunk

        orderChunks = orderChunks.map(chunk => parseInt(chunk, 10))

        if(!titleInURL.includes("Template:")){
            orderChunks[0] = Math.max(Math.floor(orderChunks[0]/2),1)
        }

    }else{
        orderChunks = orderChunks.map(chunk => parseInt(chunk, 10))
    }

    return orderChunks
}




function getReplacementsFromEdits(edits, htmlWithIgParts){
    
    if(!edits || !edits.length)return []

    const myNewReplacements = edits.map((edit) => {

    

        let { string, target, method, order, type, originalSubstitute, fromTemplate } = edit
        
        const orderChunks = getOrderChunks(order)


        if (orderChunks.length !== 4) {
            console.log('not 4', edit)
            return {edit,isBroken:true}//"no good"
        }

        const [string_num_of_oc, string_oc, target_num_of_oc, target_oc] = orderChunks

        const pattern1 = new RegExp(escapeText(string), 'g')
        const matchesCount = (htmlWithIgParts.match(pattern1) || []).length

        if (matchesCount != string_num_of_oc) {
            console.log('matchesCount != string_num_of_oc',edit)
            console.log('matchesCount',matchesCount)
            console.log('string_num_of_oc',string_num_of_oc)
            return {edit,isBroken:true}//"no good"
        }

        if (string_oc < 1 || string_oc > string_num_of_oc) {
            console.log('string_oc < 1 || string_oc > string_num_of_oc')
            return {edit,isBroken:true}//"no good"
        }

        const pattern2 = new RegExp(escapeText(target), 'g')
        const targetMatchesCount = (string.match(pattern2) || []).length

        if (targetMatchesCount != target_num_of_oc) {
            onsole.log('targetMatchesCount != target_num_of_oc')
            return {edit,isBroken:true}//"no good"
        }

        if (target_oc < 1 || target_oc > target_num_of_oc) {
            onsole.log('target_oc < 1 || target_oc > target_num_of_oc')
            return {edit,isBroken:true}//"no good"
        }


        const index1 = findIndexOfSubstringOccurrence(htmlWithIgParts, string, string_oc)
        const index2 = findIndexOfSubstringOccurrence(string, target, target_oc)

        const index = index1 + index2

        if(index){
            edit.targetIndex = index
        }

        const length = target.length

       
      return { isBroken:false, edit, index, length, replacement: createMarkerForEditor(target, method, type, originalSubstitute, fromTemplate) }


    })


    return myNewReplacements
}



function findIndexOfSubstringOccurrence(parentString, substring, occurrenceNumber) {
    let startIndex = 0, index

    const indices = []
    while ((index = parentString.indexOf(substring, startIndex)) > -1) {
        indices.push(index)
        startIndex = index + substring.length

    }

    return indices[occurrenceNumber - 1]
}

function createMarkerForEditor(text, method, type = 'normal', originalSubstitute = '',fromTemplate = '') {
    if(['bc-y-r1','bc-y-r2'].includes(method))method = 'bc-y'
    if(['bc-i-r1','bc-i-r2'].includes(method))method = 'bc-i'
    return `{{${method}|${text}|${type}|${originalSubstitute}|${fromTemplate}}}`
}


function replaceTextInNodeIfNeededForEditor(node, sourceText) {
    const occurrences = []
    const pattern = new RegExp('\\{\\{(.*?)\\|(.*?)\\|(.*?)\\|(.*?)\\|(.*?)\\}\\}', 'g')
    while ((result = pattern.exec(sourceText))) {

        const obj = { index: result.index, length: result[0].length, method: result[1], originalText: result[2], originalSubstitute: result[4],fromTemplate:result[5] }
        occurrences.push(obj)
    }
    if (!occurrences.length) return


    let lastIndex = 0
    for (let obj of occurrences) {
        const precedingTextNode = document.createTextNode(
            sourceText.substr(lastIndex, obj.index - lastIndex)
        );

        node.parentNode.insertBefore(precedingTextNode, node)

        const replacementNode = getReplacementNodeForEditor(obj.originalText, obj.method, obj.originalSubstitute,obj.fromTemplate)

        if (replacementNode) {
            node.parentNode.insertBefore(replacementNode, node)
        }

        lastIndex = obj.index + obj.length

    }

    const lastNode = document.createTextNode(
        sourceText.substr(lastIndex, sourceText.length - lastIndex)
    );

    node.parentNode.insertBefore(lastNode, node)

    node.parentNode.removeChild(node);
}



function getReplacementNodeForEditor(text, method, originalSubstitute,fromTemplate) {
    text = text.replace(',','')
    const originalNumber = originalSubstitute ? parseInt(originalSubstitute, 10) : parseInt(text, 10)
    const type = 'normal'
    switch (method) {

        case 'bc-r':
            return null
        case 'bc-y': {
            const year = originalNumber
            if (isNaN(year)) return null
            const translatedYear = `${10001 - year}`

            return textWithComment(text, `${year} BCE`, translatedYear, type)
        }

        case 'ad-y': {
            const year = originalNumber
            if (isNaN(year)) return null
            const translatedYear = (10000 + year).toLocaleString()

            return textWithComment(text, `${year}`, translatedYear, type)
        }
        case 'bc-i': {
            const year = originalNumber
            if (isNaN(year)) return null
            const translatedYear = `${10000 - year}`
            return textWithComment(text, `${year} BCE`, translatedYear, type)
        }
        case 'bc-y1': {
            const year = originalNumber
            const translatedYear = `${(10001 - year) % 10}`
            return textWithComment(text, `${year} BCE`, translatedYear, type)
        }
        case 'bc-y2': {
            const year = originalNumber
            const translatedYear = `${(10001 - year) % 100}`
            return textWithComment(text, `${year} BCE`, `${translatedYear < 10 ? '0' : ''}${translatedYear}`, type)
        }
        case 'bc-d': {
            const decade = originalNumber
            if (isNaN(decade)) return document.createTextNode('')
            const baseYear = 9990 - decade
            const firstYear = baseYear + 2
            let lastYear = (baseYear + 11)
            if (lastYear === 10001) lastYear = 10000
            const lastYearShort = lastYear % 100
            const translated = `${firstYear}/${lastYearShort < 10 ? lastYear : lastYearShort} decade`
            return textWithComment(text, `${decade}s BCE`, translated, type)

        }
        case 'bc-c': {
            let century = originalNumber
            if (isNaN(century)) {
                century = numbersFromWords[text.toLowerCase()]
            }
            const translatedCentury = 101 - century
            const translatedCenturyWithEnding = `${translatedCentury}${numberSuffix(translatedCentury)}`
            return textWithComment(text, `${text} century BCE`, translatedCenturyWithEnding, type)
        }

        case 'bc-00s': {
            const x00s = originalNumber
            if (isNaN(x00s)) return emptySpan()
            const translated = `${9900 - x00s}s`
            return textWithComment(text, `${parseInt(text, 10)}s BCE`, translated, type)
        }


        case 'bc-m': {
            let millennium = originalNumber
            if (isNaN(millennium)) {
                millennium = numbersFromWords[text.toLowerCase()]
            }
            const translatedMillennium = 11 - millennium
            const translatedMillenniumWithEnding = `${translatedMillennium}${numberSuffix(translatedMillennium)}`
            return textWithComment(text, `${text} millennium BCE`, translatedMillenniumWithEnding, type)
        }

        case 'bc-000s': {
            const x000s = originalNumber
            if (isNaN(x000s)) return emptySpan()
            const translated = `${9000 - x000s}s`
            return textWithComment(text, `${parseInt(text, 10)}s BCE`, translated, type)
        }

        case 'bc-tn': {
            return textWithComment(text, text, 'Old Era', type)
        }

        case 'bc-ot': {
            return textWithComment(text, text, 'of the Old Era', type)
        }


        default:
            return document.createTextNode(text)
    }
}


function textWithComment(originalText, toast, translatedText, type = 'normal') {

    const span = document.createElement('span')
    const mainText = translatedText
    if(toast){
        span.title = toast
    }
    span.className = "rt-commentedText"
    const textNode = document.createTextNode(mainText)
    span.appendChild(textNode)
    return span
}


function escapeText(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function closePopupOfClass(className){
    const popups = document.getElementsByClassName(className)
    if(popups.length){
        const popup = popups[0]
        popup.parentElement.removeChild(popup)

        if(className === "editorPopup"){
            editorIsOpen = false
        }else if (className === "wikitextPopup"){
            isEditingWikitext = false
        }
    }
}

function setBodyFromCurrentHTML() {


    setBodyFromHTML(currentHTML)
}

function setBodyFromHTML(html) {
    if(isDefaultPopupActive)return
    let currentLocation = window.location.toString()
    if (currentLocation.includes('localhost')) {
        document.body.innerHTML = html
    } else {
        const parser = new DOMParser();
      //  const bodyDOM = parser.parseFromString(html, "text/xml");
        document.body.innerHTML = html


    }
}

function splitUpTagsAndTexts() {
    texts = []
    tags = []

    const commentReg = new RegExp('<!--[\\s\\S]*?-->', 'gm')
    const html = currentHTML.replace(commentReg, (match) => {
        return ''
    })
    const regex1 = new RegExp('<(?!(/)?span)[^>]*?>', 'gm');


    let array

    let startIndex = 0

    while ((array = regex1.exec(html)) !== null) {

        const index = array.index
        const text = html.substr(startIndex, index - startIndex)

        texts.push(text)
        tags.push(array[0])

        startIndex = regex1.lastIndex

    }
    const lastText = html.substr(startIndex, html.length - startIndex)

    texts.push(lastText)


    putStylesAndScriptsInTags()

}





function putStylesAndScriptsInTags() {
    const newTexts = []
    const newTags = []
    let megaTag = ''
    for (let i = 0; i < tags.length; i++) {
        const text = texts[i]
        if (megaTag) {
            megaTag = megaTag + text
        } else {
            newTexts.push(text)
        }
        const tag = tags[i]
        if (tag.includes('<script') || tag.includes('<style') || tag.includes('shortdescription')) {
            megaTag = tag
        } else if (tag === '</script>' || tag === '</style>' || tag === '</div>') {
            megaTag = megaTag + tag
            newTags.push(megaTag)
            megaTag = ''
        }else if(megaTag){
            megaTag = megaTag + tag
        } else {
            newTags.push(tag)
        }
    }
    newTexts.push(texts[texts.length - 1])
    texts = newTexts
    tags = newTags
}



function markTextsMatchingRegExp(reg, matchNumber) {
    const newTexts = texts.map((text, index) => {
        if (index > 0) {
            const precedingTag = tags[index - 1]
            const pattern = new RegExp(`<selection.*?class="(${allClassesString})"(?!</selection>).*?>`)
            const array = precedingTag.match(pattern)
            if (array) return text

        }
        let replacementText = text.replace(reg, `{---{selection class="marker" data-t="" style="background-color: red;color:white;"}---}${matchNumber}{---{/selection}---}`)


        const reg1 = new RegExp('<span.*?>', 'g')

        const regBrackets = new RegExp('\\{---\\{.*?\\}---\\}', 'g')
        replacementText = replacementText.replace(reg1, (match) => {
            return match.replace(regBrackets, '')
        })

        replacementText = replacementText.replace(/\{---\{/g, '<').replace(/\}---\}/g, '>')



        return replacementText
    })

    const bigArray = []
    tags.forEach((tag, index) => {
        bigArray.push(newTexts[index])
        bigArray.push(tag)
    })
    bigArray.push(newTexts[length - 1])
    currentHTML = bigArray.join('')

    currentHTML = currentHTML.replace(/(<span class="tocnumber">)(.*?)(<\/span>)/gm, (match, left, inner, right) => {
        return left + inner.replace(/<selection.*?>/gm, '').replace(/<\/selection>/gm, '') + right
    })

    currentHTML = currentHTML.replace(/(<div id="mw-hidden-catlinks".*?>)(.*?)(<\/div>)/gm, (match, left, inner, right) => {
        return left + inner.replace(/<selection.*?>/gm, '').replace(/<\/selection>/gm, '') + right
    })

    currentHTML = currentHTML.replace(/(<a.*?Special:BookSources[^>]*?>)(.*?)(<\/a>)/gm, (match, left, inner, right) => {
        return left + inner.replace(/<selection.*?>/gm, '').replace(/<\/selection>/gm, '') + right
    })



    fixInnerSpans()

    setBodyFromCurrentHTML()
    addToHistory(currentHTML)


}


function fixInnerSpans() {
    const pattern = new RegExp('(<selection class="marker".*?>)(?!</span>)(.*?)(</selection>)', 'gm')
   // const innerPattern = new RegExp('^(.*?)(<span.*?>)(.*?)(</span>)(.*?)$')
    currentHTML = currentHTML.replace(pattern, (match, markerStart, inner, markerEnd) => {

        return splitSpan(markerStart, inner, markerEnd)
    })
}



function splitSpan(markerStart, inner, markerEnd) {
    const innerPattern = new RegExp('^(.*?)(<span.*?>)(.*?)(</span>)(.*?)$')
    if (inner.includes('<span')) {
        const result = inner.match(innerPattern)
        if (!result) return markerStart + inner + markerEnd
        const [m, leftText, spanStart, middleText, spanEnd, rightText] = result

        return markerStart + leftText + markerEnd +
            spanStart + markerStart + middleText + markerEnd + spanEnd +
            markerStart + rightText + markerEnd
    } else {
        return markerStart + inner + markerEnd
    }
}

//TODO:Remove this method
function removeProblematicPartsFromHtml(html){
    html = html.replace('"=""','') 
    html = html.replace('<mw:tocplace>','')
    html = html.replace('</mw:tocplace>','')
    return html
}


function moveReplacementsHtmlToText(html,text,insertions,replacementsInHtmlArray){

    // { text: targetText, 
    //     method: obj.method, 
    //     index: indexInOriginalText, 
    //     type: obj.type, 
    //     originalSubstitute: obj.substitute, 
    //     fromTemplate:obj.fromTemplate 
    // }

    if(!replacementsInHtmlArray.length)return []

    let nextInsertionIndexInArray = -1
    let nextReplacementIndexInArray = 0

    let nextInsertionIndexInText = -1
    let nextReplacement = replacementsInHtmlArray[0]
    let nextReplacementIndexInHtml = nextReplacement.index

    if(insertions.length){
        nextInsertionIndexInArray = 0
        nextInsertionIndexInText = insertions[0]
    }


    

    let indexInText = 0
    let indexInHtml = 0

    let isInsideTag = false

    const result = []

    while(indexInHtml < html.length){
        const characterInHtml = html.slice(indexInHtml,indexInHtml + 1)

        if(characterInHtml === '<'){
            isInsideTag = true
            indexInHtml++
            continue
        }
        if(characterInHtml === '>'){
            isInsideTag = false
            indexInHtml++
            continue
        }

        if(isInsideTag){
            indexInHtml++
            continue
        }

        const characterInText = text.slice(indexInText,indexInText + 1)

        if(characterInText !== characterInHtml){
           // console.log('something is wrong',characterInHtml)
           // console.log('something is wrong',characterInText)
        }


        let justFoundReplacement = false
        if(indexInHtml === nextReplacementIndexInHtml){

            const targetLength = nextReplacement.text.length
            const targetInText = text.slice(indexInText,indexInText + targetLength)
            if(targetInText === nextReplacement.text){

                result.push({
                    text: nextReplacement.text, 
                    method: nextReplacement.method, 
                    index: indexInText, 
                    type: nextReplacement.type, 
                    originalSubstitute: nextReplacement.originalSubstitute, 
                    fromTemplate:nextReplacement.fromTemplate 
                })


                justFoundReplacement = true
                indexInHtml += targetLength
                indexInText += targetLength

                nextReplacementIndexInArray++

                if(nextReplacementIndexInArray < replacementsInHtmlArray.length){
                    nextReplacement = replacementsInHtmlArray[nextReplacementIndexInArray]
                    nextReplacementIndexInHtml = nextReplacement.index
                    
                }else{
                    return result
                }






            }else{
                //console.log("something doesn't work")
            }
        }
        

        if(!justFoundReplacement){
            indexInText++
            indexInHtml++
        }


        if(indexInText === nextInsertionIndexInText){
            indexInText++
            nextInsertionIndexInArray++
            if(nextInsertionIndexInArray < insertions.length){
                nextInsertionIndexInText = insertions[nextInsertionIndexInArray]
            }else{
                nextInsertionIndexInArray = -1
                nextInsertionIndexInText = -1
            }


        }

        
    }


    return result


}

//if user selected range of text this method should return an array of 3 strings (part of text before selection, selection itself, and the part of text after selection)
function getThreeChunksFromHtml(){
    const selection = window.getSelection()
    if(!selection.rangeCount)return null
    const range = window.getSelection().getRangeAt(0);


    let { startContainer, endContainer, startOffset, endOffset } = range
    const text1 = startContainer.data
    if (!text1) return null

    const selectionLabel = '__selection__'

    const newText1 = text1.slice(0, startOffset) + selectionLabel + text1.slice(startOffset, text1.length)


    const text2 = endContainer.data

    if (!text2) return null
    let newText2 = ''
    if (startContainer === endContainer) {
        endOffset += selectionLabel.length
        newText2 = newText1.slice(0, endOffset) + selectionLabel + newText1.slice(endOffset, newText1.length)
        endContainer.data = newText2

    }else{
        newText2 = text2.slice(0, endOffset) + selectionLabel + text2.slice(endOffset, text2.length)
        startContainer.data = newText1
        endContainer.data = newText2
    }

    let html = new XMLSerializer().serializeToString(document.body)
    html = removeProblematicPartsFromHtml(html)
    const chunks = html.split(selectionLabel)
    if(chunks.length != 3){
        currentHTML = chunks.join("")
        setBodyFromCurrentHTML()
        return null
    }

    let [left, middle, right] = chunks

    const regLeft = new RegExp("<[^>]*?>$")
    const regRight = new RegExp("^</[^>]*>")

    const leftResult = chunks[0].match(regLeft)
    const rightResult = chunks[2].match(regRight)

    if(leftResult && !leftResult.includes("</")){
        left = left.replace(regLeft,"")
        middle = leftResult[0] + middle

    }

    if(rightResult){
        right = right.replace(regRight,"")
        middle = middle + rightResult[0]
    }


    return [left, middle, right]
}


function getColorForMethod(method){
    switch (method) {
        case 'bc-y':
        case 'bc-y-r1':
        case 'bc-y-r2':
            return 'green;color:white'
        case 'ad-y':
            return 'rosyBrown'
        case 'bc-y1':
            return 'gainsboro'
        case 'bc-y2':
            return 'lightslategray;color:white'
        case 'bc-i':
        case 'bc-i-r1':
        case 'bc-i-r2':
            return 'pink'
        case 'bc-d':
            return 'olive;color:white'
        case 'bc-sd':
            return 'oliveDrab;color:white'
        case 'bc-dp':
            return 'peachPuff'
        case 'bc-c':
            return 'orange'
        case 'bc-00s':
            return 'coral'
        case 'bc-m':
            return 'darkcyan;color:white'
        case 'bc-000s':
            return 'blueViolet'
        case 'bc-r':
            return 'brown;color:white'
        case 'bc-tn':
            return 'aqua'
        case 'bc-ot':
            return 'lime'
        case 'bc-ig':
            return 'dimgray;color:white'
        default:
            return 'red;color:white'
    }
}