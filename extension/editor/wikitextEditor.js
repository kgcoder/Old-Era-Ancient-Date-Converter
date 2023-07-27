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
  //let result
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


    let indexOfLastFoundDate = 0
    for(let i = 0;i < instructions.length; i++){
        const instruction = instructions[i]
        const index = findOneDateInWikitext(instruction, wikitext,replacements, indexOfLastFoundDate)
        if(index > -1){
            indexOfLastFoundDate = index
        }
    }

    replacements = replacements.sort((a,b) => a.index - b.index)

    console.log('instructions!',instructions)
    console.log('replacements',replacements)


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
    let highestCount = 0
    let closestIndex = -1
    let result;
    while ((result = reg.exec(wikitext))){

        
    
        
    
        const innerIndex = findIndexOfSubstringOccurrence(string, target, target_oc)



        const firstIndex = result.index - innerIndex

        const leftString = string.substr(0,innerIndex)
        const rightString = string.substr(innerIndex + target.length,string.length - innerIndex - target.length)


        const leftSnapshot = wikitext.substr(firstIndex, innerIndex)
        const rightSnapshot = wikitext.substr(result.index + target.length,string.length - innerIndex - target.length)

        // console.log("string",string)
       
        
        const leftCount = testLeftPartSimilarity(leftString,leftSnapshot)
        const rightCount = testRightPartSimilarity(rightString,rightSnapshot)


        const totalCount = leftCount + rightCount


        console.log('testing:',string)
        console.log('target:',target)
        console.log('result',result)

        const snapshot = wikitext.substr(result.index - 15, 15 + target.length + 15)
        console.log('snap:',snapshot)
        console.log('score:',totalCount)

        if(totalCount > 10){
            console.log("leftString",leftString)
            console.log('leftSnapshot',leftSnapshot)
            console.log('leftCount',leftCount)
    
            console.log("rightString",rightString)
            console.log("rightSnapshot",rightSnapshot)
            console.log('rightCount',rightCount)
        }

     

      //  console.log('total count',totalCount)


      if(totalCount > 8 && result.index > indexOfLastFoundDate){
          allCounts.push({count:totalCount,index:result.index})
      }


        // if(totalCount > highestCount){
        //     highestCount = totalCount
        //     closestIndex = result.index
        // }

    }
   // console.log('highest count',highestCount)

    allCounts = allCounts.sort((a,b) => b.count - a.count)


   // allCounts = allCounts.slice(0,string_num_of_oc)
    console.log('string_num_of_oc',string_num_of_oc)
    console.log('trimmed array', allCounts)

    allCounts = allCounts.sort((a,b) => a.index - b.index)

    let indexInAllCounts = string_oc - 1
    while(indexInAllCounts < allCounts.length){
        
        const foundIndex = allCounts[indexInAllCounts].index
        const exists = replacements.findIndex(rep => rep.index === foundIndex)
        if(exists === -1){
            replacements.push({
                instruction,
                index:foundIndex
            })
            return foundIndex
        }else{
            indexInAllCounts++
        }
    }

    return -1


   // console.log('allCounts',allCounts)


   // if(highestCount < 8)return -1
  // if(!allCounts.length) return -1

  //  return allCounts[string_oc - 1].index


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

// function testStringSimilarity(mainString, sampleString){

//     let highestCount = 0

//     for(let shift = -mainString.length + 1; shift <= mainString.length - 1;shift++){
//         let counter = 0
//         for(let i = 0; i < mainString.length;i++){
//             const charToFind = mainString[i]
//             const indexInSample = -shift + i
//             if(indexInSample < 0 || indexInSample > sampleString.length - 1)continue
//             const charInSample = sampleString[indexInSample]
//             if(charInSample === charToFind){
//                 counter++
//             }
    
//         }

//         if(counter > highestCount){
//             highestCount = counter
//         }

//     }


//     return highestCount


// }






