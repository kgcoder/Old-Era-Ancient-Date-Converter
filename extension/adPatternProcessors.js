/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */


function processYearRangeWithLeadingADPattern(text,replacementsArray){
    let result;
    const reg = giRegForText(yearRangeWithLeadingADPattern)
    while ((result = reg.exec(text))) {
        const stringUntilSecondYear = result[1] || ''
        const leadingAD = result[2] || ''
        const space = result[4] || ''
        const firstYear = result[5] || ''
        const secondYear = result[9] || ''

        if(space === '\n')return

        let index = result.index
        addIntermediaryReplacement(replacementsArray,'leading-ad',leadingAD,'',index, true)
        index += leadingAD.length
        addIntermediaryReplacement(replacementsArray,'leading-ad-space',space,'',index)
        index += space.length
        addIntermediaryReplacement(replacementsArray,'first-ad-year',firstYear,'',index)
        index = result.index + stringUntilSecondYear.length
        addIntermediaryReplacement(replacementsArray,'second-ad-year',secondYear,'',index)

    }
    
}

function processYearRangeWithTrailingADPattern(text,replacementsArray){
    let result;
    const reg = giRegForText(yearRangeWithTrailingADPattern)
    while ((result = reg.exec(text))) {
        const stringUntilSecondYear = result[1] || ''
        const firstYearString = result[2] || ''
        const secondYearString = result[6] || ''
        const space = result[7] || ''
        const trailingAD = result[8] || ''

        if(space === '\n')return


        let index = result.index

        addIntermediaryReplacement(replacementsArray,'first-ad-year',firstYearString,'',index, true)

        index += stringUntilSecondYear.length 
        addIntermediaryReplacement(replacementsArray,'ignore',secondYearString,'',index, true)

        index += secondYearString.length
        addIntermediaryReplacement(replacementsArray,'trailing-ad-space',space,'',index, true)

        index += space.length
        addIntermediaryReplacement(replacementsArray,'trailing-ad',trailingAD,'',index, true)

    }
    
}

function processYearRangeWithLeadingCEPattern(text,replacementsArray){
    let result;
    const reg = giRegForText(yearRangeWithLeadingCEPattern)
    while ((result = reg.exec(text))) {
        const stringTillSecondYear = result[1] || ''
        const leadingAD = result[2] || ''
        const leadingADSpace = result[4] || ''
        const firstYearString = result[5] || ''
        const secondYearString = result[9] || ''

        if(leadingADSpace === '\n')return


        let index = result.index
        addIntermediaryReplacement(replacementsArray,'leading-ce',leadingAD,'',index, true)
        index += leadingAD.length
        addIntermediaryReplacement(replacementsArray,'leading-ad-space',leadingADSpace,'',index, true)
        index += leadingADSpace.length
        addIntermediaryReplacement(replacementsArray,'first-ad-year',firstYearString,'',index, true)
        index = result.index + stringTillSecondYear.length
        addIntermediaryReplacement(replacementsArray,'second-ad-year',secondYearString,'',index, true)
    }
    
}



function processYearRangeWithTrailingCEPattern(text,replacementsArray){
    let result;
    const reg = giRegForText(yearRangeWithTrailingCEPattern)
    while ((result = reg.exec(text))) {       
        const stringTillSecondYear = result[1] || ''
        const firstYearString = result[2] || ''
        const secondYearString = result[12] || ''
        const trailingCESpace = result[13] || ''
        const trailingCE = result[14] || ''
        
        if(trailingCESpace === "\n")return
        

        let index = result.index
  
        addIntermediaryReplacement(replacementsArray,'first-ad-year',firstYearString,'',index, true)
        index +=  stringTillSecondYear.length
        addIntermediaryReplacement(replacementsArray,'ignore',secondYearString,'',index, true)
        index +=  secondYearString.length
        addIntermediaryReplacement(replacementsArray,'trailing-ad-space',trailingCESpace,'',index, true)
        
        index += trailingCESpace.length
        addIntermediaryReplacement(replacementsArray,'trailing-ce',trailingCE,'',index, true)
    
    
    }
    
}

function processYearRangeWithSlashAndTrailingADPattern(text,replacementsArray){
    let result;
    const reg = giRegForText(yearRangeWithSlashAndTrailingADPattern)
    while ((result = reg.exec(text))) {

        const stringTillSecondYear = result[1] || ''
        const firstYearString = result[2] || ''
        const secondYearString = result[3] || ''
        const trailingSpace = result[4] || ''
        const trailingEraLabel = result[5] || ''
        
        if(trailingSpace === "\n")return

        let index = result.index
  
        addIntermediaryReplacement(replacementsArray,'first-ad-year',firstYearString,'',index, true)
        index += stringTillSecondYear.length
        addIntermediaryReplacement(replacementsArray,'ignore',secondYearString,'',index, true)
        index += secondYearString.length
        addIntermediaryReplacement(replacementsArray,'trailing-ad-space',trailingSpace,'',index, true)
        index += trailingSpace.length
        addIntermediaryReplacement(replacementsArray,'trailing-ad',trailingEraLabel,'',index, true)
    }
}


function processYearRangeWithSlashAndTrailingCEPattern(text,replacementsArray){
    let result;
    const reg = giRegForText(yearRangeWithSlashAndTrailingCEPattern)
    while ((result = reg.exec(text))) {

        const stringTillSecondYear = result[1] || ''
        const firstYearString = result[2] || ''
        const secondYearString = result[3] || ''
        const trailingSpace = result[4] || ''
        const trailingEraLabel = result[5] || ''
        
        if(trailingSpace === "\n")return

        let index = result.index
  
        addIntermediaryReplacement(replacementsArray,'first-ad-year',firstYearString,'',index, true)
        index += stringTillSecondYear.length
        addIntermediaryReplacement(replacementsArray,'ignore',secondYearString,'',index, true)
        index += secondYearString.length
        addIntermediaryReplacement(replacementsArray,'trailing-ad-space',trailingSpace,'',index, true)
        index += trailingSpace.length
        addIntermediaryReplacement(replacementsArray,'trailing-ce',trailingEraLabel,'',index, true)
    }
}



function processYearWithLeadingADPattern(text,replacementsArray){
    let result;
    const reg = giRegForText(yearWithLeadingADPattern)
    while ((result = reg.exec(text))) {

        const leadingAD = result[1] || ''
        const space = result[3] || ''
        const yearNumber = result[4] || ''

        if(space === '\n')return

        let index = result.index
        addIntermediaryReplacement(replacementsArray,'leading-ad',leadingAD,'',index)
        index += leadingAD.length
        addIntermediaryReplacement(replacementsArray,'ad-space',space,'',index)
        index += space.length
        addIntermediaryReplacement(replacementsArray,'ad-year',yearNumber,'',index)



    }
}


function processYearWithTrailingADPattern(text,replacementsArray){
    let result;
    const reg = giRegForText(yearWithTrailingADPattern)
    while ((result = reg.exec(text))) {
         const year = result[1] || ''
         const space = result[2] || ''
         const ad = result[3] || ''

         if(space === '\n')return

         let index = result.index
         addIntermediaryReplacement(replacementsArray,'first-ad-year',year,'',index)
         index += year.length
         addIntermediaryReplacement(replacementsArray,'trailing-ad-space',space,'',index)
         index += space.length
         addIntermediaryReplacement(replacementsArray,'trailing-ad',ad,'',index)
   
    }

}
function processYearWithTrailingCEPattern(text,replacementsArray){
    let result;
    const reg = giRegForText(yearWithTrailingCEPattern)
    while ((result = reg.exec(text))) {
        const yearString = result[1] || ''
        const space = result[2] || ''
        const ce = result[3] || ''

        if(space === '\n')return

        let index = result.index
        addIntermediaryReplacement(replacementsArray,'first-ad-year',yearString,'',index)
        index += yearString.length
        addIntermediaryReplacement(replacementsArray,'trailing-ad-space',space,'',index)
        index += space.length
        addIntermediaryReplacement(replacementsArray,'trailing-ce',ce,'',index)
   
    }
}



function processDecadeWithTrailingADPattern(text, replacementsArray){
    let result;
    const reg = giRegForText(decadeWithTrailingADPattern)
    while ((result = reg.exec(text))) {
         const decadeString = result[1] || ''
         const space = result[2] || ''
         const ad = result[3] || ''

         if(space === '\n')return

         let index = result.index
         addIntermediaryReplacement(replacementsArray,'ad-decade',decadeString,'',index)
         index += decadeString.length
         addIntermediaryReplacement(replacementsArray,'trailing-ad-space',space,'',index)
         index += space.length
         addIntermediaryReplacement(replacementsArray,'trailing-ad',ad,'',index)
    }

}

function processDecadeWithTrailingCEPattern(text, replacementsArray){
    let result;
    const reg = giRegForText(decadeWithTrailingCEPattern)
    while ((result = reg.exec(text))) {
        const decadeString = result[1] || ''
        const space = result[2] || ''
        const ce = result[3] || ''

        if(space === '\n')return

        let index = result.index
         addIntermediaryReplacement(replacementsArray,'ad-decade',decadeString,'',index)
         index += decadeString.length
         addIntermediaryReplacement(replacementsArray,'trailing-ad-space',space,'',index)
         index += space.length
         addIntermediaryReplacement(replacementsArray,'trailing-ce',ce,'',index)


    }

}


function processCenturyADCERangePattern(text, replacementsArray) {
    let result;
    const reg = giRegForText(centuryADCERangePattern)
    while ((result = reg.exec(text))) {
        const stringTillSpace = result[1] || ''
        const stringTillSecondCentury = result[2] || ''
        const firstCentury = result[3] || ''
        const secondCentury = result[9] || ''
        const space = result[14] || ''
        const ad = result[15] || ''

        if(space === '\n')return

        let index = result.index

        addIntermediaryReplacement(replacementsArray, 'first-ad-century',firstCentury,'',index)
        index += stringTillSecondCentury.length
        addIntermediaryReplacement(replacementsArray, 'ignore',secondCentury,'',index)
        index = result.index + stringTillSpace.length
        addIntermediaryReplacement(replacementsArray, 'trailing-ad-space',space,'',index)
        index += space.length
        addIntermediaryReplacement(replacementsArray, 'trailing-ad',ad,'',index)
   
    }

}


function processCenturyRangeWithSlashADCEPattern(text, replacementsArray) {
    let result;
    const reg = giRegForText(centuryRangeWithSlashADCEPattern)
    while ((result = reg.exec(text))) {
        const stringTillSpace = result[1] || ''
        const stringTillSecondCentury = result[2] || ''
        const firstCentury = result[3] || ''
        const secondCentury = result[9] || ''
        const space = result[14] || ''
        const ad = result[15] || ''

        if(space === '\n')return

        let index = result.index

        addIntermediaryReplacement(replacementsArray, 'first-ad-century',firstCentury,'',index)
        index += stringTillSecondCentury.length
        addIntermediaryReplacement(replacementsArray, 'ignore',secondCentury,'',index)
        index = result.index + stringTillSpace.length
        addIntermediaryReplacement(replacementsArray, 'trailing-ad-space',space,'',index)
        index += space.length
        addIntermediaryReplacement(replacementsArray, 'trailing-ad',ad,'',index)
   
    }
}



function processCenturyADCEPattern(text, replacementsArray) {
    
    let result;
    const reg = giRegForText(centuryADCEPattern)
    while ((result = reg.exec(text))) {
        const stringTillSpace = result[1] || ''
        const centuryString = result[2] || ''
        const space = result[9] || ''
        const ad = result[10] || ''
    
        if(space === '\n')return
        let index = result.index
        addIntermediaryReplacement(replacementsArray, 'first-ad-century',centuryString,'',index)
        index += stringTillSpace.length
        addIntermediaryReplacement(replacementsArray, 'trailing-ad-space',space,'',index)
        index += space.length
        addIntermediaryReplacement(replacementsArray, 'trailing-ad',ad,'',index)

        
    }
}







function processMillenniumADCERangePattern(text, replacementsArray) {
    let result;
    const reg = giRegForText(millenniumADCERangePattern)
    while ((result = reg.exec(text))) {
        const stringTillSpace = result[1] || ''
        const stringTillSecondMillennium = result[2] || ''
        const firstMillennium = result[3] || ''
        const secondMillennium = result[9] || ''
        const space = result[14] || ''
        const ad = result[15] || ''

        if(space === '\n')return

        let index = result.index

        addIntermediaryReplacement(replacementsArray, 'ad-millennium',firstMillennium,'',index)
        index += stringTillSecondMillennium.length
        addIntermediaryReplacement(replacementsArray, 'ad-millennium',secondMillennium,'',index)
        index = result.index + stringTillSpace.length
        addIntermediaryReplacement(replacementsArray, 'trailing-ad-space',space,'',index)
        index += space.length
        addIntermediaryReplacement(replacementsArray, 'trailing-ad',ad,'',index)
   
    }

}


function processMillenniumRangeWithSlashADCEPattern(text, replacementsArray) {
    let result;
    const reg = giRegForText(millenniumRangeWithSlashADCEPattern)
    while ((result = reg.exec(text))) {
        const stringTillSpace = result[1] || ''
        const stringTillSecondMillennium = result[2] || ''
        const firstCentury = result[3] || ''
        const secondMillennium = result[9] || ''
        const space = result[14] || ''
        const ad = result[15] || ''

        if(space === '\n')return

        let index = result.index

        addIntermediaryReplacement(replacementsArray, 'ad-millennium',firstCentury,'',index)
        index += stringTillSecondMillennium.length
        addIntermediaryReplacement(replacementsArray, 'ad-millennium',secondMillennium,'',index)
        index = result.index + stringTillSpace.length
        addIntermediaryReplacement(replacementsArray, 'trailing-ad-space',space,'',index)
        index += space.length
        addIntermediaryReplacement(replacementsArray, 'trailing-ad',ad,'',index)
   
    }
}

function processMillenniumADCEPattern(text, replacementsArray) {
    
    let result;
    const reg = giRegForText(millenniumADCEPattern)
    while ((result = reg.exec(text))) {
        const stringTillSpace = result[1] || ''
        const millenniumString = result[2] || ''
        const space = result[9] || ''
        const ad = result[10] || ''
    
        if(space === '\n')return
        let index = result.index
        addIntermediaryReplacement(replacementsArray, 'ad-millennium',millenniumString,'',index)
        index += stringTillSpace.length
        addIntermediaryReplacement(replacementsArray, 'trailing-ad-space',space,'',index)
        index += space.length
        addIntermediaryReplacement(replacementsArray, 'trailing-ad',ad,'',index)

        
    }
}
