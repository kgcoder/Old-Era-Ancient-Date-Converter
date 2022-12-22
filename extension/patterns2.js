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




const nakedDatePattern2 = '\\b[0-9]{1,2}(?!\\])\\b'
const nakedDecadePattern2 = "[0-9]{0,3}0'?s"
const decadePattern2 = `(${nakedDecadePattern2})${bcPattern2}`
