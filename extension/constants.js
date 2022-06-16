/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

 const baseUrl = 'https://dates.oldera.org'
 const frontendBaseUrl = 'https://dates.oldera.org'
 
 //const baseUrl = 'http://localhost:3250'
 //const frontendBaseUrl = 'http://localhost:3000'
 
 const numbersFromWords = {
     'first': 1,
     'second': 2,
     'third': 3,
     'fourth': 4,
     'fifth': 5,
     'sixth': 6,
     'seventh': 7,
     'eighth': 8,
     'ninth': 9,
     'tenth': 10,
     'eleventh': 11,
     'twelfth': 12,
     'thirteenth': 13,
     'fourteenth': 14,
     'fifteenth': 15,
     'sixteenth': 16,
     'seventeenth': 17,
     'eighteenth': 18,
     'nineteenth': 19,
     'twentieth': 20,
     'twenty-first': 21,
     'twenty-second': 22,
     'twenty-third': 23,
     'twenty-fourth': 24,
     'twenty-fifth': 25,
     'twenty-sixth': 26,
     'twenty-seventh': 27,
     'twenty-eighth': 28,
     'twenty-ninth': 29,
     'thirtieth': 30,
     'thirty-first': 31,
     'thirty-second': 32,
     'thirty-third': 33,
     'thirty-fourth': 34,
     'thirty-fifth': 35
 }

 const ordinalNumberWords = [
    'first',
    'second',
    'third',
    'fourth',
    'fifth',
    'sixth',
    'seventh',
    'eighth',
    'ninth',
    'tenth',
    'eleventh',
    'twelfth',
    'thirteenth',
    'fourteenth',
    'fifteenth',
    'sixteenth',
    'seventeenth',
    'eighteenth',
    'nineteenth',
    'twentieth',
    'twenty-first',
    'twenty-second',
    'twenty-third',
    'twenty-fourth',
    'twenty-fifth',
    'twenty-sixth',
    'twenty-seventh',
    'twenty-eighth',
    'twenty-ninth',
    'thirtieth',
    'thirty-first',
    'thirty-second',
    'thirty-third',
    'thirty-fourth',
    'thirty-fifth'
 ]

const monthNames = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
]
 

const methodConversions = {
    'bc-y': 'year',
    'bc-y1': 'oneDigitYear',
    'bc-y2': 'twoDigitYear',
    'bc-i': 'impreciseYear',
    'bc-i2': 'bc-i2',//twoDigitImpreciseYear //1070/60 BC
    'bc-d': 'decade',
    'bc-sd': 'bc-sd',//'shortDecade',
    'bc-dp': 'bc-dp',//decades (plural)
    'bc-00s': '00s',
    'bc-000s': '000s',
    'bc-c': 'century',
    'bc-m': 'millennium',
    'bc-r': 'remove',
    'bc-ig': 'bc-ig',//ignore
    'bc-tn': 'OE', // Old Era  timelineName
    'bc-ot': 'ofOE', //of the Old Era ofTimeline
    'bc-at': 'abbreviatedTimeline', //OE

    //the following classes should not be used in markup
    'bc-ybc': 'bc-ybc',// add BC to year before 10,000 BC
    'bc-yoe': 'bc-yoe',// add OE to year no matter what
    'bc-ioe': 'bc-ioe',// add OE to year no matter what
    'bc-y_': 'bc-y_',// don't use label no matter what
    'bc-i_': 'bc-i_'// don't use label no matter what
}

