/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */


function getReplacementsFromEdits(edits, htmlWithIgParts){
    
    const myNewReplacements = edits.map((edit) => {

    

        let { string, target, method, order, type, originalSubstitute, fromTemplate } = edit
        if (!order) order = '1.1.1.1'

        const orderChunks = order.split('.').map(chunk => parseInt(chunk, 10))
        if (orderChunks.length !== 4) {
            console.log('not 4', edit)
            return {edit,isBroken:true}//"no good"
        }

        const [string_num_of_oc, string_oc, target_num_of_oc, target_oc] = orderChunks

        const pattern1 = new RegExp(escapeText(string), 'g')
        const matchesCount = (htmlWithIgParts.match(pattern1) || []).length

        if (matchesCount != string_num_of_oc) {
            return {edit,isBroken:true}//"no good"
        }

        if (string_oc < 1 || string_oc > string_num_of_oc) {
            return {edit,isBroken:true}//"no good"
        }

        const pattern2 = new RegExp(escapeText(target), 'g')
        const targetMatchesCount = (string.match(pattern2) || []).length

        if (targetMatchesCount != target_num_of_oc) {
            return {edit,isBroken:true}//"no good"
        }

        if (target_oc < 1 || target_oc > target_num_of_oc) {
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
    console.log(`text: ${text}, method: ${method}, originalSubstitute: ${originalSubstitute}`)
    text = text.replace(',','')
    const originalNumber = originalSubstitute ? parseInt(originalSubstitute, 10) : parseInt(text, 10)
    console.log('originalNumber', originalNumber)
    const type = 'normal'
    switch (method) {

        case 'remove':
            return null
        case 'year': {
            const year = originalNumber
            if (isNaN(year)) return null
            const translatedYear = `${10001 - year}`

            return textWithComment(text, `${year} BCE`, translatedYear, type)
        }

        case 'ad-y': {
            const year = originalNumber
            if (isNaN(year)) return null
            const translatedYear = (5214 + year)//.toLocaleString()

            return textWithComment(text, `${year}`, translatedYear, type)
        }
        case 'impreciseYear': {
            const year = originalNumber
            if (isNaN(year)) return null
            const translatedYear = `${10000 - year}`
            return textWithComment(text, `${year} BCE`, translatedYear, type)
        }
        case 'oneDigitYear': {
            const year = originalNumber
            const translatedYear = `${(10001 - year) % 10}`
            return textWithComment(text, `${year} BCE`, translatedYear, type)
        }
        case 'twoDigitYear': {
            const year = originalNumber
            const translatedYear = `${(10001 - year) % 100}`
            return textWithComment(text, `${year} BCE`, `${translatedYear < 10 ? '0' : ''}${translatedYear}`, type)
        }
        case 'decade': {
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
        case 'century': {
            let century = originalNumber
            if (isNaN(century)) {
                century = numbersFromWords[text.toLowerCase()]
            }
            const translatedCentury = 101 - century
            const translatedCenturyWithEnding = `${translatedCentury}${numberSuffix(translatedCentury)}`
            return textWithComment(text, `${text} century BCE`, translatedCenturyWithEnding, type)
        }

        case '00s': {
            const x00s = originalNumber
            if (isNaN(x00s)) return emptySpan()
            const translated = `${9900 - x00s}s`
            return textWithComment(text, `${parseInt(text, 10)}s BCE`, translated, type)
        }


        case 'millennium': {
            let millennium = originalNumber
            if (isNaN(millennium)) {
                millennium = numbersFromWords[text.toLowerCase()]
            }
            const translatedMillennium = 11 - millennium
            const translatedMillenniumWithEnding = `${translatedMillennium}${numberSuffix(translatedMillennium)}`
            return textWithComment(text, `${text} millennium BCE`, translatedMillenniumWithEnding, type)
        }

        case '000s': {
            const x000s = originalNumber
            if (isNaN(x000s)) return emptySpan()
            const translated = `${9000 - x000s}s`
            return textWithComment(text, `${parseInt(text, 10)}s BCE`, translated, type)
        }

        case 'OE': {
            return textWithComment(text, text, 'Old Era', type)
        }

        case 'ofOE': {
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


function setBodyFromCurrentHTML() {
    setBodyFromHTML(currentHTML)
    console.log('set from current')
    // let currentLocation = window.location.toString()
    // if (currentLocation.includes('localhost')) {
    //     document.body.innerHTML = currentHTML
    // } else {
    //     const parser = new DOMParser();
    //     const bodyDOM = parser.parseFromString(currentHTML, "text/xml");
    //     document.body = bodyDOM.documentElement
    // }

}

function setBodyFromHTML(html) {
    let currentLocation = window.location.toString()
    if (currentLocation.includes('localhost')) {
        document.body.innerHTML = html
    } else {
        const parser = new DOMParser();
        const bodyDOM = parser.parseFromString(html, "text/xml");
        //document.body = bodyDOM.documentElement
        document.body.innerHTML = html

    }
}

function splitUpTagsAndTexts() {
    texts = []
    tags = []

    const commentReg = new RegExp('<!--[\\s\\S]*?-->', 'gm')
    const html = currentHTML.replace(commentReg, (match) => {
        console.log('comment', match)
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



    // console.log('all texts', texts)
    // console.log('all tags', tags)
    // const index = tags.findIndex(tag => {
    //     const result = tag.match(/<.*?<.*?>/)

    //     //) console.log(result)
    //     return result
    // })
    // console.log('index', index)
    // if (index >= 0) {
    //     console.log(tags[index])
    // }
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
        let replacementText = text.replace(reg, `{---{selection class="marker" data-t="" style="background-color: red;"}---}${matchNumber}{---{/selection}---}`)


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


    console.log('currentHTML', currentHTML)
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
        //   console.log('match', match)
        const result = inner.match(innerPattern)
        if (!result) return markerStart + inner + markerEnd
        const [m, leftText, spanStart, middleText, spanEnd, rightText] = result
        console.log('result', result)

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




