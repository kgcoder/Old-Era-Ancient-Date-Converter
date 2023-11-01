/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

 const baseUrl = 'https://dates.oldera.org'
 const frontendBaseUrl = 'https://dates.oldera.org'
 
 const mediawikiDomain = 'timeline.oldera.org'
 const webBaseUrl = `https://${mediawikiDomain}`
 
 const dataFormatVersionForEditor = 2

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

 const latinNumbersDict = {
    'I': 1,
    'II': 2,
    'III': 3,
    'IV': 4,
    'V': 5,
    'VI': 6,
    'VII': 7,
    'VIII': 8,
    'IX': 9,
    'X': 10,
    'XI': 11,
    'XII': 12,
    'XIII': 13,
    'XIV': 14,
    'XV': 15,
    'XVI': 16,
    'XVII': 17,
    'XVIII': 18,
    'XIX': 19,
    'XX': 20,
    'XXI': 21,
    'XXII': 22,
    'XXIII': 23,
    'XXIV': 24,
    'XXV': 25,
    'XXVI': 26,
    'XXVII': 27,
    'XXVIII': 28,
    'XXIX': 29,
    'XXX': 30,
    'XXXI': 31,
    'XXXII': 32,
    'XXXIII': 33,
    'XXXIV': 34,
    'XXXV': 35
}

const latinNumbersList = Object.keys(latinNumbersDict)

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
    'bc-sd',
    'bc-dp',
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


const colorToMarkupClass = {
    'green;color:white': 'bc-y',
    'rosyBrown': 'ad-y',
    'pink': 'bc-i',
    'olive;color:white': 'bc-d',
    'oliveDrab;color:white': 'bc-sd',
    'peachPuff': 'bc-dp',
    'orange': 'bc-c',
    'coral': 'bc-00s',
    'darkcyan;color:white': 'bc-m',
    'blueViolet': 'bc-000s',
    'brown;color:white': 'bc-r',
    'aqua': 'bc-tn',
    'lime': 'bc-ot',
    'thistle': 'bc-at',
    'dimgray;color:white': 'bc-ig',
    'gainsboro': 'bc-y1',
    'lightslategray;color:white': 'bc-y2'
}




const prohibitedPages = [
    "https://en.wikipedia.org/wiki/Wikipedia:WikiProject_Detectable_BC/BCE_dates",
    "https://en.m.wikipedia.org/wiki/Wikipedia:WikiProject_Detectable_BC/BCE_dates"
]


const processedTemplates = [
    "Template:Timeline of Mesopotamia",
    "Template:Assyrian people footer",
    "Template:Rulers of the Ancient Near East",
    "Template:Ancient Egypt dynasties sidebar",
    "Template:Centuries",
    "Template:Millennia",
    "Template:Iran topics",
    "Template:History of Iran",
    "Template:History of Tunisia",
    "Template:History of Turkey",
    "Template:Iron Age",
    "Template:Bronze Age",
    "Template:History of Italy",
    "Template:Greece topics",
    "Template:History of China",
    "Template:State leaders by century",
    "Template:History of Afghanistan",
    "Template:Middle kingdoms of India",
    "Template:History of South Asia",
    "Template:Babylon dynasties sidebar",
    "Template:Lists of political entities by century",
    "Template:History of Greater Iran sidebar",
    "Template:Neolithic Chronology",
    "Template:Rulers of Ancient Central Asia",
    "Template:History of India",
    "Template:Ancient Greece topics",
    "Template:Campaignbox Rise of Macedon",
    "Template:History of Greece",
    "Template:Timelines of Chinese history",
    "Template:History of Pakistan",
    "Template:Historical Arab states and dynasties",
    "Template:History of Belgium",
    "Template:Greek language"
    ]