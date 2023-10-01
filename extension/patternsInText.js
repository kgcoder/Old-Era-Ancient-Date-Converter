/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const bcPattern = `(${spacePattern}|-)?((b\\.(${spacePattern})?c\\.?|bc)e?)`
const strictBCPattern = `(${spacePattern}|-)?((b\\.(${spacePattern})?c\\.?|bc))`

const bcePattern = `(${spacePattern}|-)?((b\\.(${spacePattern})?c\\.?|bc)e)`

const rangePattern = `(${spacePattern})?(‑|—|−|–|-|— ?early|− ?early|– ?early|- ?early|— ?late|− ?late|– ?late|- ?late|\\&#8211;|\\&ndash;|\\&#8212;|\\&mdash;|\\&#8211; ?early|\\&ndash; ?early|\\&#8212; ?early|\\&mdash; ?early|\\&#8211; ?late|\\&ndash; ?late|\\&#8212; ?late|\\&mdash; ?late|or|to|to late|to early|to the|and|and late|and the|and early|or late|or early|-to-|until|till|through)(${spacePattern})?`
const supPattern = '\\[\\d*?\\]'
const circaPattern = 'c\\.|circa|circa\\.|ca\\.'

const nakedYearPattern = '([1-9][0-9]{0,2},[0-9]{3}|[0-9]{1,5}|10000|10,000|[0-9]{1,3},?000)(?!\\])'

const nakedDatePattern = '[0-9]{1,2}(?!\\])'
const nakedDecadePattern = "[0-9]{0,3}0'?s"
const decadePattern = `(${nakedDecadePattern})${bcPattern}`
const decadeRangePattern = `((${nakedDecadePattern})(${spacePattern})?(${rangePattern})(${spacePattern})?)((${nakedDecadePattern})${bcPattern})`

const roundNakedYearPattern = '[0-9]{1,3},?000(?!\\])'
const roundYearrangePattern = `((${roundNakedYearPattern})(${rangePattern})(${circaPattern}(${spacePattern})?)?)((${roundNakedYearPattern})${bcPattern})`

const yearRangePattern = `((((${nakedYearPattern}(${supPattern})?/)?${nakedYearPattern}(${supPattern})?${rangePattern}(${circaPattern})?(${spacePattern})?)(${nakedYearPattern}(${supPattern})?/)?)${nakedYearPattern}(${supPattern})?)${bcPattern}`

const yearToDecadePattern = `(${nakedYearPattern}(${supPattern})?/)?${nakedYearPattern}(${supPattern})?${rangePattern}(${circaPattern})?(${spacePattern})?(${nakedDecadePattern})${bcPattern}`
const decadeToYearPattern = `(${nakedDecadePattern})(${supPattern})?${rangePattern}(${circaPattern})?(${spacePattern})?(${nakedYearPattern}(${supPattern})?/)?${nakedYearPattern}(${supPattern})?${bcPattern}`



const yearMonthRangePattern = `${nakedYearPattern}(${supPattern})?(${rangePattern})((${nakedDatePattern})(${spacePattern}))?(${monthNames.join('|')}|${seasons.join('|')})(/(${monthNames.join('|')}))?(${spacePattern})${nakedYearPattern}(${supPattern})?${bcPattern}`

const yearPattern = `((${nakedYearPattern}(${supPattern})?/)?${nakedYearPattern}(${supPattern})?)${bcPattern}`

const nakedCenturyPattern = `((\\d+(st|nd|rd|th))|${ordinalNumberWords.join('|')})`

const yearListRange = `((${spacePattern})?(—|−|–|-|\\&#8211;|\\&ndash;|\\&#8212;|\\&mdash;|, |or|to|to the|and|-to-|until|till)(${spacePattern})?)`
const yearInListPattern = `${nakedYearPattern}(${supPattern})?`
const longYearListWithMonthPattern = `((${monthNames.join('|')})(${spacePattern}))(${yearInListPattern}${yearListRange})(${yearInListPattern}${yearListRange})?(${yearInListPattern}${yearListRange})?(${yearInListPattern}${yearListRange})?(${yearInListPattern}${yearListRange})?(${yearInListPattern}${yearListRange})?(${yearInListPattern}),?${nakedYearPattern}${bcPattern}`
const longYearListPattern = `(${yearInListPattern}${yearListRange})?(${yearInListPattern}${yearListRange})?(${yearInListPattern}${yearListRange})?(${yearInListPattern}${yearListRange})?(${yearInListPattern}${yearListRange})?(${yearInListPattern}${yearListRange})?(${yearInListPattern}),?${yearListRange}${nakedYearPattern}${bcPattern}`

const centuriesPattern = `((${nakedCenturyPattern})(${spacePattern}|-)(c@entury|c@enturies|c@ent\\.|c\\.))(${bcPattern})`
const millenniumPattern = `((${nakedCenturyPattern})(${spacePattern}|-)(millennium|millennia))(${bcPattern})`

const centuryRangePattern = `${nakedCenturyPattern}-?${rangePattern}${nakedCenturyPattern}(${spacePattern}|-)(c@entury|c@enturies|c\\.)${bcPattern}`
const centuryRangeWithSlashPattern = `${nakedCenturyPattern}/(early(${spacePattern}|-)|late(${spacePattern}|-))?${nakedCenturyPattern}(${spacePattern}|-)(c@entury|c@enturies|c\\.)${bcPattern}`

const millenniumRangePattern = `${nakedCenturyPattern}-?${rangePattern}${nakedCenturyPattern}(${spacePattern}|-)(millennium|millennia)${bcPattern}`
const millenniumRangeWithSlashPattern = `${nakedCenturyPattern}/(early(${spacePattern}|-)|late(${spacePattern}|-))?${nakedCenturyPattern}(${spacePattern}|-)(millennium|millennia)${bcPattern}`




const leadingAdPattern = `(a\\.(${spacePattern})?d\\.?|ad)`
const leadingCEPattern = `(c\\.(${spacePattern})?e\\.?|ce)`

const trailingADPattern = `(${spacePattern}|-)?(a\\.(${spacePattern})?d\\.?|ad)`
const trailingCEPattern = `(${spacePattern}|-)?(c\\.(${spacePattern})?e\\.?|ce)`

const trailingADCEPattern = `(${spacePattern}|-)?(a\\.(${spacePattern})?d\\.?|ad|c\\.(${spacePattern})?e\\.?|ce)`


const decadeWithTrailingADPattern = `(${nakedDecadePattern})${trailingADPattern}`
const decadeWithTrailingCEPattern = `(${nakedDecadePattern})${trailingCEPattern}`


const centuryADCERangePattern = `((${nakedCenturyPattern}-?${rangePattern})${nakedCenturyPattern}(${spacePattern}|-)(c@entury|c@enturies|c\\.))${trailingADCEPattern}`
const centuryRangeWithSlashADCEPattern = `((${nakedCenturyPattern}/)(early(${spacePattern}|-)|late(${spacePattern}|-))?${nakedCenturyPattern}(${spacePattern}|-)(c@entury|c@enturies|c\\.))${trailingADCEPattern}`

const millenniumADCERangePattern = `((${nakedCenturyPattern}-?${rangePattern})${nakedCenturyPattern}(${spacePattern}|-)(millennium|millennia))${trailingADCEPattern}`
const millenniumRangeWithSlashADCEPattern = `((${nakedCenturyPattern}/)(early(${spacePattern}|-)|late(${spacePattern}|-))?${nakedCenturyPattern}(${spacePattern}|-)(millennium|millennia))${trailingADCEPattern}`


const centuryADCEPattern = `((${nakedCenturyPattern})(${spacePattern}|-)(c@entury|c@enturies|c@ent\\.|c\\.))(${trailingADCEPattern})`
const millenniumADCEPattern = `((${nakedCenturyPattern})(${spacePattern}|-)(millennium|millennia))(${trailingADCEPattern})`


const yearWithLeadingADPattern = `\\b${leadingAdPattern}\\b(${spacePattern})${nakedYearPattern}`
const yearWithTrailingADPattern = `${nakedYearPattern}${`( |\\&nbsp;|\\&#160;|\\&#8201;|-)?(a\\.(${spacePattern})?d\\.?|ad)`}`
const yearWithTrailingCEPattern = `${nakedYearPattern}${`( |\\&nbsp;|\\&#160;|\\&#8201;|-)?(c\\.(${spacePattern})?e\\.?|ce)`}`

const yearRangeWithLeadingADPattern = `(\\b${leadingAdPattern}\\b(${spacePattern})${nakedYearPattern}${rangePattern})${nakedYearPattern}`
const yearRangeWithTrailingADPattern = `(${nakedYearPattern}${rangePattern})${nakedYearPattern}${trailingADPattern}`

const yearRangeWithLeadingCEPattern = `(\\b${leadingCEPattern}\\b(${spacePattern})${nakedYearPattern}${rangePattern})${nakedYearPattern}`
const yearRangeWithTrailingCEPattern = `(${nakedYearPattern}${rangePattern})${nakedYearPattern}${trailingCEPattern}`

