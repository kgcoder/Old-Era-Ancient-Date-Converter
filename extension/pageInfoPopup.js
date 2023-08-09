/*
 * Copyright (c) Karen Grigorian
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

let pageInfoPopupIsShowing = false

function flattenListOfEdits(list){
    let result = []
    for(let edit of list){
        if(!edit.isTemplate){
            result.push(edit)
            continue
        }

        const editCopy = JSON.parse(JSON.stringify(edit))
        const subEdits = editCopy.subEdits.map((sEdit,index) => ({
            ...sEdit,
            templateName:editCopy.name,
            isTemplate:true,
            isTitle:index === 0
        }))

        result = result.concat(subEdits)
        
    }

    for(let i = 0; i < result.length; i++){

        const edit = result[i]

        const rep = replacementsLoadedFromServer.find(rep => areEditsInSamePlace(rep.edit,edit))
        
        if(!rep){
            edit.notFound = true
            edit.isSus = false
            continue
        }


        edit.isSus = !!rep.wasFixed 
        edit.notFound = false
   
    }


    return result
}


function togglePageInfoPopup(){
    if(isEditingMode)return
    if(pageInfoPopupIsShowing){
        hidePageInfoPopup()
    }else{
        showPageInfoPopup()
    }
        
}


function showPageInfoPopup(){


    if(pageInfoPopupIsShowing)return
    pageInfoPopupIsShowing = true
   


    const popup = document.createElement('div')
    popup.className = 'pageInfoPopup'
    popup.innerHTML = `
        <div class="sidebarWithDates">
        ${renderListOfEditsInInfoPopup(flattenedListOfEdits)}
        </div>
        <a href="#" class="editorPopup-close">&times;</a>
    `
    document.body.appendChild(popup)



    const closeButton = document.getElementsByClassName('editorPopup-close')[0]
    closeButton.addEventListener('click', (e) => {
       e.preventDefault()
       hidePageInfoPopup()
    })
}


function hidePageInfoPopup(){
    const popups = document.getElementsByClassName("pageInfoPopup")
    if(popups && popups.length ){
        popups[0].parentElement.removeChild(popups[0])
    }
    pageInfoPopupIsShowing = false

}



function renderListOfEditsInInfoPopup(instructions){
    return instructions.map(item => `${item.isTitle ? `<span class="templateNameSpan">${item.templateName}</span>` : ""}
            <div class="sideListRow${item.isTemplate ? " fadedRow" : ""}${item.isTitle ? " titleRow" : ""}">
                <div class="sideListTextContainer"><p>${markupDateInSideList(item.string,item.target,item.method,item.order,item.originalSubstitute)}</p></div>
                <span class="sideListExclamation">${item.isSus ? "!" : (item.notFound ? "!!" : " ")}</span>
            </div>
            `).join("\n")
}