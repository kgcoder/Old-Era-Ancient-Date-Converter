/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const spacePattern = ' |\\s|\\&nbsp;|&thinsp;|\\&#160;|\\&#8201;'
const completeSpacePatternInHtml = `(<span[^>]*?>)(${spacePattern})(</span>)|${spacePattern}`
const bcPatternInHtml = `(${completeSpacePatternInHtml}|-)((b\\.(${completeSpacePatternInHtml})?c\\.?|bc)e?|(<small>)(bce?)</small>)`
const methods = Object.keys(shortToLongMethodConversions).join('|')

const nakedYearPatternInHtml = '\\b([1-9][0-9]{0,2},[0-9]{3}|[0-9]{1,5}|10000|10,000)(?!\\])\\b'

// const altCenturiesAndMillenniaMarkupPattern = `((bc-c|bc-m)( data-t="([^>]*?)")?( data-s="[^>]*?")?>)([^<]*?)</(bc-c|bc-m)>(${completeSpacePattern}|-)(century|centuries|cent\\.|c\\.|millennium|millennia))(${bcPattern})`
// const altMarkupWithInnerSpansPattern = `(<(${methods})( data-t="([^>]*?)")?( data-s="([^>]*?)")?>)([^<]*?)(<span[^>]*?>)(.)(</span>)([^<]*?)</(${methods})>`
// const altGeneralMarkupPattern = `(<(${methods})( data-t="([^>]*?)")?( data-s="([^>]*?)")?>)([^<]*?)</(${methods})>`

const centuriesAndMillenniaMarkupPattern = `((<span class="(bc-c|bc-m)"( data-t="([^>]*?)")?( data-s="[^>]*?")?>)([^<]*?)</span>(${completeSpacePatternInHtml}|-)(century|centuries|cent\\.|c\\.|millennium|millennia))(${bcPatternInHtml})`
const markupWithInnerSpansPattern = `(<span class="(${methods})"( data-t="([^>]*?)")?( data-s="([^>]*?)")?>)([^<]*?)(<span[^>]*?>)(.)(</span>)([^<]*?)</span>`
const generalMarkupPattern = `(<span class="(${methods})"( data-t="([^>]*?)")?( data-s="([^>]*?)")?>)([^<]*?)</span>`


const negativeLookaheadPattern = '(?<!<[^>]*?)'

const h2Pattern = `(<h2>.*?<span class="mw-headline"[^>]*?>)(.*?)</span><IgnoredPart>[\\s\\S]{0,5}</h2>`
const h3Pattern = `(<h3>.*?<span class="mw-headline"[^>]*?>)(.*?)</span><IgnoredPart>[\\s\\S]{0,5}</h3>`

// const yearInMarkUpWithInnerSpansPattern = `(<span class="(bc-y|bc-i)"( data-t="([^>]*?)")?( data-s="([^>]*?)")?>)([^<]*?)(<span[^>]*?>)(.)(</span>)([^<]*?)</span>`
// const yearInMarkupPattern = `(<span class="(bc-y|bc-i)"( data-t="([^>]*?)")?( data-s="([^>]*?)")?>)([^<]*?)</span>`
// const yearRangeInMarkupWithInnerSpansPattern = `(((${yearInMarkupPattern}|${nakedYearPattern}|${roundNakedYearPattern}))${rangePattern})${yearInMarkUpWithInnerSpansPattern}`
// const yearRangeInMarkupPattern = `((${yearInMarkupPattern}|${nakedYearPattern}|${roundNakedYearPattern})${rangePattern})${yearInMarkupPattern}`
// const yearRangeWithFirstYearInMarkupPattern = `(${yearInMarkupPattern}${rangePattern})${yearPattern}`

