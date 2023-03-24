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
    console.log('set from current')
    let currentLocation = window.location.toString()
    if (currentLocation.includes('localhost')) {
        document.body.innerHTML = currentHTML
    } else {
        const parser = new DOMParser();
        const bodyDOM = parser.parseFromString(currentHTML, "text/xml");
        document.body = bodyDOM.documentElement
    }

}


//TODO:Remove this method
function removeProblematicPartsFromHtml(html){
    html = html.replace('"=""','') 
    html = html.replace('<mw:tocplace>','')
    html = html.replace('</mw:tocplace>','')
    return html
}