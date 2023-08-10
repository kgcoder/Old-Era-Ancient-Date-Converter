/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

let currentLocation = window.location.toString()
let isOnWikipedia = false

let isOnMediaWikiCategoryPage = false
let isOnMediaWikiDataPage = false

const mainBaseURL = 'https://en.wikipedia.org/wiki/'
const additionalBaseURL = 'https://en.wikipedia.org/w/index.php?'
let titleInURL = ''

let datesFolder = `https://${mediawikiDomain}/wiki/index.php/Dates/`

function prepareLocation() {




    domain = currentLocation
    .replace('https://www.','')
    .replace('https://','')
    .replace('http://www.','')
    .replace('http://','')
    domain = domain.split('/')[0]




    isOnWikipedia = domain === 'en.wikipedia.org'

    isOnMediaWikiCategoryPage = currentLocation && 
    (currentLocation.includes(`https://${mediawikiDomain}/wiki/index.php`) &&
    currentLocation.includes(`Category:`))

    isOnMediaWikiDataPage = currentLocation && currentLocation.includes(`https://${mediawikiDomain}/wiki/index.php`) &&
    currentLocation.includes('Dates/')


    if (currentLocation.includes(mainBaseURL)) {
        titleInURL = currentLocation.replace(mainBaseURL, '').split('#')[0]
    } else if (currentLocation.includes(additionalBaseURL)) {
        titleInURL = getParamFromURL('title')
        currentLocation = mainBaseURL + titleInURL
    }

    const action = getParamFromURL('action')
    if (action || prohibitedPages.includes(currentLocation) || currentLocation.includes(datesFolder)) {
        currentLocation = null
    } else {
        currentLocation = currentLocation.split('?')[0].split('#')[0]
    }

   
 




}


function getParamFromURL(param) {

    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)

    return urlParams.get(param)

    // const [url, paramsString] = currentLocation.split('?')

    // if (currentLocation.includes('action=')) {
    //     currentLocation = null
    // }
    // const params = paramsString ? paramsString.split('&') : []
}