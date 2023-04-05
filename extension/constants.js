/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

 const baseUrl = 'https://dates.oldera.org'
 const frontendBaseUrl = 'https://dates.oldera.org'
 const webBaseUrl = 'https://timeline.oldera.org'
 
 //const baseUrl = 'http://localhost:3250'
 //const frontendBaseUrl = 'http://localhost:3000'
 
 const kCacheTTL = 86400000 //cache ttl in milliseconds
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

    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'sept',
    'oct',
    'nov',
    'dec',

    'jan.',
    'feb.',
    'mar.',
    'apr.',

    'jun.',
    'jul.',
    'aug.',
    'sep.',
    'sept.',
    'oct.',
    'nov.',
    'dec.',

   
]

const seasons = [
    'spring',
    'summer',
    'autumn',
    'fall',
    'winter'
]
 


const shortToLongMethodConversions = {
    "bc-y": "year",
    "bc-y1": "oneDigitYear",
    "bc-y2": "twoDigitYear",
    "bc-i": "impreciseYear",
    "bc-i2": "bc-i2",//twoDigitImpreciseYear //1070/60 BC
    "bc-d": "decade",
    "bc-sd": "bc-sd",//"shortDecade",
    "bc-dp": "bc-dp",//decades (plural)
    "bc-00s": "00s",
    "bc-000s": "000s",
    "bc-c": "century",
    "bc-m": "millennium",
    "bc-r": "remove",
    "bc-ig": "bc-ig",//ignore
    "bc-tn": "OE", // Old Era  timelineName
    "bc-ot": "ofOE", //of the Old Era ofTimeline
    "bc-at": "abbreviatedTimeline", //OE

    //the following classes should not be used in markup
    'bc-y-r1':'bc-y-r1',//first year in range
    'bc-y-r2':'bc-y-r2',//second year in range
    'bc-i-r1':'bc-i-r1',//first year in range
    'bc-i-r2':'bc-i-r2',//second year in range

}


const longToShortMethodConversions = {
    "year" : "bc-y",
    "oneDigitYear" : "bc-y1",
    "twoDigitYear" : "bc-y2",
    "impreciseYear" : "bc-i",
    "bc-i2": "bc-i2",//twoDigitImpreciseYear //1070/60 BC
    "decade" : "bc-d",
    "bc-sd": "bc-sd",//"shortDecade",
    "bc-dp": "bc-dp",//decades (plural)
    "00s" : "bc-00s",
    "000s" : "bc-000s",
    "century" : "bc-c",
    "millennium" : "bc-m",
    "remove" : "bc-r",
    "bc-ig": "bc-ig",//ignore
    "OE" : "bc-tn", // Old Era  timelineName
    "ofOE" : "bc-ot", //of the Old Era ofTimeline
    "abbreviatedTimeline" : "bc-at", //OE

    //the following classes should not be used in markup
    'bc-y-r1':'bc-y-r1',//first year in range
    'bc-y-r2':'bc-y-r2',//second year in range
    'bc-i-r1':'bc-i-r1',//first year in range
    'bc-i-r2':'bc-i-r2',//second year in range

}


//for editor
const allClasses = [
    'marker',
    'bc-y',
    'ad-y',
    'bc-y1',
    'bc-y2',
    'bc-i',
    'bc-r',
    'bc-d',
    'bc-c',
    'bc-00s',
    'bc-m',
    'bc-000s',
    'bc-tn',
    'bc-ot',
    'bc-at',
    'bc-ig',
    'bc-y-r1',
    'bc-y-r2',
    'bc-i-r1',
    'bc-i-r2'
    
]

