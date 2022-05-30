/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

function getLocalReplacements(htmlWithIgParts, replacementsArray) {

    // createCenturiesAndMillenniaReplacementsFromAltMarkup(htmlWithIgParts, replacementsArray)
    // createYearReplacementsWithInnerSpansFromAltMarkup(htmlWithIgParts, replacementsArray)
    // createReplacementsFromAltMarkup(htmlWithIgParts, replacementsArray)

    createCenturiesAndMillenniaReplacementsFromMarkup(htmlWithIgParts, replacementsArray)

    ignoreSecondYearInRangeWithInnerSpansIfNeeded(htmlWithIgParts, replacementsArray)
    ignoreSecondYearInRangeWithoutInnerSpansIfNeeded(htmlWithIgParts, replacementsArray)
    ignoreSecondYearInRangeWhenOnlyFirstIsInMarkup(htmlWithIgParts, replacementsArray)

    createYearReplacementsWithInnerSpansFromMarkup(htmlWithIgParts, replacementsArray)
    createReplacementsFromMarkup(htmlWithIgParts, replacementsArray)
    
    createAutomaticReplacements(htmlWithIgParts, replacementsArray)

    
}








function createAutomaticReplacements(html, replacementsArray) {

    processRoundYearRangePattern(html, replacementsArray)
    processYearRangePattern(html, replacementsArray)
    processSimpleYearRangePattern(html, replacementsArray)
    processLongYearListPattern(html, replacementsArray)
    processYearRangeWithCircasPattern(html, replacementsArray)
    processYearMonthRangePattern(html, replacementsArray)
    processCenturyRangePattern(html, replacementsArray)
    processMillenniumRangePattern(html, replacementsArray)
    processDecadeRangePattern(html, replacementsArray)
    processYearPattern(html, replacementsArray)
    processDecadePattern(html, replacementsArray)
    processCenturyPattern(html, replacementsArray)
    processMillenniumPattern(html, replacementsArray)

}




function addReplacement(replacementsArray, method,targetString,index, checkIfExists = true, type = 'normal', originalSubstitute = '') {
    
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