/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */


function getReplacementsFromEdits(edits, htmlWithIgParts){

    console.log('all edits',edits)
    
    return edits.map((edit) => {

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

        return { isBroken:false, edit, index, length, replacement: createMarker(target, method, type, originalSubstitute, fromTemplate) }


    })
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

    //currentHTML = currentHTML.replace(/mw-collapsed/g, 'mw-expanded')






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




