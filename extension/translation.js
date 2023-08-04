/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
let pageHasIssues = false
//let replacementSpans = []

function updateTranslation() {

    chrome.storage.local.get(['isExtensionOff', 'shouldTranslateYearsPrecisely', 'shouldTranslateDatesInBookTitles', 'shouldTranslateDatesInQuotes','firstYearOfOldEra','lastTranslatedYearWithLabel','timelineName','ofTimeline','abbreviatedTimelineName'], function (result) {
        isExtensionOff = !!result.isExtensionOff
        shouldTranslateYearsPrecisely = !!result.shouldTranslateYearsPrecisely
        shouldTranslateDatesInBookTitles = !!result.shouldTranslateDatesInBookTitles
        shouldTranslateDatesInQuotes = !!result.shouldTranslateDatesInQuotes

        if(result.firstYearOfOldEra){
            firstYearOfOldEra = result.firstYearOfOldEra;
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

        updateDates()
    })
}





function getReplacementsFromServer(editsArray, htmlWithIgParts) {

    let replacementsFromServer = editsArray.map((edit) => {

    

        let { string, target, method, order, type, originalSubstitute } = edit
        if (!order) order = '1.1.1.1'

        const orderChunks = order.split('.').map(chunk => parseInt(chunk, 10))
        if (orderChunks.length !== 4) {
            //console.log('orderChunks.length !== 4')
            return {edit,isBroken:true}
        }

        const [string_num_of_oc, string_oc, target_num_of_oc, target_oc] = orderChunks
        const pattern1 = new RegExp(escapeText(string), 'g')
        const matchesCount = (htmlWithIgParts.match(pattern1) || []).length

        if (matchesCount != string_num_of_oc) {
            // console.log('matchesCount != string_num_of_oc')
            // console.log('matchesCount',matchesCount)
            // console.log('string_num_of_oc',string_num_of_oc)
            return {edit,isBroken:true}
        }

        if (string_oc < 1 || string_oc > string_num_of_oc) {
            //console.log('string_oc < 1 || string_oc > string_num_of_oc')
            return {edit,isBroken:true}
        }

        const pattern2 = new RegExp(escapeText(target), 'g')
        const targetMatchesCount = (string.match(pattern2) || []).length

        if (targetMatchesCount != target_num_of_oc) {
            //console.log('targetMatchesCount != target_num_of_oc')
            return {edit,isBroken:true}
        }

        if (target_oc < 1 || target_oc > target_num_of_oc) {
            //console.log('target_oc < 1 || target_oc > target_num_of_oc')
            return {edit,isBroken:true}
        }


        const index1 = findIndexOfSubstringOccurrence(htmlWithIgParts, string, string_oc)
        const index2 = findIndexOfSubstringOccurrence(string, target, target_oc)

        const index = index1 + index2

        if(index){
            edit.targetIndex = index
        }

        

        const length = target.length

        return {isBroken:false, edit, index, length, replacement: createMarker(target, method, type, originalSubstitute) }


    })



    let currentGap = null
    let lastGoodEdit = null
    const gaps = []

    replacementsFromServer.forEach(rep => {

    
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


    







    const filteredEdits = replacementsFromServer.filter(rep => !rep.isBroken)

    const badEdits = replacementsFromServer.filter(rep => rep.isBroken)
  
    issuesInCurrentPageExist = badEdits.length > 0

    pageHasIssues = pageHasIssues || filteredEdits.replacementsFromServer !== replacementsFromServer.length
    replacementsFromServer = filteredEdits


    const fixedEdits = fixBrokenEdits(gaps,htmlWithIgParts)

    replacementsFromServer = replacementsFromServer.concat(fixedEdits)


    replacementsFromServer = replacementsFromServer.sort((a, b) => a.edit.targetIndex - b.edit.targetIndex)

    //if (!replacements.length) return null
    return replacementsFromServer



}



function getReplacementsFromServerForWeb(editsArray, text) {

    let replacementsFromServer = editsArray.map((edit) => {

    

        let { string, target, method, order, type, originalSubstitute } = edit
        if (!order) order = '1.1.1.1'

        const orderChunks = order.split('.').map(chunk => parseInt(chunk, 10))
        if (orderChunks.length !== 4) {
            //console.log('orderChunks.length !== 4')
            return {edit,isBroken:true}
        }

        const [string_num_of_oc, string_oc, target_num_of_oc, target_oc] = orderChunks
        const pattern1 = new RegExp(escapeText(string), 'g')
        const matchesCount = (text.match(pattern1) || []).length

        if (matchesCount != string_num_of_oc) {
            // console.log('matchesCount != string_num_of_oc')
            // console.log('matchesCount',matchesCount)
            // console.log('string_num_of_oc',string_num_of_oc)
            return {edit,isBroken:true}
        }

        if (string_oc < 1 || string_oc > string_num_of_oc) {
            //console.log('string_oc < 1 || string_oc > string_num_of_oc')
            return {edit,isBroken:true}
        }

        const pattern2 = new RegExp(escapeText(target), 'g')
        const targetMatchesCount = (string.match(pattern2) || []).length

        if (targetMatchesCount != target_num_of_oc) {
            //console.log('targetMatchesCount != target_num_of_oc')
            return {edit,isBroken:true}
        }

        if (target_oc < 1 || target_oc > target_num_of_oc) {
            //console.log('target_oc < 1 || target_oc > target_num_of_oc')
            return {edit,isBroken:true}
        }


        const index1 = findIndexOfSubstringOccurrence(text, string, string_oc)
        const index2 = findIndexOfSubstringOccurrence(string, target, target_oc)

        const index = index1 + index2

        if(index){
            edit.targetIndex = index
        }

        

        const length = target.length

        return {isBroken:false, edit, index, length, replacement: createMarker(target, method, type, originalSubstitute) }


    })



    let currentGap = null
    let lastGoodEdit = null
    const gaps = []

    replacementsFromServer.forEach(rep => {

    
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


    const filteredEdits = replacementsFromServer.filter(rep => !rep.isBroken)

    const badReplacements = replacementsFromServer.filter(rep => rep.isBroken)
  
    issuesInCurrentPageExist = badReplacements.length > 0

    pageHasIssues = pageHasIssues || filteredEdits.replacementsFromServer !== replacementsFromServer.length
    replacementsFromServer = filteredEdits


    const fixedEdits = fixBrokenEdits(gaps,text)

    replacementsFromServer = replacementsFromServer.concat(fixedEdits)


    replacementsFromServer = replacementsFromServer.sort((a, b) => a.edit.targetIndex - b.edit.targetIndex)

    //if (!replacements.length) return null
    return {replacementsFromServer, badReplacements}



}

function createHTMLWithMarkers(replacementsArray, htmlWithIgParts, ignoredParts) {
    let result = ''
    let lastIndex = 0

    replacementsArray.forEach(({ index, length, replacement }) => {
        result += htmlWithIgParts.substr(lastIndex, index - lastIndex)
        result += replacement
        lastIndex = index + length
    })

    result += htmlWithIgParts.substr(lastIndex, htmlWithIgParts.length - lastIndex)


    const chunks = result.split('<IgnoredPart>')
    if (chunks.length === 1) return result
    let newHtml = ''
    for (let i = 0; i < ignoredParts.length; i++) {
        newHtml += chunks[i] + ignoredParts[i]
    }
    newHtml += chunks[chunks.length - 1]

    return newHtml
}




function htmlWithIgnoredParts(html) {

    

    const pattern = new RegExp(`(<body.*?>|</body>|<span class="mw-editsection">.*?</span></span>|<link rel="mw-deduplicated-inline-style"[^>]*?/>|<h1.*?>|<(div|span|table) class="[^>]*?mw-collapsible[^>]*?>|<style[^>]*?>[^<]*?</style>|<script[^>]*?>[^<]*?</script>)`,'gm')
    const ignoredParts = []
    const newHTML = html.replace(pattern, (match) => {
        ignoredParts.push(match)
        return '<IgnoredPart>'
    })

    return { htmlWithIgParts: newHTML, ignoredParts }
}


function removeAttributesFromTags(html){
    
    let indexInHtml = 0
    let result = ''
    let isReadingTagname = false
    let isReadingText = true
    let isIgnoring = false
    let insideComment = false
    while(indexInHtml < html.length){
        const characterInHtml = html.slice(indexInHtml,indexInHtml + 1)
        if(isReadingTagname && characterInHtml === ' '){
            isReadingTagname = false
            isIgnoring = true
            indexInHtml++
            continue
        }else if(characterInHtml === '<'){
            const fourCharachters = html.slice(indexInHtml,indexInHtml + 4)
            if(fourCharachters === '<!--'){
                insideComment = true
                result += '<!-- '
                indexInHtml += 4
                continue
            }

            isReadingTagname = true  
            isReadingText = false
            result += characterInHtml      
            indexInHtml++
            isIgnoring = false

            continue;
        }else if(characterInHtml === '>'){
            if(insideComment){
                const threeCharachters = html.slice(indexInHtml - 2,indexInHtml + 1)
                if(threeCharachters === '-->'){
                    insideComment = false
                    result += '-->'
                    indexInHtml++
                    continue
                }

            }
            isIgnoring = false
            isReadingText = true
            isReadingTagname = false
            result += characterInHtml  
            indexInHtml++
            isIgnoring = false
            continue;
        }

        if(isIgnoring && characterInHtml === '/'){
            const nextCharacter = html.slice(indexInHtml + 1,indexInHtml + 2)
            if(nextCharacter === '>'){
                result += characterInHtml
                indexInHtml++
                isReadingTagname = false
                continue
            }
        }

        if(!isIgnoring && !insideComment){
            result += characterInHtml

        }

        indexInHtml++


    }

    return result
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

function findAllIndicesOfSubstringOccurrences(parentString, substring) {
    let startIndex = 0, index

    const indices = []
    while ((index = parentString.indexOf(substring, startIndex)) > -1) {
        indices.push(index)
        startIndex = index + substring.length

    }

    return indices
}
function preparePageMetadata(html){
    const { htmlWithIgParts } = htmlWithIgnoredParts(html)
    const numberOfBCsOnCurrentPage = countProperBCs(htmlWithIgParts)
    locallyFoundBCs = numberOfBCsOnCurrentPage
    numberOfBCsHasChangedInCurrentPage = numberOfBCsOnCurrentPage != properBCs
}





function fixBrokenEdits(gaps,html){
    const fixedEdits = []
    gaps.forEach(gap =>{

        let firstIndex = gap.firstGoodEdit ? gap.firstGoodEdit.targetIndex + gap.firstGoodEdit.target.length : 0
        const lastIndex = gap.lastGoodEdit ? gap.lastGoodEdit.targetIndex : html.length - 1

        let line = html.substr(firstIndex, lastIndex - firstIndex)
    
        gap.brokenEdits.forEach(brokenEdit => {
            let order = brokenEdit.order
            if (!order) order = '1.1.1.1'
            let ocNum = 1
            const orderChunks = order.split('.').map(chunk => parseInt(chunk, 10))
            if (orderChunks.length === 4) {
                ocNum = orderChunks[3]
            }

            let ocNumToTry = ocNum
            let index = undefined
            while(true){

                index = findIndexOfSubstringOccurrence(line, brokenEdit.target, ocNumToTry)
                
                if(index){
                   const globalIndex = firstIndex + index
                    if(isIndexInsideTag(globalIndex,html)){
                        const newStartOfLine = index + brokenEdit.target.length
                        firstIndex = firstIndex + newStartOfLine
                        line = line.substr(newStartOfLine, line.length - newStartOfLine)
                        ocNumToTry = 1
                        index = undefined
                        continue

                    } 
                }

                break

            }

            if(index){
                brokenEdit.targetIndex = firstIndex + index
                const newStartOfLine = index + brokenEdit.target.length
                firstIndex = firstIndex + newStartOfLine
                line = line.substr(newStartOfLine, line.length - newStartOfLine)
                fixedEdits.push(brokenEdit)
            }

        })



    })

    return fixedEdits.map(edit => {
        const {targetIndex, target, method, type, originalSubstitute} = edit
        return {isBroken:false, wasFixed:true, edit, index:targetIndex, length: target.length, replacement: createMarker(target, method, type, originalSubstitute) }
    })
}


