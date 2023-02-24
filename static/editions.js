const gridDiv = document.querySelector('#work-container-div');
const workDiv = document.querySelector('#work-div');
const editionsDiv = document.querySelector('#editions-container-div');
const workID = workDiv.dataset.workId;

const openLibraryBaseUrl = 'http://openlibrary.org';

async function populatePage(e) {
    //we need to populate the workDiv with the work details and to populate the editionsDiv with the edition cards. so we need to make 2 requests, populate the workDiv, and populate the editionsDiv. Let's start with the workDiv.

    const workResponse = await axios.get(`${openLibraryBaseUrl}/works/${workID}.json`);

    const workData = extractWorkData(workResponse.data);
    showWorkData(workData);

    const editionsResponse = await axios.get(`${openLibraryBaseUrl}/works/${workID}/editions.json`);

    console.dir(editionsResponse);

    if (editionsResponse.status === 200) {
        for (const editionEntry of editionsResponse.data.entries) {
            const editionData = extractEditionData(editionEntry);
            const editionDiv = makeEditionCard(editionData);
            editionsDiv.append(editionDiv);
        }
    }
};

function makeEditionCard(editionData) {
    const editionDiv = document.createElement('div');
    const titleDiv = document.createElement('div');
    const publishersDiv = document.createElement('div');
    const publishDateDiv = document.createElement('div');
    const languagesDiv = document.createElement('div');
    const coverDiv = document.createElement('div');
    const coverImg = document.createElement('img');
    
    if (editionData.cover) {
        coverImg.setAttribute('src', `http://covers.openlibrary.org/b/id/${editionData.cover}-M.jpg`);
        coverDiv.append(coverImg);
    }
    else{
        coverImg.setAttribute('src','https://dictionary.cambridge.org/us/images/full/book_noun_001_01679.jpg?version=5.0.288')
        coverDiv.append(coverImg);
    }

    coverImg.setAttribute('class','edition-img');

    titleDiv.innerText = editionData.title ? editionData.title : 'title unavailable';
    titleDiv.setAttribute('class', 'card-title-div');

    if (editionData.publishers) {
        for (const publisher of editionData.publishers) {
            publishersDiv.innerText += `${publisher} |`;
        }
    }

    publishDateDiv.innerText = editionData.publishDate ? editionData.publishDate : 'Pub Date N/A';
    languagesDiv.innerText = editionData.languages ? editionData.languages[0].key : 'no languages';

    editionDiv.append(titleDiv);
    editionDiv.append(coverDiv);
    editionDiv.append(publishersDiv);
    editionDiv.append(publishDateDiv);
    editionDiv.append(languagesDiv);

    editionDiv.setAttribute('class', 'edition-card');

    editionDiv.addEventListener('click', function(e){
        const editionID = stripEditionID(editionData.key);
        window.location.href = `/books/editions/${editionID}`;
    })

    return editionDiv;
}

function showWorkData(workData) {
    const temp = document.createElement('h1');
    temp.innerText = workData.title;
    workDiv.append(temp);

    const temp2 = document.createElement('h4');
    temp2.innerText = workData.description;
    workDiv.append(temp2);

    const temp3 = document.createElement('p');
    temp3.innerText = workData.places;
    workDiv.append(temp3);

    const temp4 = document.createElement('p');
    temp4.innerText = workData.time_periods;
    workDiv.append(temp4);
}

function extractEditionData(e) {
    return {
        title: e.title ? e.title : null,
        publishers: e.publishers ? e.publishers : null,
        publishDate: e.publish_date ? e.publish_date : null,
        languages: e.languages ? e.languages : null,
        isbn13: e.isbn_13 ? e.isbn_13 : null,
        isbn10: e.isbn_10 ? e.isbn_10 : null,
        cover: e.covers ? e.covers[0] : null,
        key: e.key
    };
}

function extractWorkData(workData) {
    const wData = {
        title: workData.title ? workData.title : null,
        description: workData.description ? workData.description : null,
        places: workData.subject_places ? workData.subject_places : null,
        time_periods: workData.subject_times ? workData.subject_times : null
    };
    return wData;
}

function stripEditionID(raw_editionID){
    const temp = raw_editionID.split('/');
    if (temp.length === 3) {
        return temp[2];
    }
}

window.onload = populatePage;


