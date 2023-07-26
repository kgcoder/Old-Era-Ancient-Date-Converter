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



function moveRefsToBottom(wikitext) {
  wikiCache = wikitext;
  const pattern = new RegExp(`(<ref[^/]*?/>;|<ref.*?>.*?</ref>)`,'gm')

  const refs = []
  let index = 0
  const newHTML = wikitext.replace(pattern, (match) => {
    index += 1
    refs.push(`REFERENCE_NUMBER_${index}:${match}END_OF_REFERENCE_NUMBER_${index}`)
    return `REFERENCE_NUMBER_${index}` 
  })

  return newHTML + SEPARATION_LINE + refs.join('<br/><br/>')

}

function moveRefsBack(wikitext) {
  wikiCache = wikitext;

  let [mainText, refsText] = wikitext.split(SEPARATION_LINE)


  
  let index = 1
  while (1) {
    const reg = new RegExp(`REFERENCE_NUMBER_${index}:(.*?)END_OF_REFERENCE_NUMBER_${index}`)
    const result = refsText.match(reg)
    if (!result) break;
    mainText = mainText.replace(`REFERENCE_NUMBER_${index}`, result[1])
    index++
  }


  return mainText


}










