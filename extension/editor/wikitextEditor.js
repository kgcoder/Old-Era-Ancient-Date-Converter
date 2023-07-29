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
    return `@@@REFERENCE_NUMBER_${index}@@@` 
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
    mainText = mainText.replace(`@@@REFERENCE_NUMBER_${index}@@@`, string)
    index++
  }


  return mainText


}

function findDatesInWikitext(instructions, wikitext){
    if(!instructions.length)return wikitext

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


    return result
}

function findOneDateInWikitext(instruction, wikitext,replacements, indexOfLastFoundDate){

   
    let {string,target,order} = instruction

    if (!order) order = '1.1.1.1'

        const orderChunks = order.split('.').map(chunk => parseInt(chunk, 10))
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


        const leftSnapshot = wikitext.substr(firstIndex, innerIndex)
        const rightSnapshot = wikitext.substr(result.index + target.length,string.length - innerIndex - target.length)

       
        const leftCount = testLeftPartSimilarity(leftString,leftSnapshot)
        const rightCount = testRightPartSimilarity(rightString,rightSnapshot)


        const totalCount = leftCount + rightCount



      if(totalCount > 8){
          allCounts.push({count:totalCount,index:result.index})
      }


   
    }

    allCounts = allCounts.sort((a,b) => b.count - a.count)


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
            instruction.isSus = true
            indexInAllCounts++
        }
    }
    instruction.notFound = true
    return -1

}

function testLeftPartSimilarity(mainLeftString,leftSampleString){
    let index = mainLeftString.length - 1

    let indexInSample = leftSampleString.length - 1

    let count = 0
    while(index >= 0 && indexInSample >= 0){
        const mainChar = mainLeftString[index]
        if(!mainChar.trim() || mainChar === "@"){
            index--
            continue
        }
        const sampleChar = leftSampleString[indexInSample]

        if(mainChar === sampleChar){
            count++
            index--
        }
        indexInSample--

    }

    return count
}


function testRightPartSimilarity(mainRightString,rightSampleString){
    let index = 0

    let indexInSample = 0

    let count = 0
    while(index < mainRightString.length && indexInSample < rightSampleString.length){
        const mainChar = mainRightString[index]
        if(!mainChar.trim() || mainChar === "@"){
            index++
            continue
        }
        const sampleChar = rightSampleString[indexInSample]

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

    try {
        if(markupGenerated){
        await navigator.clipboard.writeText(unescapeHTML(wikitextEditor.document.body.innerHTML));
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
     // toast.classList.add('hide');
    }, 3000); // Hide the toast after 3 seconds
  }

