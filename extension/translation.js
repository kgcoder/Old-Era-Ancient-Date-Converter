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





function getReplacementsFromServerForWeb(editsArray, text) {

    let replacementsFromServer = editsArray.map((edit) => getReplacementFromEdit(edit,text))



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
   // newHtml += chunks[chunks.length - 1]

    return newHtml
}




function htmlWithIgnoredParts(html) {


    let ignoredPartsWithIndices = []

    //findJustTags(html,ignoredPartsWithIndices,'<body.*?>')
    findJustTags(html,ignoredPartsWithIndices,'</body>')
    // findTagsWithContents(html,ignoredPartsWithIndices,'<span class="tocnumber">')
    // findTagsWithContents(html,ignoredPartsWithIndices,'<span class="tocnumber">')
    // findTagsWithContents(html,ignoredPartsWithIndices,'<span class="vector-toc-numb">')
    findTagsWithContents(html,ignoredPartsWithIndices,'<span class="mw-editsection">')

    findJustTags(html,ignoredPartsWithIndices,'<link rel="mw-deduplicated-inline-style"[^>]*?/>')

    //findJustTags(html,ignoredPartsWithIndices,'<h1.*?>')
    findJustTags(html,ignoredPartsWithIndices,'<(div|span|table) class="[^>]*?mw-collapsible[^>]*?>')

    findTagsWithContents(html,ignoredPartsWithIndices,'<style[^>]*?>')
    findTagsWithContents(html,ignoredPartsWithIndices,'<script[^>]*?>')


    ignoredPartsWithIndices = ignoredPartsWithIndices.sort((a,b) => a.index - b.index)

    let newHTML = ''
    let lastIndex = 0
    ignoredPartsWithIndices.forEach(igObj => {
        const prefix = html.substring(lastIndex,igObj.index)
        newHTML += prefix
        newHTML += '<IgnoredPart>'

        lastIndex = igObj.index + igObj.text.length

    })

    if(lastIndex < html.length - 1){
        const postfix = html.substring(lastIndex,html.length - 1)
        newHTML += postfix
    }


    return { htmlWithIgParts: newHTML, ignoredParts:ignoredPartsWithIndices.map(obj => obj.text) }
}


function findJustTags(html,resultsArray,tag){
    const pattern = new RegExp(tag,'gm')
    let result
    while (result = pattern.exec(html)){
        resultsArray.push({text:result[0],index:result.index})
    }

}

function findTagsWithContents(html,resultsArray,openingTag){
    const pattern = new RegExp(openingTag,'gm')
    let result
    while (result = pattern.exec(html)){

        let level = 1
        let currentIndex = result.index + result[0].length

        let isInsideClosingTag = false
        let finalString = ''
        while(true){

            const currentCharacter = html[currentIndex]

            if(currentCharacter === '<'){
                const nextCharacter = html[currentIndex + 1]
                if(nextCharacter === '/'){
                    isInsideClosingTag = true
                }else{
                    level += 1
                }

            }else if(isInsideClosingTag && currentCharacter === '>'){
                isInsideClosingTag = false
                level -= 1
                
                if(level <= 0){
                    finalString += currentCharacter
                    break
                }
            
             
            }
           
            finalString += currentCharacter

            currentIndex++

        }


        finalString = result[0] + finalString


        resultsArray.push({text:finalString,index:result.index})

    }

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


   
    // const reg = new RegExp(escapeText(substring),'gm')
    // const indices = []
    // let result
    // while((result = reg.exec(parentString))){
    //     indices.push(result.index)

    // }
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

    const targetWithBCReg = new RegExp(`^(.*?)${bcPattern}`,'i')
    const targetWithBCEReg = new RegExp(`^(.*?)${bcePattern}`,'i')
    const targetWithStrictBCReg = new RegExp(`^(.*?)${strictBCPattern}`,'i')
    gaps.forEach(gap =>{

        let firstIndex = gap.firstGoodEdit ? gap.firstGoodEdit.targetIndex + gap.firstGoodEdit.target.length : 0
        const lastIndex = gap.lastGoodEdit ? gap.lastGoodEdit.targetIndex : html.length - 1

        let line = html.substr(firstIndex, lastIndex - firstIndex)

    
        gap.brokenEdits.forEach(brokenEdit => {
            let order = brokenEdit.order
            const orderChunks = getOrderChunks(order)

            let ocNum = 1
            if (orderChunks.length === 4) {
                ocNum = orderChunks[3]
            }

            let ocNumToTry = ocNum
            let index = undefined


            let target = brokenEdit.target

            if(canTargetContainBCLabelBasedOnMethod(brokenEdit.method)){
               const matches = target.match(targetWithBCEReg)
                if(matches){
                    const bcMatches = target.match(targetWithStrictBCReg)
                    target = bcMatches[0]
                }


            }



            while(true){

                index = findIndexOfSubstringOccurrence(line, target, ocNumToTry)

                if(canTargetContainBCLabelBasedOnMethod(brokenEdit.method)){
                    const matches = target.match(targetWithBCReg)
                    if(matches){
                        brokenEdit.target = matches[1]
                    }
                }

                
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
        return {isBroken:false, wasFixed:true, edit, index:targetIndex, length: edit.length, replacement: createMarker(target, method, type, originalSubstitute) }
    })
}


