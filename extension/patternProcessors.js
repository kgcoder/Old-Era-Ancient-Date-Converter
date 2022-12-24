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
            if (year > 10000 || year === 0) return
            instances.push({index,target})
        }
        instances.pop()
        instances.forEach(({ index, target }) => {
            const method = methodForYear(numberFromString(target),pageData)
            addReplacement(replacementsArray,method,target,index, true)
        })
    }
}




function processRoundYearRangePattern2(text, replacementsArray, pageData) {
    let result;
    const reg = giReg2(roundYearRangePattern2)
    while ((result = reg.exec(text))) {
        console.log('round year range result',result)
         const stringTillSecondYear= result[1]
         const firstYearString = result[2]
         const nakedSecondYearString = result[8]
         const space = result[9]
         const bc = result[10]



        let method1 = 'year'
        let method2 = 'year'
        const firstYear = numberFromString(firstYearString)
        const secondYear = numberFromString(nakedSecondYearString)
        console.log({firstYear})
        console.log({secondYear})

        const {isPageAboutEarlyCenturyOrMillennium} = pageData

        console.log({isPageAboutEarlyCenturyOrMillennium})
        
        if (!isPageAboutEarlyCenturyOrMillennium && firstYear >= 3000) {
            method1 = 'impreciseYear'
        }

        if (!isPageAboutEarlyCenturyOrMillennium && secondYear >= 3000) {
            method2 = 'impreciseYear'
        }

        if(firstYear > 10000 && secondYear > 10000){
            method1 = 'bc-ig'
            method2 = 'bc-ig'
        }else if(firstYear > 10000 && secondYear <= 10000){
            method1 = 'bc-ybc'
            method2 = method2 === 'impreciseYear' ? 'bc-ioe' : 'bc-yoe'
        }else if (firstYear <= 10000 && secondYear < firstYear){
            method1 = method1 === 'year' ? 'bc-y_' : 'bc-i_'
            if(shouldUseDotNotation && Math.floor(firstYear/100) === Math.floor(secondYear/100)){
                method2 = method2 === 'year' ? 'yearShort' : 'impreciseYearShort'
            }
        }

   
        addIntermediaryReplacement(replacementsArray, method1, firstYearString, result.index)     
        let index = result.index + stringTillSecondYear.length
        addIntermediaryReplacement(replacementsArray, method2, nakedSecondYearString, index)     

        if (method2 !== 'bc-ig') method2 = 'remove'

        index += nakedSecondYearString.length
        addIntermediaryReplacement(replacementsArray, method2, space, index)     

        index += space.length
        addIntermediaryReplacement(replacementsArray, method2, bc, index)     

    }
}

function processSimpleYearRangePattern(html, replacementsArray,pageData) {
    let result;
    const reg = giReg(simpleYearRangePattern)
    while ((result = reg.exec(html))) {
        const stringTillBeginingOfYear2 = result[1] || ''
        const year1String = result[3] || ''
        const year2FullString = result[8] || ''
  

        const year2StringBeforeSpan = result[10] || ''
        const spanOpening = result[13] || ''
        const spaceInSpan = result[14] || ''
        const spanClosing = result[15] || ''
        const bcAfterSpan = result[16] || ''  

        const year2StringBeforeSmallTag = result[10] || ''
        const smallTag = result[22] || ''
        const spaceBeforeSmallTag = result[12] || ''
        const smallBC = result[23] || ''

        let method1 = 'year'
        let method2 = 'year'

        const firstYear = numberFromString(year1String)
        const secondYear = numberFromString(year2FullString)

        const {isPageAboutEarlyCenturyOrMillennium} = pageData
        
        if (!isPageAboutEarlyCenturyOrMillennium && firstYear >= 3000) {
            method1 = 'impreciseYear'
        }

        if (!isPageAboutEarlyCenturyOrMillennium && secondYear >= 3000) {
            method2 = 'impreciseYear'
        }

        if(firstYear > 10000 && secondYear > 10000){
            method1 = 'bc-ig'
            method2 = 'bc-ig'
        }else if(firstYear > 10000 && secondYear <= 10000){
            method1 = 'bc-ybc'
            method2 = method2 === 'impreciseYear' ? 'bc-ioe' : 'bc-yoe'
        }else if (firstYear <= 10000 && secondYear < firstYear){
            method1 = method1 === 'year' ? 'bc-y_' : 'bc-i_'
            if(shouldUseDotNotation && Math.floor(firstYear/100) === Math.floor(secondYear/100)){
                method2 = method2 === 'year' ? 'yearShort' : 'impreciseYearShort'
            }
        }


        let index = result.index
        addReplacement(replacementsArray, method1, year1String, index)

        if(spanOpening){
            index += stringTillBeginingOfYear2.length
            addReplacement(replacementsArray, method2, year2StringBeforeSpan, index)

            if (method2 !== 'bc-ig') method2 = 'remove'

            index += year2StringBeforeSpan.length + spanOpening.length
            addReplacement(replacementsArray, method2, spaceInSpan, index)

            index += spaceInSpan.length + spanClosing.length
            addReplacement(replacementsArray, method2, bcAfterSpan, index)
        }else if(smallTag){
            index += stringTillBeginingOfYear2.length
            addReplacement(replacementsArray, method2, year2StringBeforeSmallTag, index)

            if (method2 !== 'bc-ig') method2 = 'remove'
            
            index += year2StringBeforeSmallTag.length
            addReplacement(replacementsArray, method2, spaceBeforeSmallTag, index)

            index += spaceBeforeSmallTag.length + smallTag.length
            addReplacement(replacementsArray, method2, smallBC, index)


        }else{
            index += stringTillBeginingOfYear2.length
            addReplacement(replacementsArray, method2, year2FullString, index)
        }

    }
}

function processYearRangePattern2(text,replacementsArray, pageData){
    let result;
    const reg = giReg2(yearRangePattern2)
  
    while ((result = reg.exec(text))) {
        console.log("yearRangePattern2 result",result)

        const partTillYearA2 = result[1] || ''
        const yearA1String = result[2] || ''
        const yearA2String = result[4] || ''
        const yearB1String = result[12] || ''
 

        const yearA1 = numberFromString(yearA1String)
        const yearA2 = numberFromString(yearA2String)
        
        let yearA2Substitute = ''
        let method = methodForYear(yearA2, pageData)
        
        if (!yearA1String && !yearB1String && yearA2 > 10000 || yearA2 === 0) {
            let index = result.index + partTillYearA2.length
            addIntermediaryReplacement(replacementsArray,'bc-ig',yearA2String,index)
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
            addIntermediaryReplacement(replacementsArray, 'year', yearA1String, result.index)
        }

        if (yearA2String) {
            const index = result.index + partTillYearA2.length
            addIntermediaryReplacement(replacementsArray, method, yearA2String, index, true, 'normal', yearA2Substitute)
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


function processYearPattern(text, replacementsArray,pageData) {

    let result;
    const reg = giReg2(yearPattern2)
    while ((result = reg.exec(text))) {
        console.log('year result',result)
        const partTillSpace = result[1] || ''
        const partTillYear2 = result[2] || ''
        const year1String = result[3] || ''
        const nakedYear2String = result[5] || ''
        const space = result[7] || ''
        const bc = result[8] || ''



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
            addIntermediaryReplacement(replacementsArray, yearMethod, year1String, result.index) 
        }

        if (method === 'year') {
            method = methodForYear(year2,pageData)
        }

        let index = result.index + partTillYear2.length
        addIntermediaryReplacement(replacementsArray, method, nakedYear2String, index, true, 'normal', year2Substitute)       
        index = result.index + partTillSpace.length
        addIntermediaryReplacement(replacementsArray, 'remove', space, index)
        index += space.length
        addIntermediaryReplacement(replacementsArray, 'remove', bc, index)




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



function processYearMonthRangePattern(text, replacementsArray) {
    let result;
    const reg = giReg2(yearMonthRangePattern2)
    while ((result = reg.exec(text))) {
         const yearString = result[2] || ''
         const middleWord = result[6] || ''
         const monthName = result[15] || ''
         const secondYearNakedString = result[16] || ''
         if (monthName && middleWord.toLowerCase() === 'or') continue
         const year = numberFromString(yearString)
         const year2 = numberFromString(secondYearNakedString)
         if(year <= year2)continue
         if(year > 10000 || year === 0) continue
         addIntermediaryReplacement(replacementsArray, 'year', yearString, result.index) 
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

function processCenturyRangeWithSlashPattern(html, replacementsArray) {
    let result;
    const reg = giReg(centuryRangeWithSlashPattern)
    while ((result = reg.exec(html))) {
        const century1String = result[1]
        const century2String = result[5]
        addReplacement(replacementsArray, 'century', century1String, result.index)
        const index = result.index + century1String.length + 1
        addReplacement(replacementsArray, 'century', century2String, index)
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

function processMillenniumRangeWithSlashPattern(html, replacementsArray){
    let result;
    const reg = giReg(millenniumRangeWithSlashPattern)
    while ((result = reg.exec(html))) {
        const millennium1String = result[1]
        const millennium2String = result[5]
        addReplacement(replacementsArray, 'millennium', millennium1String, result.index)
        const index = result.index + millennium1String.length + 1
        addReplacement(replacementsArray, 'millennium', millennium2String, index)
    }
}

function processCenturyPattern(text, replacementsArray) {
    processCenturyOrMillenniumPattern(text,replacementsArray,'century')
}

function processMillenniumPattern(text, replacementsArray) {
    processCenturyOrMillenniumPattern(text,replacementsArray,'millennium')
}

function processCenturyOrMillenniumCategoryPattern(html,replacementsArray, method = ''){
    
    if(!method){
        if(isPageCenturyCategory){
            method = 'century'
        }else if(isPageMillenniumCategory){
            method = 'millennium'
        }else{
            return
        }
    }

    const pattern = `(title="Category:${nakedCenturyPattern}(-|${spacePattern})${method} BCE?[^"]*?">)(${nakedCenturyPattern}( BCE?)?)</a></li>`
    const reg = new RegExp(pattern, "gi");

    while ((result = reg.exec(html))) {
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
        const stringTillTarget = additionalResult[1] || ''
        const targetString = additionalResult[2] || ''
        if(method === 'millennium' && parseInt(targetString,10) > 10) return
        const index = additionalResult.index + stringTillTarget.length

        addReplacement(replacementsArray, method, targetString, index)

    }

}




function processDecadeCategoryPattern(html, replacementsArray){
    if(!isPageDecadeCategory)return

    const pattern = `(title="Category:${nakedDecadePattern} BCE?[^"]*?">)(${nakedDecadePattern}( BCE?)?)</a>`
    const reg = new RegExp(pattern, "gi");

    while ((result = reg.exec(html))) {
         const stringTillTarget = result[1] || ''
         const targetString = result[2] || ''
         const index = result.index + stringTillTarget.length
         addReplacement(replacementsArray, 'bc-sd', targetString, index)

    }

    const additionalPattern = `(<a class="mw-selflink selflink">)(${nakedDecadePattern})</a>`
    const additionalReg = new RegExp(additionalPattern, "gi");
    const additionalResult = additionalReg.exec(html)
    if(additionalResult){
        const stringTillTarget = additionalResult[1] || ''
        const targetString = additionalResult[2] || ''
       
        const index = additionalResult.index + stringTillTarget.length
        addReplacement(replacementsArray, 'bc-sd', targetString, index)
    }

    const additionalPattern2 = `(<li><b>)(${nakedDecadePattern})</b></li>`
    const additionalReg2 = new RegExp(additionalPattern2, "gi");
    const additionalResult2 = additionalReg2.exec(html)
    if(additionalResult2){
        const stringTillTarget = additionalResult2[1] || ''
        const targetString = additionalResult2[2] || ''
        const index = additionalResult2.index + stringTillTarget.length
        addReplacement(replacementsArray, 'bc-sd', targetString, index)
    }

    processCenturyOrMillenniumCategoryPattern(html, replacementsArray, 'century')

}


function processCenturyOrMillenniumPattern(text, replacementsArray, method) {
    
    let result;
    let pattern = method === 'millennium' ? millenniumPattern2 : centuriesPattern2
    const reg = giReg2(pattern)
    while ((result = reg.exec(text))) {
        const stringTillSpace = result[1] || ''
        const centuryString = result[2] || ''
        if(method === 'millennium' && parseInt(centuryString, 10) > 10) continue
        const space = result[9] || ''
        const bc = result[10] || ''
    
        addIntermediaryReplacement(replacementsArray, method, centuryString, result.index)
        let index = result.index + stringTillSpace.length
        addIntermediaryReplacement(replacementsArray,'remove',space,index)
        index += space.length
        addIntermediaryReplacement(replacementsArray,'remove',bc,index)
        
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






function processDecadePattern2(text, replacementsArray){
    let result;
    const reg = giReg2(decadePattern2)
    while ((result = reg.exec(text))) {
        console.log('decade result',result)
        const decadeString = result[1] || ''
        const space = result[2] || ''
        const bc = result[3] || ''

        
        let index = result.index
        addIntermediaryReplacement(replacementsArray,'decade',decadeString,index)
        index += decadeString.length
        addIntermediaryReplacement(replacementsArray,'remove',space,index)
        index += space.length
        addIntermediaryReplacement(replacementsArray,'remove',bc,index)


    }

}



