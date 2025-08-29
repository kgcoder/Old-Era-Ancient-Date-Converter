const { 
    processYearPattern,
    processCenturyPattern
 } = require('../extension/patternProcessors');

 const { 
    giRegForHtml,
    giRegForText
 } = require('../extension/helpers');

 global.giRegForHtml = giRegForHtml
 global.giRegForText = giRegForText

 const {spacePattern} = require('../extension/patternsInHtml')
 global.spacePattern = spacePattern

 const {yearPattern} = require('../extension/patternsInText')

 global.yearPattern = yearPattern


test('year pattern', () => {
    const currentPageData = {
        isPageAboutEarlyCenturyOrMillennium:false,
        doesPageContainCenturiesTemplate:false
    }
    const replacementsArray = []

    console.log('result',processYearPattern('dfdf 100 BC',replacementsArray,currentPageData))
  expect(processYearPattern('dfdf 100 BC',replacementsArray,currentPageData)).toBe(true);
});