/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
function processLongYearListPattern(html, replacementsArray, pageData) {
    let result;
    const yearReg = giReg(nakedYearPattern)
    const reg = giReg(longYearListPattern)



    if(pageData){

    }
    while ((result = reg.exec(html))) {

        const fullString = result[0]
        let yearResult
        const instances = []
        while (yearResult = yearReg.exec(fullString)) {
            const index = result.index + yearResult.index
            const target = yearResult[0]
            
            const year = numberFromString(target)
            if (year >= 10000 || year === 0) return
            instances.push({index,target})
        }
        instances.pop()
        instances.forEach(({ index, target }) => {
            const method = methodForYear(numberFromString(target),pageData)
            addReplacement(replacementsArray,method,target,index, true)
        })
    }
}

function processRoundYearRangePattern(html, replacementsArray, pageData) {
    let result;
    const reg = giReg(roundYearRangePattern)
    while ((result = reg.exec(html))) {
  
        const stringTillSecondYear= result[1]
        const firstYearString = result[2]
        const fullSecondYearString = result[7]
        const nakedSecondYearString = result[8]
        const spanOpening = result[10]
        const spanSpace = result[11]
        const spanClosing = result[12]
        const nakedBC = result[13]

        let method = 'year'
        const firstYear = numberFromString(firstYearString)
        const secondYear = numberFromString(nakedSecondYearString)

        const {isPageAboutEarlyCenturyOrMillennium} = pageData
        
        if (!isPageAboutEarlyCenturyOrMillennium && firstYear >= 3000) {
            method = 'impreciseYear'
        }

        if (firstYear >= 10000) {
            method = 'bc-ig'
        }
        
        addReplacement(replacementsArray, method, firstYearString, result.index)     

        if (method !== 'bc-ig' && secondYear < 3000) {
            method = 'year'
        }
        let index = result.index + stringTillSecondYear.length

        if (!spanOpening) {
            addReplacement(replacementsArray, method, fullSecondYearString, index)  

        } else {
            addReplacement(replacementsArray, method, nakedSecondYearString, index)
            
            if (method !== 'bc-ig') method = 'remove'
            
            index += nakedSecondYearString.length + spanOpening.length
            addReplacement(replacementsArray, method, spanSpace, index)

            index += spanSpace.length + spanClosing.length
            addReplacement(replacementsArray, method, nakedBC, index)

        }



    }
}

function processSimpleYearRangePattern(html, replacementsArray,pageData) {
    let result;
    const reg = giReg(yearRangePattern)
    while ((result = reg.exec(html))) {
        const year1String = result[11] || ''
        const year2String = result[32] || ''
        const year1 = numberFromString(year1String)
        const year2 = numberFromString(year2String)

        
        if (year2 >= 10000 || year2 === 0) {
            addReplacement(replacementsArray, 'bc-ig', year1String, result.index)
            return
        }
        
        if (year1String) {
            let method = methodForYear(year1,pageData)
            addReplacement(replacementsArray, method, year1String, result.index)     
        }


    }
}

function processYearRangePattern(html, replacementsArray, pageData) {

    let result;
    const reg = giReg(yearRangePattern)
  
    while ((result = reg.exec(html))) {

        const partTillYearB2 = result[1] || ''  //or is it?
        const partTillYearB1 = result[3] || ''  //or is it?
     
        const partTillYearA2 = result[4] || ''
        const yearA1String = result[5] || ''
        const yearA2String = result[10] || ''

        const yearB1String = result[26] || ''
        const yearB2String = result[30] || ''
        const lastSup = result[34] || ''
        const spanOpening = result[38] || ''
        const spanSpace = result[39] || ''
        const spanClosing = result[40] || ''
        const bc  = result[41] || ''

        const yearA1 = numberFromString(yearA1String)
        const yearA2 = numberFromString(yearA2String)
        
        let yearA2Substitute = ''
        let method = methodForYear(yearA2, pageData)
        
        if (!yearA1String && !yearB1String && yearA2 >= 10000 || yearA2 === 0) {
            let index = result.index + partTillYearA2.length
            addReplacement(replacementsArray, 'bc-ig', yearA2String, index)
            return
        }

        if (yearA1String) {
            const { numberOfDigits, realYear } = checkIfSecondYearIsShortened(yearA1, yearA2)
            if (numberOfDigits !== 0) {
                yearA2Substitute = `${realYear}`    
            }
            if (numberOfDigits === 1) {
                method = 'oneDigitYear'

            } else if (numberOfDigits === 2) {
                method = 'twoDigitYear'      
            }
        }
   

        if (yearA1String) {
            addReplacement(replacementsArray, 'year', yearA1String, result.index)     
        }

        if (yearA2String) {
            const index = result.index + partTillYearA2.length
            addReplacement(replacementsArray, method, yearA2String, index, true, 'normal', yearA2Substitute)
        }

    }
}

function processYearRangeWithCircasPattern(html, replacementsArray,pageData) {
    let result;
    const reg = giReg(yearRangeWithCircasPattern)
    while ((result = reg.exec(html))) {
  
        const stringTillYear = result[1] || ''
        const yearString = result[4] || ''

        if (yearString) {
            const index = result.index + stringTillYear.length
            addReplacement(replacementsArray, methodForYear(numberFromString(yearString),pageData), yearString, index)  
        }
    }
}

function processYearListPattern(html, replacementsArray) {
    let result;
    const reg = giReg(yearListPattern)
    while ((result = reg.exec(html))) {
        const yearString = result[6] || ''
        if (yearString) {
            addReplacement(replacementsArray, 'year', yearString, result.index) 
        }

    }
}



function processYearPattern(html, replacementsArray,pageData) {

    let result;
    const reg = giReg(yearPattern)
    while ((result = reg.exec(html))) {
        console.log('year result',result)
        const partTillYear2 = result[1] || ''
        const year1String = result[2] || ''
        const year2WithBC = result[6] || ''
        const nakedYear2String = result[7] || ''
        const extraSpan = result[9] || ''
        const lastSup = result[10] || ''
        const bcWithSpace = result[12] || ''
        const year2TotalSpan = result[13] || ''
        const year2Space = result[15] || ''
        const spanOpening = result[14] || ''
        const spanClosing = result[16] || ''
        const nakedBC = result[17] || ''

        const spaceBeforeSmallTag = result[13] || ''
        const smallTag = result[23] || ''
        const smallBC = result[24] || ''


        let year2Substitute = ''
        let method = 'year'

        const year1 = numberFromString(year1String)
        const year2 = numberFromString(nakedYear2String)
        
        if(nakedYear2String === '000') continue

        if (year1String) {
            const { numberOfDigits, realYear } = checkIfSecondYearIsShortened(year1, year2)
            if (numberOfDigits !== 0) {
                year2Substitute = `${realYear}`    
            }
            if (numberOfDigits === 1) {
                method = 'oneDigitYear'

            } else if (numberOfDigits === 2) {
                method = 'twoDigitYear'      
            }
        }

        
        if (year1String) {
            let yearMethod = 'year'
            if (method === 'year') {
                yearMethod = methodForYear(year1,pageData)
            }
            addReplacement(replacementsArray, yearMethod, year1String, result.index) 
        }

        if (method === 'year') {
            method = methodForYear(year2,pageData)
        }

        if (!extraSpan && !spanOpening && !smallTag) {
            if (lastSup) {
                let index = result.index + partTillYear2.length
                addReplacement(replacementsArray, method, nakedYear2String, index, true, 'normal', year2Substitute)       
                
                index += nakedYear2String.length + lastSup.length
                addReplacement(replacementsArray, 'remove', bcWithSpace, index)
            } else {
                const index = result.index + partTillYear2.length
                addReplacement(replacementsArray, method, year2WithBC, index, true, 'normal', year2Substitute)        
            }
            
        } else if (extraSpan && spanOpening) {
            let index = result.index + partTillYear2.length
            addReplacement(replacementsArray, method, nakedYear2String, index,true, 'normal', year2Substitute)

            index += nakedYear2String.length + lastSup.length + extraSpan.length + spanOpening.length
            addReplacement(replacementsArray, 'remove', year2Space, index)

            index += year2Space.length + spanClosing.length
            addReplacement(replacementsArray, 'remove', nakedBC, index)
            
        } else if (extraSpan && !spanOpening) {
            let index = result.index + partTillYear2.length
            addReplacement(replacementsArray, method, nakedYear2String, index,true, 'normal', year2Substitute)

            index += nakedYear2String.length + extraSpan.length + lastSup.length
            addReplacement(replacementsArray, 'remove', bcWithSpace, index)
        } else if (!extraSpan && spanOpening) {
            let index = result.index + partTillYear2.length
            addReplacement(replacementsArray, method, nakedYear2String, index,true, 'normal', year2Substitute)

            index += nakedYear2String.length + lastSup.length + spanOpening.length
            addReplacement(replacementsArray, 'remove', year2Space, index)

            index += year2Space.length + spanClosing.length
            addReplacement(replacementsArray, 'remove', nakedBC, index)
            
        }else if (smallTag){
            let index = result.index + partTillYear2.length
            addReplacement(replacementsArray, method, nakedYear2String, index,true, 'normal', year2Substitute)

            index += nakedYear2String.length
            addReplacement(replacementsArray, 'remove', spaceBeforeSmallTag, index)

            index += spaceBeforeSmallTag.length + smallTag.length
            addReplacement(replacementsArray, 'remove', smallBC, index)
        }

    }
}


function checkIfSecondYearIsShortened(year1, year2) {
 
    if (year2 < 10 && year1 > 9) {
        const lastDigit = year1 % 10

        if ((lastDigit === 2 && year2 === 1) || (lastDigit === 1 && year2 === 0)) {
            const realYear = year1 - 1
            return { numberOfDigits: 2, realYear }
        }
        if (lastDigit > year2) {
            const realYear = Math.floor(year1 / 10.0) * 10 + year2
            return { numberOfDigits: 1, realYear }
        }
    }

    if (year2 < 100 && year2 > 9 && year1 > 99) {
        const lastTwoDigits = year1 % 100
        if (lastTwoDigits > year2) {
            const realYear = Math.floor(year1 / 100.0) * 100 + year2
            return { numberOfDigits: 2, realYear }  
        }
    }

    return { numberOfDigits: 0, realYear:year2 }
}



function processYearMonthRangePattern(html, replacementsArray) {
    let result;
    const reg = giReg(yearMonthRangePattern)
    while ((result = reg.exec(html))) {
        const yearString = result[2] || ''
        const middleWord = result[7] || ''
        const monthName = result[12] || ''
        const secondYearNakedString = result[17] || ''
        if (monthName && middleWord.toLowerCase() === 'or') continue
        const year = numberFromString(yearString)
        const year2 = numberFromString(secondYearNakedString)
        if(year <= year2)continue
        if(year >= 10000 || year === 0) continue
        addReplacement(replacementsArray, 'year', yearString, result.index) 
    }
}

function processCenturyRangePattern(html, replacementsArray) {
    let result;
    const reg = giReg(centuryRangePattern)
    while ((result = reg.exec(html))) {
        const centuryString = result[1]
        addReplacement(replacementsArray, 'century', centuryString, result.index)
    }
}

function processMillenniumRangePattern(html, replacementsArray) {
    let result;
    const reg = giReg(millenniumRangePattern)
    while ((result = reg.exec(html))) {
        const centuryString = result[1]
        addReplacement(replacementsArray, 'millennium', centuryString, result.index)
    }
}


function processCenturyPattern(html, replacementsArray) {
    processCenturyOrMillenniumPattern(html,replacementsArray,'century')
}

function processMillenniumPattern(html, replacementsArray) {
    processCenturyOrMillenniumPattern(html,replacementsArray,'millennium')
}

function processCenturyOrMillenniumCategoryPattern(html, replacementsArray){
    let method = ''
    if(isPageCenturyCategory){
        method = 'century'
    }else if(isPageMillenniumCategory){
        method = 'millennium'
    }else{
        return
    }

    const pattern = `(title="Category:${nakedCenturyPattern}(-|${spacePattern})${method} BCE?[^"]*?">)(${nakedCenturyPattern}( BCE?)?)</a></li>`
    const reg = new RegExp(pattern, "gi");

    while ((result = reg.exec(html))) {
        console.log('category result',result)
        const stringTillTarget = result[1] || ''
        const targetString = result[6] || ''
        if(method === 'millennium' && parseInt(targetString,10) > 10) continue
        const index = result.index + stringTillTarget.length
        addReplacement(replacementsArray, method, targetString, index)
    }

    const additionalPattern = `(<b>)(${nakedCenturyPattern}( BCE?)?)</b></li>`
    const additionalReg = new RegExp(additionalPattern, "gi");

    const additionalResult = additionalReg.exec(html)
    if(additionalResult){
        console.log('additional result',additionalResult)
        const stringTillTarget = additionalResult[1] || ''
        const targetString = additionalResult[2] || ''
        if(method === 'millennium' && parseInt(targetString,10) > 10) return
        const index = additionalResult.index + stringTillTarget.length

        addReplacement(replacementsArray, method, targetString, index)

    }

}

function processCenturyOrMillenniumPattern(html, replacementsArray, method) {
    
    let result;
    let pattern = method === 'millennium' ? millenniumPattern : centuriesPattern
    const reg = giReg(pattern)
    while ((result = reg.exec(html))) {
        const stringTillBC = result[1] || ''
        const centuryString = result[2] || ''
        if(method === 'millennium' && parseInt(centuryString, 10) > 10) continue
        const bcWithSpace = result[11] || ''
        const bcSpan = result[12] || ''
        const bcSpanOpening = result[13] || ''
        const spaceInSpan = result[14] || ''
        const bc = result[16] || ''

        const smallTag = result[22] || ''
        const smallBC = result[23] || ''


      
        addReplacement(replacementsArray, method, centuryString, result.index)
        
        if(smallTag.length){
            let index = result.index + stringTillBC.length
            const space = bcSpan
            addReplacement(replacementsArray, 'remove', space, index)
            index += space.length + smallTag.length
            addReplacement(replacementsArray, 'remove', smallBC, index)

        }else if (!bcSpanOpening.length) {
            const index = result.index + stringTillBC.length
            addReplacement(replacementsArray, 'remove', bcWithSpace, index)
        } else {
            let index = result.index + stringTillBC.length + bcSpanOpening.length
            addReplacement(replacementsArray, 'remove', spaceInSpan, index)

            index = result.index + stringTillBC.length + bcSpan.length
            addReplacement(replacementsArray, 'remove', bc, index)
        }
    }
}

function processDecadeRangePattern(html, replacementsArray) {
    let result;
    const reg = giReg(decadeRangePattern)
    while ((result = reg.exec(html))) {
        const stringTillSecondDecade = result[1] || ''
        const firstDecadeString = result[2] || ''
        const fullSecondDecade = result[9] || ''
        const nakedSecondDecade = result[10] || ''
        const spanOpening = result[12] || ''
        const spanSpace = result[13] || ''
        const spanClosing = result[14] || ''
        const bc = result[15] || ''


        if (firstDecadeString) {
            addReplacement(replacementsArray, 'bc-sd', firstDecadeString, result.index)
        }

        let index = result.index + stringTillSecondDecade.length

        if (!spanOpening) {
            addReplacement(replacementsArray, 'bc-dp', fullSecondDecade, index)
        } else {
            addReplacement(replacementsArray, 'bc-dp', nakedSecondDecade, index)

            index += nakedSecondDecade.length + spanOpening.length
            addReplacement(replacementsArray, 'remove', spanSpace, index)

            index += spanSpace.length + spanClosing.length
            addReplacement(replacementsArray, 'remove', bc, index)
        }
    }
}

function processDecadePattern(html, replacementsArray){
    let result;
    const reg = giReg(decadePattern)
    while ((result = reg.exec(html))) {
        console.log('decade result',result)
        const fullString = result[0] || ''
        const spaceBeforeSmallTag = result[2] || ''
        const decadeString = result[1] || ''
        const spanOpening = result[3] || ''
        const spanSpace = result[4] || ''
        const spanClosing = result[5] || ''
        const bc = result[6] || ''
        const smallTag = result[12] || ''
        const smallBC = result[13] || ''


        if (!spanOpening && !smallTag) {
            addReplacement(replacementsArray, 'decade', fullString, result.index)
        } else if (smallTag) {
             addReplacement(replacementsArray, 'decade', decadeString, result.index)

             let index = result.index + decadeString.length
             addReplacement(replacementsArray, 'remove', spaceBeforeSmallTag, index)

              index += spaceBeforeSmallTag.length + smallTag.length
              addReplacement(replacementsArray, 'remove', smallBC, index)

        }else {

        
            addReplacement(replacementsArray, 'decade', decadeString, result.index)

            let index = result.index + decadeString.length + spanOpening.length
            addReplacement(replacementsArray, 'remove', spanSpace, index)

            index += spanSpace.length + spanClosing.length
            addReplacement(replacementsArray, 'remove', bc, index)
        }

    }
}





