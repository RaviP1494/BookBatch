const editionContainerDiv = document.querySelector('#edition-container-div');
const favoriteForm = document.querySelector('#favorite-form');
const readlistForm = document.querySelector('#have-read-form');
const recommendationForm = document.querySelector('#recommendation-form');
const editionID = editionContainerDiv.dataset.editionId;

async function loadEditionData() {
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


function showEditionData(rawData) {
    for (const dataKey in rawData) {
        const dataValue = extractValuesToString(rawData[dataKey]);
        const dataDiv = document.createElement('div');
        const br = document.createElement('br');
        dataDiv.innerText = `${dataKey}: ${dataValue} `;
        editionContainerDiv.append(dataDiv);
        editionContainerDiv.append(br);
        editionContainerDiv.append(br);
    }
}

function extractValuesToString(dataValue) {
    if (typeof (dataValue) === 'string' || typeof (dataValue) === 'number') {
        return dataValue;
    }
    else if (Array.isArray(dataValue)) {
        let retValue = '';
        for (const item of dataValue) {
            const innerDataStringValue = extractValuesToString(item);
            retValue += innerDataStringValue;
        }
        return retValue;
    }
    else if (typeof (dataValue) === 'object') {
        let retValue = '';
        for (const dataKey in dataValue) {
            const innerDataValue = dataValue[dataKey];
            const innerDataStringValue = extractValuesToString(innerDataValue);
            if (dataKey !== 'url') {
                retValue += `${dataKey}: ${innerDataStringValue} `;
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



