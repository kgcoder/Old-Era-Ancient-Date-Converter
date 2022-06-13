/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const spacePattern = ' |\\s|\\&nbsp;|\\&#160;|\\&#8201;'
const completeSpacePattern = `(<span[^>]*?>)(${spacePattern})(</span>)|${spacePattern}`
const bcPattern = `(${completeSpacePattern}|-)((b\\.(${completeSpacePattern})?c\\.?|bc)e?|(<small>)(bce?)</small>)`
const methods = Object.keys(methodConversions).join('|')
const rangePattern = `(${spacePattern})?(—|−|–|-|\\&#8211;|\\&ndash;|\\&#8212;|\\&mdash;|or|to|to late|to early|to the|and|and late|and early|-to-|until|till)(${spacePattern})?`
const nakedYearPattern = '\\b([1-9]{1},[0-9]{3}|[0-9]{1,4})(?!\\])\\b'
const roundNakedYearPattern = '\\b[0-9]{1,3},?000(?!\\])\\b'

const altCenturiesAndMillenniaMarkupPattern = `((bc-c|bc-m)( data-t="([^>]*?)")?( data-s="[^>]*?")?>)([^<]*?)</(bc-c|bc-m)>(${completeSpacePattern}|-)(century|centuries|cent\\.|c\\.|millennium|millennia))(${bcPattern})`
const altMarkupWithInnerSpansPattern = `(<(${methods})( data-t="([^>]*?)")?( data-s="([^>]*?)")?>)([^<]*?)(<span[^>]*?>)(.)(</span>)([^<]*?)</(${methods})>`
const altGeneralMarkupPattern = `(<(${methods})( data-t="([^>]*?)")?( data-s="([^>]*?)")?>)([^<]*?)</(${methods})>`

const centuriesAndMillenniaMarkupPattern = `((<span class="(bc-c|bc-m)"( data-t="([^>]*?)")?( data-s="[^>]*?")?>)([^<]*?)</span>(${completeSpacePattern}|-)(century|centuries|cent\\.|c\\.|millennium|millennia))(${bcPattern})`
const markupWithInnerSpansPattern = `(<span class="(${methods})"( data-t="([^>]*?)")?( data-s="([^>]*?)")?>)([^<]*?)(<span[^>]*?>)(.)(</span>)([^<]*?)</span>`
const generalMarkupPattern = `(<span class="(${methods})"( data-t="([^>]*?)")?( data-s="([^>]*?)")?>)([^<]*?)</span>`


const yearListRange = `((${spacePattern})?(—|−|–|-|\\&#8211;|\\&ndash;|\\&#8212;|\\&mdash;|, |or|to|to the|and|-to-|until|till)(${spacePattern})?)`
const nakedDatePattern = '\\b[0-9]{1,2}(?!\\])\\b'
const supPattern = '<sup((?!<sup).)*?</sup>'
const negativeLookaheadPattern = '(?<!<[^>]*?)'
const nakedDecadePattern = "[0-9]{0,3}0'?s"
const decadePattern = `(${nakedDecadePattern})${bcPattern}`
const decadeRangePattern = `((${nakedDecadePattern})(${spacePattern})?(${rangePattern})(${spacePattern})?)((${nakedDecadePattern})${bcPattern})`
const nakedCenturyPattern = `\\b((\\d+(st|nd|rd|th))|${ordinalNumberWords.join('|')})\\b`
const centuriesPattern = `((${nakedCenturyPattern})(${completeSpacePattern}|-)(century|centuries|cent\\.|c\\.))(${bcPattern})`
const millenniumPattern = `((${nakedCenturyPattern})(${completeSpacePattern}|-)(millennium|millennia))(${bcPattern})`
const yearMonthRangePattern = `(${nakedYearPattern})(${supPattern})?(${rangePattern})((${nakedDatePattern})(${spacePattern}))?(${monthNames.join('|')})(/(${monthNames.join('|')}))?(${spacePattern})(${nakedYearPattern}${bcPattern})`
const leftFraction = `(${nakedYearPattern})(${supPattern})?/`
const leftPartOfYearRangePattern = `((((${leftFraction})?((${nakedYearPattern})(${supPattern})?(</span>)?)`
const middleOfYearRangePattern = `(${rangePattern})((c\\.|around)(${completeSpacePattern}))?)`
const rightPartOfYearRangePattern = `(${leftFraction})?))((${nakedYearPattern})(</span>)?(${supPattern})?(${bcPattern}))`
const simpleYearRangePattern = `(${nakedYearPattern})(${rangePattern})(${nakedYearPattern})(${bcPattern})`
const yearRangePattern = `${leftPartOfYearRangePattern}${middleOfYearRangePattern}${rightPartOfYearRangePattern}`
const roundYearRangePattern = `((${roundNakedYearPattern})(${rangePattern}))((${roundNakedYearPattern})${bcPattern})`
const yearRangeWithCircasPattern = `((<span [^>]*?>)?(${spacePattern}))(${nakedYearPattern})(</span>)?${rangePattern}(<abbr title="circa">c.</abbr>|c.|<span title="circa">c.</span>)(<span [^>]*?>)?(${spacePattern})(${nakedYearPattern}(</span>)?${bcPattern})`
const yearPattern = `(${leftFraction})?((${nakedYearPattern})(</span>)?(${supPattern})?(${bcPattern}))`
const yearInListPattern = `(${nakedYearPattern})(${supPattern})?`
const longYearListPattern = `(?<!(${monthNames.join('|')})(${completeSpacePattern}))(${yearInListPattern}${yearListRange})?(${yearInListPattern}${yearListRange})?(${yearInListPattern}${yearListRange})?(${yearInListPattern}${yearListRange})?(${yearInListPattern}${yearListRange})?(${yearInListPattern}${yearListRange})?(${yearInListPattern}),?${yearListRange}${nakedYearPattern}${bcPattern}`
const centuryRangePattern = `(${nakedCenturyPattern})-?(${rangePattern})(${nakedCenturyPattern})(${spacePattern}|-)(century|centuries)${bcPattern}`
const millenniumRangePattern = `(${nakedCenturyPattern})-?(${rangePattern})(${nakedCenturyPattern})(${spacePattern}|-)(millennium|millennia)${bcPattern}`




const yearInMarkUpWithInnerSpansPattern = `(<span class="(bc-y|bc-i)"( data-t="([^>]*?)")?( data-s="([^>]*?)")?>)([^<]*?)(<span[^>]*?>)(.)(</span>)([^<]*?)</span>`
const yearInMarkupPattern = `(<span class="(bc-y|bc-i)"( data-t="([^>]*?)")?( data-s="([^>]*?)")?>)([^<]*?)</span>`
const yearRangeInMarkupWithInnerSpansPattern = `(((${yearInMarkupPattern}|${nakedYearPattern}|${roundNakedYearPattern}))${rangePattern})${yearInMarkUpWithInnerSpansPattern}`
const yearRangeInMarkupPattern = `((${yearInMarkupPattern}|${nakedYearPattern}|${roundNakedYearPattern})${rangePattern})${yearInMarkupPattern}`
const yearRangeWithFirstYearInMarkupPattern = `(${yearInMarkupPattern}${rangePattern})${yearPattern}`

