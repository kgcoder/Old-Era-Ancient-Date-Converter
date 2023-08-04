



function showPageInfoPopup(){


    let flattenedListOfEdits = []
    for(let edit of editsLoadedFromServer){
        if(!edit.isTemplate){
            flattenedListOfEdits.push(edit)
            continue
        }

        const editCopy = JSON.parse(JSON.stringify(edit))
        const subEdits = editCopy.subEdits.map((sEdit,index) => ({
            ...sEdit,
            templateName:editCopy.name,
            isTemplate:true,
            isTitle:index === 0
        }))

        flattenedListOfEdits = flattenedListOfEdits.concat(subEdits)
        
    }


    for(let i = 0; i < flattenedListOfEdits.length; i++){

        const edit = flattenedListOfEdits[i]

        const rep = replacementsLoadedFromServer.find(rep => areEditsInSamePlace(rep.edit,edit))
        
        if(!rep){
            edit.notFound = true
            edit.isSus = false
            continue
        }


        edit.isSus = !!rep.wasFixed 
        edit.notFound = false
   
    }


    const popup = document.createElement('div')
    popup.className = 'pageInfoPopup'
    popup.innerHTML = `
        <div class="sidebarWithDates">
        ${renderListOfEditsInInfoPopup(flattenedListOfEdits)}
        </div>
        <a href="#" class="pageInfoPopup-close">&times;</a>
    `
    document.body.appendChild(popup)



    const closeButton = document.getElementsByClassName('pageInfoPopup-close')[0]
    closeButton.addEventListener('click', (e) => {
       e.preventDefault()
        popup.parentElement.removeChild(popup)
    })
}



function renderListOfEditsInInfoPopup(instructions){
    return instructions.map(item => `${item.isTitle ? `<span class="templateNameSpan">${item.templateName}</span>` : ""}
            <div class="sideListRow${item.isTemplate ? " fadedRow" : ""}${item.isTitle ? " titleRow" : ""}">
                <div class="sideListTextContainer"><p>${markupDateInSideList(item.string,item.target,item.method,item.order,item.originalSubstitute)}</p></div>
                <span class="sideListExclamation">${item.isSus ? "!" : (item.notFound ? "!!" : " ")}</span>
            </div>
            `).join("\n")
}