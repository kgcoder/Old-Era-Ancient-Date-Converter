/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

function giReg(pattern) {
    pattern = negativeLookaheadPattern + pattern
    return new RegExp(pattern, "gi");
}


function convertTypeFromMakup(typeInMarkup) {
    if (!typeInMarkup) {
            return 'normal'
    } else if (typeInMarkup.includes('b')) {
            return 'bookTitle'
    } else if (typeInMarkup.includes('q')) {
            return'quote'
    }
    return 'normal'
}
 
function numberFromString(string) {
    const newString = string.replace(/[^\d]/g, '')
    return parseInt(newString, 10)
}

function methodForYear(year) {
    if (year >= 3000 && year % 10 === 0) return'impreciseYear'
    return 'year'
}