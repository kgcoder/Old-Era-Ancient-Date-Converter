/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */


let wikiCache = "";
const SEPARATION_LINE = "==!!!DON'T CHANGE THIS LINE OR ANY REFERENCE LABEL TAGS!!!=="

let markupGenerated = false


function goBack() {
  if (cache) {
    editor.document.body.innerHTML = cache;
  }
}



function escapeHtml(htmlStr) {
    return htmlStr.replace(/&/gm, "&amp;")
          .replace(/</gm, "&lt;")
          .replace(/>/gm, "&gt;")
          .replace(/"/gm, "&quot;")
          .replace(/'/gm, "&#39;");        
}


function unescapeHTML(htmlStr){
    return htmlStr.replace(/&amp;/gm, "&")
          .replace(/&lt;/gm, "<")
          .replace(/&gt;/gm, ">")
          .replace(/&quot;/gm, '"')
          .replace(/&#39;/gm, "'"); 
}


function moveRefsToBottom(wikitext) {
  wikiCache = wikitext;
  const pattern = new RegExp(`(&lt;ref[^/]*?/&gt;|&lt;ref[\\s\\S]*?&gt;[\\s\\S]*?&lt;/ref&gt;)`,'gm')

  const refs = []
  let index = 0
  const newHTML = wikitext.replace(pattern, (match) => {
    index += 1
    refs.push(`REFERENCE_NUMBER_${index}:${match}END_OF_REFERENCE_NUMBER_${index}`)
    return `@REF_${index}@` 
  })

  return newHTML + SEPARATION_LINE + refs.join('<br/><br/>')

}

function moveRefsBack(wikitext) {
  wikiCache = wikitext;

  let [mainText, refsText] = wikitext.split(SEPARATION_LINE)
  
  let index = 1
  while (1) {
      const reg = new RegExp(`REFERENCE_NUMBER_${index}:([\\s\\S]*?)END_OF_REFERENCE_NUMBER_${index}`,'m')
    const result = refsText.match(reg)
    if (!result){ 
        break
    }

    const string = result[1].replace(/>/gm, "&gt;").replace(/</gm,"&lt;")
    mainText = mainText.replace(`@REF_${index}@`, string)
    index++
  }


  return mainText


}

function findDatesInWikitext(instructions, wikitext){
    if(!instructions.length)return {wikitextWithDates:wikitext,updatedInstructions:[]}
    instructions = JSON.parse(JSON.stringify(instructions))

    let replacements = []


    let indexOfLastFoundDate = 0
    for(let i = 0;i < instructions.length; i++){
        const instruction = instructions[i]
        const index = findOneDateInWikitext(instruction, wikitext,replacements, indexOfLastFoundDate)
        if(index > -1){
            indexOfLastFoundDate = index
        }
    }

    replacements = replacements.sort((a,b) => a.index - b.index)



    let result = ''
    let lastIndex = 0

    replacements.forEach(({ instruction,index }) => {
        result += wikitext.substr(lastIndex, index - lastIndex)
        const {method,target,originalSubstitute} = instruction
        const color = getColorForMethod(method)

        const replacement = `<span style="background-color:${color};">${target}${originalSubstitute ? '_substitute_' +originalSubstitute : ''}</span>`

        result += replacement
        lastIndex = index + target.length
    })

    result += wikitext.substr(lastIndex, wikitext.length - lastIndex)


    return  {wikitextWithDates:result,updatedInstructions:instructions}
}

function findOneDateInWikitext(instruction, wikitext,replacements, indexOfLastFoundDate){

   
    let {string,target,order} = instruction

    const orderChunks = getOrderChunks(order)

    if (orderChunks.length !== 4) {
        console.log('orderChunks.length !== 4 (in a date for wikitext)')
        return -1
    }

    const [string_num_of_oc, string_oc, target_num_of_oc, target_oc] = orderChunks


    const reg = new RegExp(escapeText(target),'gm')

    let allCounts = []// {count,index}[]

    let result;
    while ((result = reg.exec(wikitext))){

        
    
        
    
        const innerIndex = findIndexOfSubstringOccurrence(string, target, target_oc)



        const firstIndex = result.index - innerIndex

        const leftString = string.substr(0,innerIndex)
        const rightString = string.substr(innerIndex + target.length,string.length - innerIndex - target.length)


       
        const leftCount = testLeftPartSimilarity(leftString,wikitext,result.index)
        const rightCount = testRightPartSimilarity(rightString,wikitext,result.index + target.length)

        const totalCount = leftCount + rightCount



      if(totalCount > threshold ){
          allCounts.push({count:totalCount,index:result.index})
      }


   
    }


    allCounts = allCounts.sort((a,b) => a.index - b.index)
   


    let indexInAllCounts = string_oc - 1
    while(indexInAllCounts < allCounts.length){
        
        const foundIndex = allCounts[indexInAllCounts].index
        const exists = replacements.findIndex(rep => rep.index === foundIndex)
        if(exists === -1 && foundIndex > indexOfLastFoundDate){
            replacements.push({
                instruction,
                index:foundIndex
            })
            return foundIndex
        }else{
           // break
            instruction.isSus = true
            indexInAllCounts++
        }
    }
    instruction.isSus = undefined
    instruction.notFound = true

    return -1

}

function testLeftPartSimilarity(mainLeftString,wikitext,startIndex){
    let index = mainLeftString.length - 1

    let indexInSample = startIndex - 1

    let count = 0
    while(index >= 0 && indexInSample >= startIndex - 100){
        const mainChar = mainLeftString[index]
        if(!mainChar.trim() || mainChar === "@"){
            index--
            continue
        }
        const sampleChar = wikitext[indexInSample]

        if(mainChar === sampleChar){
            count++
            index--
        }
        indexInSample--

    }

    return count
}


function testRightPartSimilarity(mainRightString,wikitext,startIndex){
    let index = 0

    let indexInSample = startIndex

    let count = 0
    while(index < mainRightString.length && indexInSample < startIndex + 100){
        const mainChar = mainRightString[index]
        if(!mainChar.trim() || mainChar === "@"){
            index++
            continue
        }
        const sampleChar = wikitext[indexInSample]

        if(mainChar === sampleChar){
            count++
            index++
        }
        indexInSample++

    }

    return count
}






function addColorToWikitext(color){
    const selection = wikitextEditor.getSelection()
    if(!selection || !selection.rangeCount) return
    
    const range = selection.getRangeAt(0)

    const {startOffset, endOffset,startContainer} = range

    const selectedText = startContainer.data.substr(startOffset,endOffset - startOffset)



    wikitextEditor.document.execCommand('insertHTML', false, `<span style="background-color:${color};">${selectedText}</span>`);


   currentWikitext = wikitextEditor.document.body.innerHTML


}


async function clearSelectionInWikitext() {

   wikitextEditor.document.execCommand("backColor", false, "yellow");


    const newWikitext = wikitextEditor.document.body.innerHTML;

    const twoChunks = newWikitext.split('<span style="background-color: yellow;">')
    if(twoChunks.length != 2)return

    const reg = new RegExp('(<span style="color: white;">([\\s\\S]*?)</span>|</span>)', 'gm')

    let rightSide = twoChunks[1]


   let reachedEndOfYellowText = false

   rightSide = rightSide.replace(reg, (match, all,inner) => {
   
    if(reachedEndOfYellowText)return match
    if(match === '</span>'){
        reachedEndOfYellowText = true
        return ""
    }

    return inner
    })

    currentWikitext = twoChunks[0] + rightSide

    renderCurrentWikitext()
  
  }

function renderCurrentWikitext(){
    wikitextEditor.document.body.innerHTML = currentWikitext
}


async function getWikitextForPage(){
    try{
        const response = await fetch(`https://en.wikipedia.org/w/api.php?action=parse&origin=*&page=${titleInURL}&prop=wikitext&format=json&formatversion=2`)
     
        const json = await response.json()
        return json.parse.wikitext
    
    }catch(e){
     console.log(e)
     return ""
    }

}



//user actions


function thresholdInputDidChange() {
    const thresholdInput = document.getElementById('thresholdInput')
    const recalculateButton = document.getElementById('recalculateButton')
    const reg = new RegExp('[^\\d]','g')
    const text = thresholdInput.value
    thresholdInput.value = text.replace(reg,'')
    if(thresholdInput.value == "0")thresholdInput.value = ""

    if(thresholdInput.value){
        const newNumber = parseInt(thresholdInput.value,10)
        recalculateButton.disabled = newNumber == threshold
    }else{
        recalculateButton.disabled = true
    }

}


function recalculateButtonPressed(){
    const thresholdInput = document.getElementById('thresholdInput')
    threshold = parseInt(thresholdInput.value,10)

    const  {wikitextWithDates,updatedInstructions} = findDatesInWikitext(finalInstructions,initialWikitext)

    const sidebar = document.getElementsByClassName('sidebarWithDates')[0]
    sidebar.innerHTML = renderListOfEditsInWikitextSideBar(updatedInstructions)

    currentWikitext = wikitextWithDates
    renderCurrentWikitext()

    const recalculateButton = document.getElementById('recalculateButton')

    recalculateButton.disabled = true


}

function addSubstituteInWikitext(){
    wikitextEditor.document.execCommand("insertText", false, "_substitute_");
}

function addBCInWikitext(){
    wikitextEditor.document.execCommand("insertText", false, "&nbsp;BC");
}

function addBCEInWikitext(){
    wikitextEditor.document.execCommand("insertText", false, "&nbsp;BCE");
}

function generateWikiMarkup(){
    const existingWikitext = wikitextEditor.document.body.innerHTML;

    const reg = new RegExp('<span style="background-color:(.*?);">(.*?)</span>','gm')

    const intermediateWiki = existingWikitext.replace(reg, (match,color,content) => {
 
        const markupClass = colorToMarkupClass[color]

        const chunks = content.split("_substitute_")

        if(chunks.length === 2){
            return `{{${markupClass}|${chunks[0]}|${chunks[1]}}}`
        }else{
            return `{{${markupClass}|${content}}}`
        }



    })



    wikitextEditor.document.body.innerHTML = moveRefsBack(intermediateWiki)


    markupGenerated = true




}



function openEditorOnWikipedia(){
    const url = `https://en.wikipedia.org/w/index.php?title=${titleInURL}&action=edit`
    window.open(url)
}



async function copyWikitextToClipboard() {

    const toast = document.createElement('div');
    toast.className = 'toast'

    let unescapedHTML = unescapeHTML(wikitextEditor.document.body.innerHTML)

    const reg = new RegExp("(&nbsp;)?({{bc-.*?}})(&nbsp;)?","gm")
    unescapedHTML = unescapedHTML.replace(reg, (match,firstBreak,content,secondBreak) => {
        return (firstBreak ? " " : "") + content + (secondBreak ? " " : "")
    })


    try {
        if(markupGenerated){
            await navigator.clipboard.writeText(unescapedHTML);
            toast.innerText = "Wikitext copied to clipboard"
        }else{
            toast.innerText = "Wikitext is not ready to be copied"
        }


    } catch (err) {
        toast.innerText = "Copy to clipboard failed"

        console.error('Failed to copy to clipboard: ', err);
    }

    document.body.appendChild(toast)
    setTimeout(() => {
        toast.parentElement.removeChild(toast)
    }, 3000); // Hide the toast after 3 seconds
  }

