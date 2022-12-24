/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const spacePattern2 = ' |\\s|\\&nbsp;|\\&#160;|\\&#8201;'
const bcPattern2 = `(${spacePattern2}|-)((b\\.(${spacePattern2})?c\\.?|bc)e?)`
const rangePattern2 = `(${spacePattern2})?(—|−|–|-|\\&#8211;|\\&ndash;|\\&#8212;|\\&mdash;|or|to|to late|to early|to the|and|and late|and early|-to-|until|till|through)(${spacePattern})?`
const dashPattern2 = `(${spacePattern2})?(—|−|–|-|\\&#8211;|\\&ndash;|\\&#8212;|\\&mdash;)(${spacePattern2})?`
const supPattern2 = '\\[\\d*?\\]'
const circaPattern2 = 'c\\.|circa|circa\\.'

const nakedYearPattern2 = '([1-9][0-9]{0,2},[0-9]{3}|[0-9]{1,4}|10000|10,000)(?!\\])'



const nakedDatePattern2 = '[0-9]{1,2}(?!\\])'
const nakedDecadePattern2 = "[0-9]{0,3}0'?s"
const decadePattern2 = `(${nakedDecadePattern2})${bcPattern2}`




const roundNakedYearPattern2 = '[0-9]{1,3},?000(?!\\])'
const roundYearRangePattern2 = `((${roundNakedYearPattern2})(${rangePattern2}))((${roundNakedYearPattern2})${bcPattern2})`



const yearRangePattern2 = `(${nakedYearPattern2}(${supPattern2})?/)?${nakedYearPattern2}(${supPattern2})?${rangePattern2}(${circaPattern2})?(${spacePattern2})?(${nakedYearPattern}(${supPattern2})?/)?${nakedYearPattern2}(${supPattern2})?${bcPattern}`



const yearMonthRangePattern2 = `(${nakedYearPattern2})(${supPattern2})?(${rangePattern2})((${nakedDatePattern2})(${spacePattern2}))?(${monthNames.join('|')})(/(${monthNames.join('|')}))?(${spacePattern2})${nakedYearPattern2}${supPattern2}${bcPattern2}`


const yearPattern2 = `((${nakedYearPattern2}(${supPattern2})?/)?${nakedYearPattern2}(${supPattern2})?)${bcPattern2}`




const nakedCenturyPattern2 = `\\b((\\d+(st|nd|rd|th))|${ordinalNumberWords.join('|')})\\b`

const centuriesPattern2 = `((${nakedCenturyPattern2})(${spacePattern2}|-)(century|centuries|cent\\.|c\\.))(${bcPattern2})`
const millenniumPattern2 = `((${nakedCenturyPattern2})(${spacePattern2}|-)(millennium|millennia))(${bcPattern2})`


