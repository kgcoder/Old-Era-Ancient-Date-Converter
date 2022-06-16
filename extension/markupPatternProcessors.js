/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
function ignoreSecondYearInRangeWithInnerSpansIfNeeded(html, replacementsArray) {
    let result;
    const reg = giReg(yearRangeInMarkupWithInnerSpansPattern)
    while ((result = reg.exec(html))) {
        //console.log('ignoreSecondYearInRangeWithInnerSpansIfNeeded',result)
        const stringTillBeginingOfYear2Span = result[1] || ''
        const year1StringWithoutMarkup = result[3] || ''
        let method1 = result[5] || ''
        const substitute1 = result[9] || ''
        const year1String = result[10] || ''
        const mainYear2SpanOpening = result[15] || ''
        const substitute2 = result[20] || ''
        const nakedYear2String = result[21] || ''
        const spanOpening = result[22] || ''
        const spanSpace = result[23] || ''
        const spanClosing = result[24] || ''
        const nakedBC = result[25] || ''

  
        let year1 = 0
        if (!method1) {
            year1 = numberFromString(year1StringWithoutMarkup)
        } else {
            year1 = numberFromString(substitute1 ? substitute1 : year1String)   
        }

        if (year1 > 10000) {
            let index = result.index + stringTillBeginingOfYear2Span.length + mainYear2SpanOpening.length
            addReplacement(replacementsArray, 'bc-ig', nakedYear2String, index, false)
            
            index += nakedYear2String.length + spanOpening.length
            addReplacement(replacementsArray, 'bc-ig', spanSpace, index, false)

            index += spanSpace.length + spanClosing.length
            addReplacement(replacementsArray, 'bc-ig', nakedBC, index, false)

        }
    }
}


function ignoreSecondYearInRangeWithoutInnerSpansIfNeeded(html, replacementsArray) {
    let result;
    const reg = giReg(yearRangeInMarkupPattern)
    while ((result = reg.exec(html))) {
        //console.log('ignoreSecondYearInRangeWithoutInnerSpansIfNeeded',result)

        const stringTillBeginingOfYear2Span = result[1] || ''
        const year1StringWithoutMarkup = result[2] || ''
        let method1 = result[4] || ''
        const substitute1 = result[8] || ''
        const year1String = result[9] || ''
        const mainYear2SpanOpening = result[14] || ''
        const year2String = result[20] || ''
   

  
        let year1 = 0
        if (!method1) {
            year1 = numberFromString(year1StringWithoutMarkup)
        } else {
            year1 = numberFromString(substitute1 ? substitute1 : year1String)   
        }

        if (year1 === 0 || year1 > 10000) {
            const index = result.index + stringTillBeginingOfYear2Span.length + mainYear2SpanOpening.length
            addReplacement(replacementsArray, 'bc-ig', year2String, index, false)

        }
    }
}


function ignoreSecondYearInRangeWhenOnlyFirstIsInMarkup(html, replacementsArray) {
    let result;
    const reg = giReg(yearRangeWithFirstYearInMarkupPattern)
    while ((result = reg.exec(html))) {
        //console.log('ignoreSecondYearInRangeWhenOnlyFirstIsInMarkup',result)
        const stringTillYear2 = result[1] || ''
        const year1String = result[8] || ''
        const year2FullString = result[17] || ''
        const year2NakedString = result[18] || ''
        const sup = result[21] || ''
        const fullBC = result[23] || ''
        const spanOpening = result[25] || ''
        const spanSpace = result[26] || ''
        const spanClosing = result[27] || ''
        const nakedBC = result[28] || ''

        const year1 = numberFromString(year1String)

        if (year1 === 0 || year1 > 10000) {

            let index = result.index + stringTillYear2.length

            if (!sup && !spanOpening) {
                addReplacement(replacementsArray, 'bc-ig', year2FullString, index, false)
            } else {
                addReplacement(replacementsArray, 'bc-ig', year2NakedString, index, false)

                index += year2NakedString.length + sup.length
                if (!spanOpening) {
                    addReplacement(replacementsArray, 'bc-ig', fullBC, index, false)
                } else {
                    index += spanOpening.length
                    addReplacement(replacementsArray, 'bc-ig', spanSpace, index, false)

                    index += spanSpace.length + spanClosing.length
                    addReplacement(replacementsArray, 'bc-ig', nakedBC, index, false)
                }
            }
        }
    }
}


function createYearRangeReplacementsFromMarkup(html, replacementsArray) {
    let result;
    const reg = giReg(yearRangeInMarkupWithInnerSpansPattern)
    while ((result = reg.exec(html))) {

        const stringTillBeginingOfYear2Span = result[1]
        const stringTillYear1 = result[2] || ''
        const year1StringWithoutMarkup = result[3] || ''
        let method1 = result[5] || ''
        const type1 = result[7] || ''
        const substitute1 = result[9] || ''
        const year1String = result[10] || ''
        const mainYear2SpanOpening = result[15] || ''
        const method2 = result[16] || ''
        const substitute2 = result[20] || ''
        const nakedYear2String = result[21] || ''
        const spanOpening = result[22] || ''
        const spanSpace = result[23] || ''
        const spanClosing = result[24] || ''
        const nakedBC = result[25] || ''

    

        let year1 = 0
        if (!method1) {
            year1 = numberFromString(year1StringWithoutMarkup)
        } else {
            year1 = numberFromString(substitute1 ? substitute1 : year1String)
            
        }

        if (year1 === 0 || year1 > 10000) {
            let index = result.index + stringTillBeginingOfYear2Span.length + mainYear2SpanOpening.length
            addReplacement(replacementsArray, 'bc-ig', nakedYear2String, index, false)
            
            index += nakedYear2String.length + spanOpening.length
            addReplacement(replacementsArray, 'bc-ig', spanSpace, index, false)

            index += spanSpace.length + spanClosing.length
            addReplacement(replacementsArray, 'bc-ig', nakedBC, index, false)


        }
    }
}


function createCenturiesAndMillenniaReplacementsFromMarkup(html, replacementsArray) {
    let result;
    const reg = giReg(centuriesAndMillenniaMarkupPattern)
    while ((result = reg.exec(html))) {

        const stringTillBC = result[1] || ''
        const spanOpening = result[2] || ''
        let method = result[3] || ''
        const centuryString = result[7] || ''
        const bcSpanOpening = result[15] || ''
        const space = result[16] || ''
        const centMill = result[12] || ''
        const bc = result[13] || ''
        const totalBCSpan = result[14] || ''
        const nakedBC = result[18] || ''
        let type = result[5] || ''

        const spaceBeforeSmallTag = result[14] || ''
        const smallTag = result[24] || ''
        const smallBC = result[25] || ''


        if (method === 'bc-m' && (centMill === 'millennium' || centMill === 'millennia')) {
            method = 'millennium'
        } else if (method === 'bc-c') {
            method = 'century'
        } else {
            return
        }

        type = convertTypeFromMakup(type)
   

        const index = result.index + spanOpening.length
        addReplacement(replacementsArray, method, centuryString, index , false, type)

        if(smallTag){
            let index = result.index + stringTillBC.length
            addReplacement(replacementsArray, 'remove', spaceBeforeSmallTag, index, false, type)
            
            index += spaceBeforeSmallTag.length + smallTag.length
            addReplacement(replacementsArray, 'remove', smallBC, index, false, type)

        }else if (bcSpanOpening.length) {
            let index = result.index + stringTillBC.length + bcSpanOpening.length
            addReplacement(replacementsArray, 'remove', space, index, false, type)
            
            index = result.index + stringTillBC.length + totalBCSpan.length
            addReplacement(replacementsArray, 'remove', nakedBC, index , false, type)
        } else {
            const index = result.index + stringTillBC.length
            addReplacement(replacementsArray, 'remove', bc, index , false, type)
        }
    }
}


function createYearReplacementsWithInnerSpansFromMarkup(html, replacementsArray) {
    let result;
    const reg = giReg(markupWithInnerSpansPattern)
    while ((result = reg.exec(html))) {

        const spanOpening = result[1] || ''
        let method = result[2] || ''
        let type = result[4] || ''
        let substitute = result[6] || ''
        const target = result[7] || ''
        const bcSpanOpening = result[8] || ''
        const space = result[9] || ''
        const bcSpanClosing = result[10] || ''
        const bc = result[11] || ''


        if(target.includes('class="bc-'))continue

        
        method = methodConversions[method]

        if (['year', 'impreciseYear'].includes(method)) {
            const year = numberFromString(target)
            if (year === 0 || year > 10000) {
                method = 'bc-ig'
            }
        }
        
        
        type = convertTypeFromMakup(type)
        
        let index = result.index + spanOpening.length
        addReplacement(replacementsArray, method, target, index, true, type, substitute)

        let removingMethod = method === 'bc-ig' ? 'bc-ig' : 'remove'

        index += target.length + bcSpanOpening.length
        addReplacement(replacementsArray, removingMethod, space, index, true, type, substitute)

        index += space.length + bcSpanClosing.length
        addReplacement(replacementsArray, removingMethod, bc, index, true, type, substitute)


    }
}

function createReplacementsFromMarkup(html, replacementsArray) {
    let result;   
    const reg = giReg(generalMarkupPattern)
    while ((result = reg.exec(html))) {

        const spanOpening = result[1] || ''
        let method = result[2] || ''
        let type = result[4] || ''
        let substitute = result[6] || ''
        const target = result[7] || ''

        const index = result.index + spanOpening.length

        method = methodConversions[method]


        type = convertTypeFromMakup(type)

        if (['year', 'impreciseYear'].includes(method)) {
            const year = numberFromString(target)
            if (year === 0 || year > 10000) {
                method = 'bc-ig'
            }
        }

        addReplacement(replacementsArray, method, target, index, true, type, substitute)

    }
}



function findH2Headlines(html, replacementsArray){
    let result;
    const reg = new RegExp(h2Pattern, "gi");
  
    while ((result = reg.exec(html))) {
        const headline = result[1] || ''
        if(!headline)continue

        processOneHeadline(headline, html, replacementsArray)

    }
}



function processOneHeadline(headline, html, replacementsArray){
    const reg = new RegExp(generalMarkupPattern, "gi");
    const firstSpanReg = new RegExp(`<span class="bc-[^>]*>`,"gi")
    const resultsArray = []
    while ((result = reg.exec(headline))) {
        let method = result[2] || ''
        let type = result[4] || ''
        const originalSubstitute = result[6] || ''
        const target = result[7] || ''
        type = convertTypeFromMakup(type)
        method = methodConversions[method]
        resultsArray.push({method,type,target, originalSubstitute})
    }

    if(resultsArray.length == 0)return

    const cleanHeader = headline.replace(firstSpanReg,'<span>')

    const cleanHeaderReg = new RegExp(escapeText(cleanHeader), "gi")

    const res = cleanHeaderReg.exec(html)

    const mainIndex = res.index

    for (let i = 0; i < resultsArray.length; i++) {
        let {method,type,target, originalSubstitute} = resultsArray[i]
        const cleanSpanReg = new RegExp(`(<span>)(${target})</span>`, 'i')
        const localIndex = cleanHeader.search(cleanSpanReg) + '<span>'.length
        
        if(localIndex < 0)return
        
        const index = mainIndex + localIndex

        addReplacement(replacementsArray, method,target,index, false, type, originalSubstitute)
    }

}