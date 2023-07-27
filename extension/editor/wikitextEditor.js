let wikiCache = "";
const SEPARATION_LINE = "<br/>==!!!DON'T CHANGE THIS LINE OR ANY REFERENCE LABEL TAGS!!!==<br/>"
// function iframe() {
//   editor.document.designMode = "on";
//   editor.document.addEventListener("keydown", function onEvent(event) {
//     if (event.key === "Alt") {
//       clearSelection();
//     } else if (event.key === "Control") {
//       makeRed();
//     } else {
//       //console.log(event.key);
//     }
//   });
// }








// function makeRed() {
//   const html = editor.document.body.innerHTML;
//   cache = html;
//   editor.document.execCommand("backColor", false, "red");
// }

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

  console.log('mainText',mainText)

  console.log('refsText',refsText)
  
  let index = 1
  while (1) {
      const reg = new RegExp(`REFERENCE_NUMBER_${index}:([\\s\\S]*?)END_OF_REFERENCE_NUMBER_${index}`,'m')
    const result = refsText.match(reg)
    console.log('ref result',result)
    if (!result){ 
        console.log("didn't find ref " + index)
        break;}

    const string = result[1].replace(/>/gm, "&gt;").replace(/</gm,"&lt;")
    mainText = mainText.replace(`@@@REFERENCE_NUMBER_${index}@@@`, string)
    index++
  }


  return mainText


}

function findDatesInWikitext(instructions, wikitext){
    console.log('findDatesInWikitext')
    if(!instructions.length)return wikitext

    let replacements = []


    console.log('instructions inside findDatesInWikitext',instructions)
    let indexOfLastFoundDate = 0
    for(let i = 0;i < instructions.length; i++){
        const instruction = instructions[i]
        const index = findOneDateInWikitext(instruction, wikitext,replacements, indexOfLastFoundDate)
        if(index > -1){
            indexOfLastFoundDate = index
        }
    }

    replacements = replacements.sort((a,b) => a.index - b.index)

   // console.log('instructions!',instructions)
    //console.log('replacements',replacements)


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

    console.log('instructions by the end of findDatesInWikitext',instructions)

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
        if(!mainChar.trim()){
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
        if(!mainChar.trim()){
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




