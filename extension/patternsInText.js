/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const bcPattern = `(${spacePattern}|-)?((b\\.(${spacePattern})?c\\.?|bc)e?)`
const rangePattern = `(${spacePattern})?(—|−|–|-|— early|− early|– early|- early|— late|− late|– late|- late|\\&#8211;|\\&ndash;|\\&#8212;|\\&mdash;|\\&#8211; early|\\&ndash; early|\\&#8212; early|\\&mdash; early|\\&#8211; late|\\&ndash; late|\\&#8212; late|\\&mdash; late|or|to|to late|to early|to the|and|and late|and early|or late|or early|-to-|until|till|through)(${spacePattern})?`
const supPattern = '\\[\\d*?\\]'
const circaPattern = 'c\\.|circa|circa\\.|ca\\.'

const nakedYearPattern = '([1-9][0-9]{0,2},[0-9]{3}|[0-9]{1,4}|10000|10,000|[0-9]{1,3},?000)(?!\\])'

const nakedDatePattern = '[0-9]{1,2}(?!\\])'
const nakedDecadePattern = "[0-9]{0,3}0'?s"
const decadePattern = `(${nakedDecadePattern})${bcPattern}`
const decadeRangePattern = `((${nakedDecadePattern})(${spacePattern})?(${rangePattern})(${spacePattern})?)((${nakedDecadePattern})${bcPattern})`

const roundnakedYearPattern = '[0-9]{1,3},?000(?!\\])'
const roundYearrangePattern = `((${roundnakedYearPattern})(${rangePattern})(${circaPattern}(${spacePattern})?)?)((${roundnakedYearPattern})${bcPattern})`

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

const centuriesPattern = `((${nakedCenturyPattern})(${spacePattern}|-)(century|centuries|cent\\.|c\\.))(${bcPattern})`
const millenniumPattern = `((${nakedCenturyPattern})(${spacePattern}|-)(millennium|millennia))(${bcPattern})`

const centuryRangePattern = `${nakedCenturyPattern}-?${rangePattern}${nakedCenturyPattern}(${spacePattern}|-)(century|centuries)${bcPattern}`
const centuryRangeWithSlashPattern = `${nakedCenturyPattern}/(early(${spacePattern}|-)|late(${spacePattern}|-))?${nakedCenturyPattern}(${spacePattern}|-)(century|centuries)${bcPattern}`

const millenniumRangePattern = `${nakedCenturyPattern}-?${rangePattern}${nakedCenturyPattern}(${spacePattern}|-)(millennium|millennia)${bcPattern}`
const millenniumRangeWithSlashPattern = `${nakedCenturyPattern}/(early(${spacePattern}|-)|late(${spacePattern}|-))?${nakedCenturyPattern}(${spacePattern}|-)(millennium|millennia)${bcPattern}`
