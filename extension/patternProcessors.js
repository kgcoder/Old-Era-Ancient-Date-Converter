/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

function processListWithMonthNamePattern(text, replacementsArray){
    let result;
    const reg = giRegForText(longYearListWithMonthPattern)
    while ((result = reg.exec(text))) {
        const stringTillDate = result[1]
        const dateString = result[5]
        const index = result.index + stringTillDate.length
        addIntermediaryReplacement(replacementsArray,'bc-ig',dateString,'',index, true)
    }
}



function processLongYearListPattern(text, replacementsArray, pageData) {
    let result;
    const yearReg = giRegForText(nakedYearPattern)
    const reg = giRegForText(longYearListPattern)



    if(pageData){

    }
    while ((result = reg.exec(text))) {
         const fullString = result[0]
         let yearResult
         const instances = []
         while (yearResult = yearReg.exec(fullString)) {
             const index = result.index + yearResult.index
             const target = yearResult[0]
            
             const year = numberFromString(target)
             if (year > firstYearOfOldEra || year === 0) return
             instances.push({index,target})
         }
         instances.pop()
        instances.forEach(({ index, target }) => {
            const method = methodForYear(numberFromString(target),pageData)
            addIntermediaryReplacement(replacementsArray,method,target,'',index, true)
        })
    }
}







function processYearRangePattern(text,replacementsArray, pageData){
    
    const {isPageAboutEarlyCenturyOrMillennium} = pageData

    let result;
    const reg = giRegForText(yearRangePattern)
  
    while ((result = reg.exec(text))) {
        const partTillSpace = result[1] || ''
        const partTillYearB2 = result[2] || ''
        const partTillYearB1 = result[3] || ''
        const partTillYearA2 = result[4] || ''

        const yearA1String = result[5] || ''
        const yearA2String = result[7] || ''
        const yearB1String = result[15] || ''
        const yearB2String = result[17] || ''
        const space = result[19] || ''
        const bc = result[20] || ''

 

        const yearA1 = numberFromString(yearA1String)
        const yearA2 = numberFromString(yearA2String)
        const yearB1 = numberFromString(yearB1String)
        const yearB2 = numberFromString(yearB2String)
        
        let yearA2Substitute = ''
        let yearB2Substitute = ''
    

        
        if (yearA1String) {
            const { numberOfDigits, realYear } = checkIfSecondYearIsShortened(yearA1, yearA2)
            
            let methodA1 = methodForYear(yearA1, pageData)
            
            let methodA2 = methodForYear(realYear, pageData)
            
            
            if (numberOfDigits !== 0) {
                yearA2Substitute = `${realYear}`    
            }
            if (numberOfDigits === 1) {
                methodA2 = 'oneDigitYear'
                
            } else if (numberOfDigits === 2) {
                methodA2 = methodA2 == 'impreciseYear' ? 'bc-i2' : 'twoDigitYear'     
            }
            

            addIntermediaryReplacement(replacementsArray, methodA1, yearA1String,'', result.index)
            const index = result.index + partTillYearA2.length
            addIntermediaryReplacement(replacementsArray, methodA2, yearA2String,'', index, true, 'normal', yearA2Substitute)
            
        }

        if (yearB1String) {

            if(!yearA1String){
                let methodA2 = methodForYear(yearA2, pageData)
                const index = result.index + partTillYearA2.length
                addIntermediaryReplacement(replacementsArray, methodA2, yearA2String,'', index)
                
            }
            let methodB1 = methodForYear(yearB1, pageData)
            
            const { numberOfDigits, realYear } = checkIfSecondYearIsShortened(yearB1, yearB2)
            
            let methodB2 = methodForYear(realYear, pageData)
            
            if (numberOfDigits !== 0) {
                yearB2Substitute = `${realYear}`    
            }
            if (numberOfDigits === 1) {
                methodB2 = 'oneDigitYear'

            } else if (numberOfDigits === 2) {
                methodB2 = methodB2 == 'impreciseYear' ? 'bc-i2' : 'twoDigitYear'      
            }


         
            let index = result.index + partTillYearB1.length
            addIntermediaryReplacement(replacementsArray, methodB1, yearB1String,'', index)
            index = result.index + partTillYearB2.length
            addIntermediaryReplacement(replacementsArray, methodB2, yearB2String,'', index, true, 'normal', yearB2Substitute)
            index = result.index + partTillSpace.length
            if(space.length){
                addIntermediaryReplacement(replacementsArray, 'remove', space,'', index)
            }
            index += space.length
            addIntermediaryReplacement(replacementsArray, 'remove', bc,'', index)
            
        }

        if(yearA1String && !yearB1String){
            let index = result.index + partTillYearB2.length
            let  methodB2 = methodForYear(yearB2, pageData)
            addIntermediaryReplacement(replacementsArray, methodB2, yearB2String,'', index, true, 'normal', yearB2Substitute)
            index = result.index + partTillSpace.length
            if(space.length){
                addIntermediaryReplacement(replacementsArray, 'remove', space,'', index)
            }
            index += space.length
            addIntermediaryReplacement(replacementsArray, 'remove', bc,'', index)
        }


        if(yearA1String || yearB1String) continue;//for now don't worry about labels if slashes are used
            
    
        let method1 = 'bc-y-r1'
        let method2 = 'bc-y-r2'
        if (!isPageAboutEarlyCenturyOrMillennium && yearA2 % 10 === 0 && yearA2 >= 3000) {
            method1 = 'bc-i-r1'
        }

        if (!isPageAboutEarlyCenturyOrMillennium && yearB2 % 10 === 0 && yearB2 >= 3000) {
            method2 = 'bc-i-r2'
        }



        if(yearA2 > firstYearOfOldEra && yearB2 > firstYearOfOldEra){
            method1 = 'bc-ig'
            method2 = 'bc-ig'
        }else if(yearA2 > firstYearOfOldEra && yearB2 <= firstYearOfOldEra){
          //  method1 = 'bc-ybc'
          //  method2 = method2 === 'impreciseYear' ? 'bc-ioe' : 'bc-yoe'
        }else if (yearA2 <= firstYearOfOldEra && yearB2 < yearA2){
          //  method1 = method1 === 'year' ? 'bc-y_' : 'bc-i_'
            if(yearB2 >= firstYearOfOldEra - lastTranslatedYearWithLabel){//4000 (10000 - 6000)
          //      method2 = method2 ===  'impreciseYear' ? 'bc-ioe' : 'bc-yoe' 
            }
            // if(shouldUseDotNotation && Math.floor(yearA2/100) === Math.floor(yearB2/100)){
            //     method2 = method2 === 'bc-y-r2' ? 'yearShort' : 'impreciseYearShort'
            // }
        }


        let index = result.index + partTillYearA2.length
        addIntermediaryReplacement(replacementsArray, method1, yearA2String, yearB2String, index)
        index = result.index + partTillYearB2.length
        addIntermediaryReplacement(replacementsArray, method2, yearB2String, yearA2String, index)
        index = result.index + partTillSpace.length
        method2 = method2 === 'bc-ig' ? 'bc-ig' : 'remove'
        if(space.length){
            addIntermediaryReplacement(replacementsArray, method2, space, yearA2String, index)
        }
        index += space.length
        addIntermediaryReplacement(replacementsArray, method2, bc, yearA2String, index)
            
     
    }
}



function processYearToDecadePattern(text,replacementsArray, pageData){

    let result;
    const reg = giRegForText(yearToDecadePattern)
    while ((result = reg.exec(text))) {

        const partTillYearA2 = result[1] || ''
        const yearA1String = result[2] || ''
        const yearA2String = result[4] || ''

        let yearA2Substitute = ''
        let methodA1 = 'year'
        let methodA2 = 'year'

        const yearA1 = numberFromString(yearA1String)
        const yearA2 = numberFromString(yearA2String)

        if (yearA1String) {
            const { numberOfDigits, realYear } = checkIfSecondYearIsShortened(yearA1, yearA2)

            methodA1 = methodForYear(yearA1, pageData)
            methodA2 = methodForYear(realYear, pageData)

            if (numberOfDigits !== 0) {
                yearA2Substitute = `${realYear}`    
            }
            if (numberOfDigits === 1) {
                methodA2 = 'oneDigitYear'
                
            } else if (numberOfDigits === 2) {
                methodA2 = methodA2 == 'impreciseYear' ? 'bc-i2' : 'twoDigitYear'     
            }

            addIntermediaryReplacement(replacementsArray, methodA1, yearA1String,'', result.index) 

        }

        let index = result.index + partTillYearA2.length
        addIntermediaryReplacement(replacementsArray, methodA2, yearA2String,'', index, true, 'normal', yearA2Substitute)

    }

}


function processDecadeToYearPattern(text,replacementsArray){
    let result;
    const reg = giRegForText(decadeToYearPattern)
    while ((result = reg.exec(text))) {
        const nakedDecade = result[1] || ''
        addIntermediaryReplacement(replacementsArray, 'decade', nakedDecade,'', result.index)
    }
}


function processYearPattern(text, replacementsArray,pageData) {

    let result;
    const reg = giRegForText(yearPattern)
    while ((result = reg.exec(text))) {
        const partTillSpace = result[1] || ''
        const partTillYear2 = result[2] || ''
        const year1String = result[3] || ''
        const nakedYear2String = result[5] || ''
        const space = result[7] || ''
        const bc = result[8] || ''

        let year2Substitute = ''
        let method1 = 'year'
        let method2 = 'year'

        const year1 = numberFromString(year1String)
        const year2 = numberFromString(nakedYear2String)
    
         if(nakedYear2String === '000') continue

         if (year1String) {
            const { numberOfDigits, realYear } = checkIfSecondYearIsShortened(year1, year2)

            method1 = methodForYear(year1, pageData)
            method2 = methodForYear(realYear, pageData)

            if (numberOfDigits !== 0) {
                year2Substitute = `${realYear}`    
            }
            if (numberOfDigits === 1) {
                method2 = 'oneDigitYear'
                
            } else if (numberOfDigits === 2) {
                method2 = method2 == 'impreciseYear' ? 'bc-i2' : 'twoDigitYear'     
            }


            addIntermediaryReplacement(replacementsArray, method1, year1String,'', result.index) 

        }

        let index = result.index + partTillYear2.length
        addIntermediaryReplacement(replacementsArray, method2, nakedYear2String,'', index, true, 'normal', year2Substitute)
        index = result.index + partTillSpace.length
        if(space.length){
            addIntermediaryReplacement(replacementsArray, 'remove', space,'', index)
        }
        index += space.length
        addIntermediaryReplacement(replacementsArray, 'remove', bc,'', index)

     }
}








function processYearMonthRangePattern(text, replacementsArray) {
    let result;
    const reg = giRegForText(yearMonthRangePattern)
    while ((result = reg.exec(text))) {
        const yearString = result[1] || ''
        const middleWord = result[5] || ''
        const monthName = result[10] || ''
        const secondYearNakedString = result[14] || ''
        if (monthName && middleWord.toLowerCase() === 'or') continue
        const year = numberFromString(yearString)
        const year2 = numberFromString(secondYearNakedString)
        if(year <= year2)continue
        if(year > firstYearOfOldEra || year === 0) continue
        addIntermediaryReplacement(replacementsArray, 'year', yearString,'', result.index) 
    }
}

function processCenturyRangePattern(text, replacementsArray) {
    let result;
    const reg = giRegForText(centuryRangePattern)
    while ((result = reg.exec(text))) {
         const centuryString = result[1]
        addIntermediaryReplacement(replacementsArray, 'century', centuryString,'', result.index)
    }
}

function processCenturyRangeWithSlashPattern(text, replacementsArray) {
    let result;
    const reg = giRegForText(centuryRangeWithSlashPattern)
    while ((result = reg.exec(text))) {
         const century1String = result[1]
         addIntermediaryReplacement(replacementsArray, 'century', century1String,'', result.index)
    }
}

function processMillenniumRangePattern(text, replacementsArray) {
    let result;
    const reg = giRegForText(millenniumRangePattern)
    while ((result = reg.exec(text))) {
        const centuryString = result[1]
        addIntermediaryReplacement(replacementsArray, 'millennium', centuryString,'', result.index)
    }
}

function processMillenniumRangeWithSlashPattern(text, replacementsArray){
    let result;
    const reg = giRegForText(millenniumRangeWithSlashPattern)
    while ((result = reg.exec(text))) {
        const millennium1String = result[1]
        addIntermediaryReplacement(replacementsArray, 'millennium', millennium1String,'', result.index)
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
        addReplacement(replacementsArray, method, targetString,'', index)
    }

    const additionalPattern = `(<b>)(${nakedCenturyPattern}( BCE?)?)</b></li>`
    const additionalReg = new RegExp(additionalPattern, "gi");

    const additionalResult = additionalReg.exec(html)
    if(additionalResult){
        const stringTillTarget = additionalResult[1] || ''
        const targetString = additionalResult[2] || ''
        if(method === 'millennium' && parseInt(targetString,10) > 10) return
        const index = additionalResult.index + stringTillTarget.length

        addReplacement(replacementsArray, method, targetString,'', index)

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
         addReplacement(replacementsArray, 'bc-sd', targetString,'', index)

    }

    const additionalPattern = `(<a class="mw-selflink selflink">)(${nakedDecadePattern})</a>`
    const additionalReg = new RegExp(additionalPattern, "gi");
    const additionalResult = additionalReg.exec(html)
    if(additionalResult){
        const stringTillTarget = additionalResult[1] || ''
        const targetString = additionalResult[2] || ''
       
        const index = additionalResult.index + stringTillTarget.length
        addReplacement(replacementsArray, 'bc-sd', targetString,'', index)
    }

    const additionalPattern2 = `(<li><b>)(${nakedDecadePattern})</b></li>`
    const additionalReg2 = new RegExp(additionalPattern2, "gi");
    const additionalResult2 = additionalReg2.exec(html)
    if(additionalResult2){
        const stringTillTarget = additionalResult2[1] || ''
        const targetString = additionalResult2[2] || ''
        const index = additionalResult2.index + stringTillTarget.length
        addReplacement(replacementsArray, 'bc-sd', targetString,'', index)
    }

    processCenturyOrMillenniumCategoryPattern(html, replacementsArray, 'century')

}


function processCenturyOrMillenniumPattern(text, replacementsArray, method) {
    
    let result;
    let pattern = method === 'millennium' ? millenniumPattern : centuriesPattern
    const reg = giRegForText(pattern)
    while ((result = reg.exec(text))) {
        const stringTillSpace = result[1] || ''
        const centuryString = result[2] || ''
        if(method === 'millennium' && parseInt(centuryString, 10) > 10) continue
        const space = result[9] || ''
        const bc = result[10] || ''
    
        addIntermediaryReplacement(replacementsArray, method, centuryString,'', result.index)
        let index = result.index + stringTillSpace.length
        if(space.length){
            addIntermediaryReplacement(replacementsArray,'remove',space,'',index)
        }
        index += space.length
        addIntermediaryReplacement(replacementsArray,'remove',bc,'',index)
        
    }
}


    

function processDecadeRangePattern(text, replacementsArray) {
    let result;
    const reg = giRegForText(decadeRangePattern)
    while ((result = reg.exec(text))) {
        const stringTillSecondDecade = result[1] || ''
        const firstDecadeString = result[2] || ''
        const nakedSecondDecade = result[10] || ''
        const space = result[11] || ''
        const bc = result[12] || ''
  
        if (firstDecadeString) {
            addIntermediaryReplacement(replacementsArray, 'bc-sd', firstDecadeString,'', result.index)
        }

        let index = result.index + stringTillSecondDecade.length
        addIntermediaryReplacement(replacementsArray, 'bc-dp', nakedSecondDecade,'', index)
        index += nakedSecondDecade.length
        if(space.length){
            addIntermediaryReplacement(replacementsArray, 'remove', space,'', index)
        }
        index += space.length
        addIntermediaryReplacement(replacementsArray, 'remove', bc,'', index)

    }
}






function processDecadePattern(text, replacementsArray){
    let result;
    const reg = giRegForText(decadePattern)
    while ((result = reg.exec(text))) {
        const decadeString = result[1] || ''
        const space = result[2] || ''
        const bc = result[3] || ''

        
        let index = result.index
        addIntermediaryReplacement(replacementsArray,'decade',decadeString,'',index)
        index += decadeString.length
        if(space.length){
            addIntermediaryReplacement(replacementsArray,'remove',space,'',index)
        }
        index += space.length
        addIntermediaryReplacement(replacementsArray,'remove',bc,'',index)


    }

}



