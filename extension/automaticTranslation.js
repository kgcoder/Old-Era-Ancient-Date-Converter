/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

function getLocalReplacements(htmlWithIgParts, replacementsArray, pageData) {

    // createCenturiesAndMillenniaReplacementsFromAltMarkup(htmlWithIgParts, replacementsArray)
    // createYearReplacementsWithInnerSpansFromAltMarkup(htmlWithIgParts, replacementsArray)
    // createReplacementsFromAltMarkup(htmlWithIgParts, replacementsArray)

    createCenturiesAndMillenniaReplacementsFromMarkup(htmlWithIgParts, replacementsArray)

    // ignoreSecondYearInRangeWithInnerSpansIfNeeded(htmlWithIgParts, replacementsArray)
    // ignoreSecondYearInRangeWithoutInnerSpansIfNeeded(htmlWithIgParts, replacementsArray)
    // ignoreSecondYearInRangeWhenOnlyFirstIsInMarkup(htmlWithIgParts, replacementsArray)

    createYearReplacementsWithInnerSpansFromMarkup(htmlWithIgParts, replacementsArray)
    createReplacementsFromMarkup(htmlWithIgParts, replacementsArray)
    
    findH2Headlines(htmlWithIgParts, replacementsArray)


    
    createAutomaticReplacements(htmlWithIgParts, replacementsArray, pageData)



    
}








function createAutomaticReplacements(html, replacementsArray, pageData) {

    const {result:text,insertions} = extractTextFromHtml(html)

    processCenturyOrMillenniumCategoryPattern(html,replacementsArray)
    processDecadeCategoryPattern(html, replacementsArray)

    let intermediaryReplacementsArray = []


    const rawReplacementsInHtmlArray = []


    processYearRangePattern(text,intermediaryReplacementsArray, pageData)
    processListWithMonthNamePattern(text, intermediaryReplacementsArray)
    processLongYearListPattern(text, intermediaryReplacementsArray, pageData)
    processYearMonthRangePattern(text, intermediaryReplacementsArray)
    processYearPattern(text, intermediaryReplacementsArray, pageData)
    processCenturyRangePattern(text, intermediaryReplacementsArray)
    processCenturyRangeWithSlashPattern(text, intermediaryReplacementsArray)
    processMillenniumRangePattern(text, intermediaryReplacementsArray)
    processMillenniumRangeWithSlashPattern(text, intermediaryReplacementsArray)
    processDecadeRangePattern(text, intermediaryReplacementsArray)
    processDecadePattern(text,intermediaryReplacementsArray)
    processCenturyPattern(text,intermediaryReplacementsArray)
    processMillenniumPattern(text,intermediaryReplacementsArray)



    intermediaryReplacementsArray = intermediaryReplacementsArray.sort((a,b) => a.index - b.index)


    moveReplacementsFromTextToHtml(text,html,intermediaryReplacementsArray, rawReplacementsInHtmlArray, insertions)


    const normalReplacementsInHtml = mergeReplacements(rawReplacementsInHtmlArray)


    addNewReplacementsToArray(normalReplacementsInHtml,replacementsArray)






  




  


}







function extractTextFromHtml(html){
   
    let isIgnoring = false
    let result = ''
    let previousCharacter = ''
    let isPreviousCharacterNumber = false
    let isPreviousCharacterB = false
    let isPreviousCharacterC = false
    let isPreviousCharacterE = false

    const insertions = []
    const numReg = new RegExp('[0-9]')
    const bReg = new RegExp('b','i')
    const cReg = new RegExp('c','i')
    const eReg = new RegExp('e','i')

    const mergedCEReg = new RegExp('^(c[a-df-z0-9].*?|ce[a-z0-9].*?)','i')

    
    for(let index = 0;index < html.length; index++){
        const character = html.slice(index,index + 1)

        if(character === '<'){
            isIgnoring = true
            previousCharacter = html.slice(index - 1,index)
            if(previousCharacter.match(numReg)){
                isPreviousCharacterNumber = true
            }
            if(previousCharacter.match(bReg)){
                isPreviousCharacterB = true
            }
            if(previousCharacter.match(cReg)){
                isPreviousCharacterC = true
            }
            if(previousCharacter.match(eReg)){
                isPreviousCharacterE = true
            }
            continue;
        }else if(character === '>'){
            isIgnoring = false
            let nextCharacter = html.slice(index + 1,index + 2)
            if((isPreviousCharacterNumber && nextCharacter.match(numReg)) ||
            (isPreviousCharacterB && nextCharacter == '.') ||
            (isPreviousCharacterC && nextCharacter == '.') ||
            (isPreviousCharacterE && nextCharacter == '.') ||
            (isPreviousCharacterB && nextCharacter.match(cReg))||
            (isPreviousCharacterC && nextCharacter.match(eReg)) ){
                result += '@'
                const indexOfInsertion = result.length - 1
                insertions.push(indexOfInsertion)
            }
            if(nextCharacter != '<'){
                isPreviousCharacterNumber = false
                isPreviousCharacterB = false
                isPreviousCharacterC = false
                isPreviousCharacterE = false
            }
            continue;
        }



        if(!isIgnoring){
            result += character
            if(character.match(bReg)){
                const next4Characters = html.slice(index + 1,index + 5)
                if(next4Characters.match(mergedCEReg)){
                    result += '@'
                    const indexOfInsertion = result.length - 1
                    insertions.push(indexOfInsertion)
                }
            }
        }

    }

    return {result,insertions}
}


function moveReplacementsFromTextToHtml(text,html,replacementsInTextArray,finalReplacementsArray,insertions){
    if(!replacementsInTextArray.length)return

    let indexOfReplacement = 0
    let indexInTextToLookFor = replacementsInTextArray[indexOfReplacement].index

    let indexInText = 0
    let indexInHtml = 0

    let isIgnoring = false
    let error = false
    let numberOfNextInsertion = 0
    let indexOfNextInsertion = -1
    if(insertions.length){
        indexOfNextInsertion = insertions[numberOfNextInsertion]
    }
    while(indexInHtml < html.length){
        const characterInHtml = html.slice(indexInHtml,indexInHtml + 1)
        if(characterInHtml === '<'){
            isIgnoring = true
            indexInHtml++
            continue;
        }else if(characterInHtml === '>'){
            isIgnoring = false
            indexInHtml++
            continue;
        }

        if(!isIgnoring){
            if(indexInText === indexOfNextInsertion){
                indexInText++;
                numberOfNextInsertion++;
                if(numberOfNextInsertion < insertions.length){
                    indexOfNextInsertion = insertions[numberOfNextInsertion]
                }
           
            }
            const characterInText = text.slice(indexInText,indexInText + 1)
            if(characterInText !== characterInHtml)error = true

            if(indexInText === indexInTextToLookFor){
                const currentReplacementInText = replacementsInTextArray[indexOfReplacement]
                const targetLength = currentReplacementInText.length
                const targetInText = text.slice(indexInText,indexInText + targetLength)
                const targetInHtml = html.slice(indexInHtml,indexInHtml + targetLength)
                


                if(targetInText !== targetInHtml){
                    console.log('some error')
                    console.log({currentReplacementInText})
                    console.log({targetInText})
                    console.log({targetInHtml})
                    console.log('text:',text.slice(currentReplacementInText.index - 20, currentReplacementInText.index + 20))
                    error = true
                    indexInText++
                    indexInHtml++
                    continue
                }


                const {target,otherNumberStringInRange, index, method, length, originalSubstitute} = currentReplacementInText

                addReplacement(finalReplacementsArray,method,target,otherNumberStringInRange,indexInHtml,true,'normal',originalSubstitute)


                indexInText += targetLength
                indexInHtml += targetLength
                indexOfReplacement++
                if(indexOfReplacement >= replacementsInTextArray.length){
                    break;
                }
                indexInTextToLookFor = replacementsInTextArray[indexOfReplacement].index
                continue

                
            }

            indexInText++
        }
    

        indexInHtml++
    }

}



function mergeReplacements(rawReplacements){
    const resultArray = []
    const groupsArray = []
    let currentGroup = []
    let lastIndex = 0
    for(let i = 0; i < rawReplacements.length;i++){
        const replacement = rawReplacements[i]
      
        if(currentGroup.length === 0 || (replacement.index === lastIndex && replacement.edit.method === 'remove') ){
            currentGroup.push(replacement)
        }else{
            groupsArray.push(currentGroup)
            currentGroup = [replacement]  
        }
        
        lastIndex = replacement.index + replacement.length
    }
    if(currentGroup.length > 0){
        groupsArray.push(currentGroup)
    }

    for(let i = 0; i < groupsArray.length; i++){
        const group = groupsArray[i]
        const method = group[0].edit.method
        const originalSubstitute = group[0].edit.originalSubstitute
        const otherNumberStringInRange = group[0].edit.otherNumberStringInRange
        const index = group[0].index 
        
        let targetString = ''
        group.forEach(item => {
            targetString += item.edit.target
        })



        addReplacement(resultArray,method,targetString,otherNumberStringInRange,index,true,'normal',originalSubstitute)

    }

    return resultArray


}


function addNewReplacementsToArray(newReplacements,replacementsArray){
    newReplacements.forEach(rep => {
        addReplacement(replacementsArray,rep.edit.method,rep.edit.target,rep.edit.otherNumberStringInRange,rep.index,true,'normal',rep.edit.originalSubstitute)

    })
}


function addIntermediaryReplacement(replacementsArray, method,targetString, otherNumberStringInRange = '', index, checkIfExists = true, type = 'normal', originalSubstitute = '') {
    
    if (checkIfExists) {
        const indexOfExistingReplacement = replacementsArray.findIndex(rep => rep.index === index)
        if (indexOfExistingReplacement !== -1) return
    }

    
    const replacement = {
        target: targetString,
        method,
        index:index,
        length:targetString.length,
        originalSubstitute,
        otherNumberStringInRange
    }
    replacementsArray.push(replacement)
}


function addReplacement(replacementsArray, method,targetString, otherNumberStringInRange = '', index, checkIfExists = true, type = 'normal', originalSubstitute = '') {
    
    if (checkIfExists) {
        const indexOfExistingReplacement = replacementsArray.findIndex(rep => rep.index === index)
        if (indexOfExistingReplacement !== -1) return
    }

    const edit = {
        target: targetString,
        originalSubstitute,
        method,
        type,
        otherNumberStringInRange
    }

    
    const replacement = {
        isBroken: false,
        edit,
        index:index,
        length:targetString.length,
        replacement: createMarker(targetString, method, type, originalSubstitute,otherNumberStringInRange)
    }

    replacementsArray.push(replacement)
}