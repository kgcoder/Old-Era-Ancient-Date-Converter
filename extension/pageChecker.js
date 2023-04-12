/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
function countProperBCs(html) {
    const pattern = new RegExp('(( |&nbsp;)(bc|b\\.c\\.)(e|e\\.)?)', 'gi')
    const properBCsCount = getOccurrences(html, pattern, 0).length
    return properBCsCount

}


function getOccurrences(string, pattern, index) {

    const occurrences = []
    let result
    while ((result = pattern.exec(string))) {
        occurrences.push(result[index])
    }

  
    return occurrences
}


function prepareVersionInfo(serverResponse) {

    console.log('serverResponse',serverResponse)

    numberOfBCsHasChangedInCurrentPage = serverResponse.numberOfBCsHasChanged || false
   
    currentVersionSeemsOK = !issuesInCurrentPageExist

   



    lastOkVersion = currentVersion != serverResponse.lastOkVersion &&
        serverResponse.lastOkVersion != serverResponse.translatedForVersion ?
        serverResponse.lastOkVersion : ''

    translatedForVersion = currentVersion != serverResponse.translatedForVersion ? serverResponse.translatedForVersion : ''

    isCurrentVersionVerified = currentVersion == serverResponse.translatedForVersion

    pageNotAnalysedYet = (typeof serverResponse.properBCs === 'undefined')

    pageHasNoBCDates = !pageNotAnalysedYet && serverResponse.properBCs == 0

    pageIsNotTranslatedYet = !pageHasNoBCDates && !serverResponse.editsCount

   

}