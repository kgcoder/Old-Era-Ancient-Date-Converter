async function getListOfTemplateNamesOnPage(){
    const url = `https://en.wikipedia.org/w/api.php?action=parse&origin=*&page=${titleInURL}&prop=templates&format=json&formatversion=2`
    try{
        const resp = await fetch(url)
        const json = resp ? await resp.json() : null
        if(!json || !json.parse || !json.parse.templates)return []
        return json.parse.templates.map(item => item.title)
    }catch(e){
        return []
    }
}


async function getAllProcessedTemplates(){
    const url = "https://timeline.oldera.org/wiki/api.php?action=query&list=categorymembers&cmtitle=Category:Wikipedia_templates&prop=categories&cllimit=max&format=json&formatversion=2&cmprop=title&origin=*"
    try{
        const resp = await fetch(url)
        const json = resp ? await resp.json() : null
        if(!json || !json.query || !json.query.categorymembers)return []
        return json.query.categorymembers.map(item => item.title.replace("Dates/en.wikipedia.org/wiki/",""))
    }catch(e){
        return []
    }
}