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

    ignoreSecondYearInRangeWithInnerSpansIfNeeded(htmlWithIgParts, replacementsArray)
    ignoreSecondYearInRangeWithoutInnerSpansIfNeeded(htmlWithIgParts, replacementsArray)
    ignoreSecondYearInRangeWhenOnlyFirstIsInMarkup(htmlWithIgParts, replacementsArray)

    createYearReplacementsWithInnerSpansFromMarkup(htmlWithIgParts, replacementsArray)
    createReplacementsFromMarkup(htmlWithIgParts, replacementsArray)
    
    findH2Headlines(htmlWithIgParts, replacementsArray)


    
    createAutomaticReplacements(htmlWithIgParts, replacementsArray, pageData)



    
}








function createAutomaticReplacements(html, replacementsArray, pageData) {



    const text = extractTextFromHtml(html)

    const intermediaryReplacementsArray = []


    const rawReplacementsArray = []
    processRoundYearRangePattern(html, replacementsArray, pageData)
    processYearRangePattern(html, replacementsArray, pageData)
    processSimpleYearRangePattern(html, replacementsArray, pageData)
    processLongYearListPattern(html, replacementsArray, pageData)
    processYearRangeWithCircasPattern(html, replacementsArray, pageData)
    processYearMonthRangePattern(html, replacementsArray)
    processYearPattern(html, replacementsArray, pageData)
    processCenturyOrMillenniumCategoryPattern(html,replacementsArray)
    processCenturyRangePattern(html, replacementsArray)
    processCenturyRangeWithSlashPattern(html, replacementsArray)
    processMillenniumRangePattern(html, replacementsArray)
    processMillenniumRangeWithSlashPattern(html, replacementsArray)
    processDecadeCategoryPattern(html, replacementsArray)
    processDecadeRangePattern(html, replacementsArray)
    //processDecadePattern(html, replacementsArray)

    processDecadePattern2(text,intermediaryReplacementsArray)

   // console.log({intermediaryReplacementsArray})
    moveReplacementsFromTextToHtml(text,html,intermediaryReplacementsArray, rawReplacementsArray)
   // console.log({rawReplacementsArray})
    const normalReplacements = mergeReplacements(rawReplacementsArray)
    addNewReplacementsToArray(normalReplacements,replacementsArray)


    processCenturyPattern(html, replacementsArray)
    processMillenniumPattern(html, replacementsArray)



  


}







function extractTextFromHtml(html){
    console.log('htmlWithIfParts',html)
   
    console.log('html length',html.length)
    let isIgnoring = false
    let result = ''
    for(let index = 0;index < html.length; index++){
        const character = html.slice(index,index + 1)
        if(character === '<'){
            isIgnoring = true
            continue;
        }else if(character === '>'){
            isIgnoring = false
            continue;
        }

        if(!isIgnoring){
            result += character
        }

    }


    console.log('text:',result)

    return result
}


function moveReplacementsFromTextToHtml(text,html,replacementsInTextArray,finalReplacementsArray){
    if(!replacementsInTextArray.length)return
    let indexOfReplacement = 0
    let indexInTextToLookFor = replacementsInTextArray[indexOfReplacement].index

    let indexInText = 0
    let indexInHtml = 0

    let isIgnoring = false
    let error = false
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
            const characterInText = text.slice(indexInText,indexInText + 1)
            if(characterInText !== characterInHtml)error = true

            if(indexInText === indexInTextToLookFor){
                const currentReplacementInText = replacementsInTextArray[indexOfReplacement]
                const targetLength = currentReplacementInText.length
                const targetInText = text.slice(indexInText,indexInText + targetLength)
                const targetInHtml = html.slice(indexInHtml,indexInHtml + targetLength)
                


                if(targetInText !== targetInHtml){
                    console.log('some error')
                    indexInText++
                    indexInHtml++
                    continue
                }


                const {target, index, method, length} = currentReplacementInText
                addReplacement(finalReplacementsArray,method,target,indexInHtml,)



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

    console.log('was error',error)

}



function mergeReplacements(rawReplacements){
    console.log({rawReplacements})
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

    console.log({groupsArray})

    for(let i = 0; i < groupsArray.length; i++){
        const group = groupsArray[i]
        const method = group[0].edit.method
        const index = group[0].index

        
        
        let targetString = ''
        group.forEach(item => {
            targetString += item.edit.target
        })



        addReplacement(resultArray,method,targetString,index)

    }

    console.log({resultArray})


    return resultArray


}


function addNewReplacementsToArray(newReplacements,replacementsArray){
    newReplacements.forEach(rep => {
        addReplacement(replacementsArray,rep.edit.method,rep.edit.target,rep.index)

    })
}


function addIntermediaryReplacement(replacementsArray, method,targetString, index, checkIfExists = true, type = 'normal', originalSubstitute = '') {
    
    if (checkIfExists) {
        const indexOfExistingReplacement = replacementsArray.findIndex(rep => rep.index === index)
        if (indexOfExistingReplacement !== -1) return
    }

    
    const replacement = {
        target: targetString,
        method,
        index:index,
        length:targetString.length,
    }
    replacementsArray.push(replacement)
}


function addReplacement(replacementsArray, method,targetString, index, checkIfExists = true, type = 'normal', originalSubstitute = '') {
    
    if (checkIfExists) {
        const indexOfExistingReplacement = replacementsArray.findIndex(rep => rep.index === index)
        if (indexOfExistingReplacement !== -1) return
    }

    const edit = {
        target: targetString,
        originalSubstitute,
        method,
        type
    }
    
    const replacement = {
        isBroken: false,
        edit,
        index:index,
        length:targetString.length,
        replacement: createMarker(targetString, method, type, originalSubstitute)
    }
    replacementsArray.push(replacement)
}