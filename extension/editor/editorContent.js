/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */


let currentHTML = ''
let editsFromServer = []


function onEditorLoad() {
//     if(!isEditingMode)return
     console.log('editing mode')
//     //disableAllLinks()
//    // setInitialHtml()
     addToHistory(currentHTML)
//    // getPageData()

    loadEdits(editsFromServer,true,false)
}



function loadEdits(edits,shouldFixBrokenEdits = false,showOnlyFixed = false){
    if (currentIndexInHistory !== 0) {
        alert("can't load after edits")
        return
    }
    currentHTML = currentHTML.replace(/mw-collapsed/g, 'mw-expanded')



    console.log('edits',edits)
    console.log('shouldFixBrokenEdits',shouldFixBrokenEdits)
    console.log('showOnlyFixed',showOnlyFixed)
    const htmlWithMarkers = createHTMLWithMarkersForEditor(edits,shouldFixBrokenEdits,showOnlyFixed)
    currentHTML = replaceCurlyBracesWithMarkup(htmlWithMarkers)

    

    currentHTML = currentHTML.replace(/mw-collapsed/g, 'mw-expanded')

    console.log('html after download',currentHTML)


    setBodyFromCurrentHTML()
    addToHistory(currentHTML)

    instructions = edits
}




function createHTMLWithMarkersForEditor(editsArray,shouldFixBrokenEdits = false,showOnlyFixed = false) {

    let html = new XMLSerializer().serializeToString(document.body)
    html = removeProblematicPartsFromHtml(html)

    const { htmlWithIgParts, ignoredParts } = htmlWithIgnoredParts(html)

    console.log('htmlwithig length',htmlWithIgParts.length)
    console.log('ig parts length',ignoredParts.length)

    let replacements = getReplacementsFromEdits(editsArray,htmlWithIgParts)
   
    console.log('replacements from edits',replacements)
    let currentGap = null
    let lastGoodEdit = null
    const gaps = []

    replacements.forEach(rep => {

    
        if(!currentGap && rep.isBroken === false){
            lastGoodEdit =  rep.edit
        }else if(!currentGap && rep.isBroken === true){
            currentGap = {firstGoodEdit:lastGoodEdit,brokenEdits:[rep.edit],lastGoodEdit:null}
            gaps.push(currentGap)
        }else if(currentGap && rep.isBroken === true){
            currentGap.brokenEdits.push(rep.edit)
        }else if(currentGap && rep.isBroken === false){
            lastGoodEdit = rep.edit
            currentGap.lastGoodEdit = rep.edit
            console.log('currentGap',currentGap)
            currentGap = null
        }

    })


    const filteredEdits = replacements.filter(rep => !rep.isBroken)

    pageHasIssues = filteredEdits.length !== replacements.length
    replacements = filteredEdits

    console.log('filtered replacements',replacements)

    if(shouldFixBrokenEdits){
        const fixedEdits = fixBrokenEdits(gaps,htmlWithIgParts)
        if(showOnlyFixed){
            replacements = fixedEdits
        }else{
            replacements = replacements.concat(fixedEdits)
        }
    }

    console.log('replacements after fixing',replacements)


    let localReplacementsArray = []

    findIfPageIsAboutEarlyCenturyOrMillennium(html)


    getLocalReplacements(htmlWithIgParts, localReplacementsArray, currentPageData)
    console.log('local replacements', localReplacementsArray)
    localReplacementsArray = localReplacementsArray.map(item => {
        item.edit.targetIndex = item.index
        return item
    })

    replacements = resolveReplacements(localReplacementsArray, replacements)

    replacements = replacements.sort((a, b) => a.edit.targetIndex - b.edit.targetIndex)


    console.log('number of replacements',replacements.length)
  



    if (!replacements.length) return null

    let result = ''
    let lastIndex = 0

    replacements.forEach(({ index, length, replacement }) => {
        result += htmlWithIgParts.substr(lastIndex, index - lastIndex)
        result += replacement
        lastIndex = index + length
    })

    result += htmlWithIgParts.substr(lastIndex, htmlWithIgParts.length - lastIndex)


    const chunks = result.split('<IgnoredPart>')
    if (chunks < 2) return result
    // return chunks.join('')
    let newHtml = ''
    for (let i = 0; i < ignoredParts.length; i++) {
        newHtml += chunks[i] + ignoredParts[i]
    }
    newHtml += chunks[chunks.length - 1]

    return newHtml

}


function replaceCurlyBracesWithMarkup(html) {
    console.log('replaceCurlyBracesWithMarkup html', html)
    const pattern = new RegExp('\\{\\{(.*?)\\|(.*?)\\|(.*?)\\|(.*?)\\|(.*?)\\}\\}', 'g')
    return html.replace(pattern, (match, method, target, type, originalSubstitute,fromTemplate) => {
        let color = 'red'
        if (originalSubstitute) {
            target = target + '_substitute_' + originalSubstitute
        }
        switch (method) {
            case 'year':
            case 'bc-y':
            case 'bc-y-r1':
            case 'bc-y-r2':
                color = 'green'
                break
            case 'ad-y':
                color = 'rosyBrown'
                break
            case 'bc-y1':
            case 'oneDigitYear':
                color = 'gainsboro'
                break
            case 'bc-y2':
            case 'twoDigitYear':
                color = 'dimgray'
                break
            case 'bc-i':
            case 'bc-i-r1':
            case 'bc-i-r2':
            case 'impreciseYear':
                color = 'pink'
                break
            case 'decade':
                color = 'olive'
                break
            case 'century':
                color = 'orange'
                break
            case '00s':
                color = 'coral'
                break
            case 'millennium':
                color = 'darkcyan'
                break
            case '000s':
                color = 'blueViolet'
                break
            case 'remove':
                color = 'brown'
                break
            case 'OE':
                color = 'aqua'
                break
            case 'ofOE':
                color = 'lime'
                break
            case 'bc-ig':
                color = 'dimgray'
                break
            default:
                color = 'red'
        }

        if (type === 'quote') {
            color = 'violet'
        } else if (type === 'bookTitle') {
            color = 'blue'
        }
        // console.log('target', target)
        // console.log('method', method)
        // console.log('type', type)


        return `<selection class="${method}" data-t="${fromTemplate}" style="background-color:${color};">${target}</selection>`
    })

}




function addListenersToSelections() {
    const selections = document.getElementsByTagName('selection') 
    console.log('selection', selections[0])
    for (let i = 0; i < selections.length; i++) {
        let sel = selections[i]
        sel = removeListeners(sel)
        sel.addEventListener('click', (e) => {
            //  e.preventDefault()
            document.getSelection().removeAllRanges();
            console.log('clicked', e)
            const text = sel.innerHTML
            const chunks = text.split('_substitute_')
            const target = chunks[0]
            if (e.shiftKey) {
                let substitute = ''
                if (chunks.length === 2) {
                    substitute = chunks[1]
                }
                const newSubstitute = prompt("Substitute", substitute);
                if (newSubstitute == null) {
                    console.log('cancel')
                    return
                }
                sel.innerHTML = newSubstitute ? target + '_substitute_' + newSubstitute : target

            } else if (e.altKey) {
                let newClassName = ''
                let color = ''
                if (sel.className === 'year') {
                    newClassName = 'oneDigitYear'
                    color = 'gainsboro'
                } else if (sel.className === 'oneDigitYear') {
                    newClassName = 'twoDigitYear'
                    color = 'dimgray'
                } else if (sel.className === 'twoDigitYear') {
                    newClassName = 'year'
                    color = 'green'
                } else {
                    return
                }
                sel.outerHTML = `<selection class="${newClassName}" data-t="${sel.outerHTML.includes('data-t="true"') ? 'true' : ''}" style="background-color:${color};">` + sel.innerHTML + '</selection>'

            } else {
                console.log('style', sel.style)
                if (sel.style.backgroundColor === 'blue' || sel.style.backgroundColor === 'violet') {
                    console.log('yes')
                    return
                }
                if (sel.className !== 'year' && sel.className !== 'impreciseYear') return
                const newClassName = sel.className === 'year' ? 'impreciseYear' : 'year'
                const color = newClassName === 'year' ? 'green' : 'pink'
                sel.outerHTML = `<selection class="${newClassName}" data-t="${sel.outerHTML.includes('data-t="true"') ? 'true' : '' }" style="background-color:${color};">` + sel.innerHTML + '</selection>'
            }

            const currentLocation = window.location.toString()
            if (currentLocation.includes('localhost')) {
                // const p = document.getElementsByClassName('p')[0]
                currentHTML = document.body.innerHTML
            } else {
                currentHTML = new XMLSerializer().serializeToString(document.body)
            }
            currentHTML = removeProblematicPartsFromHtml(currentHTML)
            addToHistory(currentHTML)

        })
    }


}

function removeListeners(node) {
    const new_element = node.cloneNode(true);
    node.parentNode.replaceChild(new_element, node);
    return new_element
}

function yearNumberClicked() {
    console.log('year number clicked')
}