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

    processRoundYearRangePattern(html, replacementsArray, pageData)
    processYearRangePattern(html, replacementsArray, pageData)
    processSimpleYearRangePattern(html, replacementsArray, pageData)
    processLongYearListPattern(html, replacementsArray, pageData)
    processYearRangeWithCircasPattern(html, replacementsArray, pageData)
    processYearMonthRangePattern(html, replacementsArray)
    processYearPattern(html, replacementsArray, pageData)
    processCenturyOrMillenniumCategoryPattern(html,replacementsArray)
    processCenturyRangePattern(html, replacementsArray)
    processMillenniumRangePattern(html, replacementsArray)
    processDecadeCategoryPattern(html, replacementsArray)
    processDecadeRangePattern(html, replacementsArray)
    processDecadePattern(html, replacementsArray)
    processCenturyPattern(html, replacementsArray)
    processMillenniumPattern(html, replacementsArray)

  

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