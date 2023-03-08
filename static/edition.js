const editionContainerDiv = document.querySelector('#edition-container-div');
const favoriteForm = document.querySelector('#favorite-form');
const readlistForm = document.querySelector('#have-read-form');
const recommendationForm = document.querySelector('#recommendation-form');
const editionID = editionContainerDiv.dataset.editionId;

async function loadEditionData() {
    try {
        const rawEditionData = await axios.get(`https://openlibrary.org/api/books?bibkeys=${editionID}&jscmd=data&format=json`);
        if (rawEditionData.status === 200) {
            showEditionData(rawEditionData.data[editionID]);
            const bookModelData = extractModelData(rawEditionData.data[editionID]);
            if (favoriteForm) {
                addDataToForm(favoriteForm, bookModelData);
                addDataToForm(readlistForm, bookModelData);
            }
            if (recommendationForm) {
                addDataToForm(recommendationForm, bookModelData);
            }
        }
    }
    catch(e){
        console.log(e);
    }
}


function showEditionData(rawData) {
    // title + author div--------------------------------------------------------
    console.table(rawData);

    const headerDiv = document.createElement('div');
    headerDiv.classList.add('edition-header-div');
    const headerTitle = document.createElement('h1');
    const authorPreText = document.createElement('h5');
    authorPreText.classList.add('author-pre-text');
    const headerAuthor = document.createElement('h4');

    const title = rawData['title'] ? rawData['title'] : null;
    headerTitle.innerText = title;

    authorPreText.innerText = 'written by';

    const author = extractValuesToString(rawData['authors']);
    headerAuthor.innerText = author;

    headerDiv.append(headerTitle);
    if (rawData['subtitle']) {
        const subTitle = document.createElement('h6');
        subTitle.innerText = rawData['subtitle'];
        headerDiv.append(subTitle);
    }
    headerDiv.append(authorPreText);
    headerDiv.append(headerAuthor);
    if (rawData['publishers'] || rawData['publish_date']) {
        const publisherP = document.createElement('p');
        publisherP.classList.add('publisher-p');
        publisherP.innerHTML = 'Published ';
        if (rawData['publishers']) {
            publisherP.innerHTML += `by ${extractValuesToString(rawData['publishers'])} `;
        }
        if (rawData['publish_date']) {
            publisherP.innerHTML += `on <br>${rawData['publish_date']}`;
        }
        headerDiv.append(publisherP);
    }

    editionContainerDiv.append(headerDiv);
    // title + author div--------------------------------------------------------


    if (rawData['cover']) {
        const coverDiv = document.createElement('div');
        coverDiv.classList.add('edition-cover-div');
        const coverImg = document.createElement('img');
        coverImg.classList.add('edition-cover-img');

        coverImg.setAttribute('src', rawData['cover']['large']);
        coverDiv.append(coverImg);
        editionContainerDiv.append(coverDiv);
    }

    const editionInfoDiv = document.createElement('div');
    editionInfoDiv.classList.add('edition-info-div');

    const infoTitleDiv = document.createElement('h2');
    infoTitleDiv.innerText = 'More Details';
    infoTitleDiv.classList.add('edition-info-title');
    editionInfoDiv.append(infoTitleDiv);

    //notes
    if (rawData['notes']) {
        const notesDiv = document.createElement('div');
        const notesP = document.createElement('p');
        notesDiv.classList.add('edition-info-element');
        notesP.innerHTML = `Notes:<br>${extractValuesToString(rawData['notes'])}`;
        if (rawData['by_statement']) {
            notesP.innerHTML += `<br>${extractValuesToString(rawData['by_statement'])}`;
        }
        notesDiv.append(notesP);
        editionInfoDiv.append(notesDiv);
    }

    //page count
    if (rawData['number_of_pages'] || rawData['pagination']) {
        const pageCountDiv = document.createElement('div');
        const pageCountP = document.createElement('p');
        pageCountDiv.classList.add('edition-info-element');
        pageCountDiv.classList.add('edition-page-count-div');
        const pageCount = rawData['number_of_pages'] ? rawData['number_of_pages'] : rawData['pagination'];
        pageCountP.innerHTML = `Page count:<br>${pageCount}`;
        pageCountDiv.append(pageCountP);
        editionInfoDiv.append(pageCountDiv);
    }

    //links
    const linksDiv = document.createElement('div');
    linksDiv.classList.add('edition-info-element');
    const linksTitle = document.createElement('h4');
    linksTitle.innerText = 'Links';
    linksDiv.append(linksTitle);
    const linksUL = document.createElement('ul');
    const olLinkLI = document.createElement('li');
    const olLinkA = document.createElement('a');
    olLinkA.setAttribute('href', rawData['url']);
    olLinkA.innerText = 'Open Library (API Source)';
    olLinkLI.append(olLinkA);
    linksUL.append(olLinkLI);
    if (rawData['links']) {
        for (const link of rawData['links']) {
            const linkLI = document.createElement('li');
            const linkA = document.createElement('a');
            linkA.setAttribute('href', link['url']);
            linkA.innerText = link['title'];
            linkLI.append(linkA);
            linksUL.append(linkLI);
        }
        linksDiv.append(linksUL);
        editionInfoDiv.append(linksDiv);
    }

    if (rawData['identifiers']) {
        const idObj = rawData['identifiers'];
        const identifierDiv = document.createElement('div');
        const identifierHeader = document.createElement('h4');
        identifierHeader.innerText = 'Identifiers';
        identifierDiv.append(identifierHeader);
        identifierDiv.classList.add('edition-info-element');
        identifierDiv.classList.add('edition-identifiers-element');
        for (const idKey in idObj) {
            const subDiv = document.createElement('div');
            const identifierTitle = document.createElement('h5');
            identifierTitle.innerText = idKey;
            const identifiersP = document.createElement('p');
            identifiersP.innerText = extractValuesToString(idObj[idKey]);
            subDiv.append(identifierTitle);
            subDiv.append(identifiersP);
            identifierDiv.append(subDiv);
        }
        editionInfoDiv.append(identifierDiv);
    }

    editionContainerDiv.append(editionInfoDiv);


    // const hr = document.createElement('hr');
    // editionContainerDiv.append(hr);
    // for (const dataKey in rawData) {
    //     const dataValue = extractValuesToString(rawData[dataKey]);
    //     const dataDiv = document.createElement('div');
    //     const br = document.createElement('br');
    //     dataDiv.innerText = `${dataKey}: ${dataValue} `;
    //     editionContainerDiv.append(dataDiv);
    //     editionContainerDiv.append(br);
    //     editionContainerDiv.append(br);
    // }
}

function extractValuesToString(dataValue) {
    if (typeof (dataValue) === 'string' || typeof (dataValue) === 'number') {
        return dataValue;
    }
    else if (Array.isArray(dataValue)) {
        let retValue = '';
        let i = 0;
        for (const item of dataValue) {
            const innerDataStringValue = extractValuesToString(item);
            if (i === dataValue.length - 2) {
                retValue += `${innerDataStringValue} and `;
            }
            else if (i === dataValue.length - 1) {
                retValue += `${innerDataStringValue}`;
            }
            else {
                retValue += `${innerDataStringValue}, `;
            }
            i++;
        }
        return retValue;
    }
    else if (typeof (dataValue) === 'object') {
        let retValue = '';
        for (const dataKey in dataValue) {
            const innerDataValue = dataValue[dataKey];
            const innerDataStringValue = `${extractValuesToString(innerDataValue)} `;
            if (dataKey !== 'url') {
                if (dataKey !== 'name') {
                    retValue += `${dataKey}: ${innerDataStringValue}`;
                }
                else {
                    retValue += `${innerDataStringValue}`;
                }
            }
        }
        return retValue;
    }
}

function extractModelData(rawData) {
    const authorString = rawData.authors ? extractValuesToString(rawData.authors) : 'N/A';
    const author = authorString.split(':')[1];
    return {
        title: rawData.title ? rawData.title : 'N/A',
        author: author,
        publish_date: rawData.publish_date ? rawData.publish_date : null,
        olid: editionID
    }
}

function addDataToForm(form, bookObj) {
    for (const key in bookObj) {
        const input = document.createElement('input');
        input.setAttribute('name', key);
        input.value = bookObj[key];
        input.hidden = true;
        form.append(input);
    }
}

window.onload = loadEditionData;



