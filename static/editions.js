const workDiv = document.querySelector('#work-detail-div');
const editionsDiv = document.querySelector('#editions-container-div');
const workID = workDiv.dataset.workId;
const languageNames = new Intl.DisplayNames(['en'], {
    type: 'language'
  });

const openLibraryBaseUrl = 'http://openlibrary.org';

async function populatePage(e) {
    //we need to populate the workDiv with the work details and to populate the editionsDiv with the edition cards. so we need to make 2 requests, populate the workDiv, and populate the editionsDiv. Let's start with the workDiv.
    try {
        await populateWork();
        await populateEditions();
    }
    catch(err){
        console.log(err);
    }
}

async function populateWork(){
    const workResponse = await axios.get(`${openLibraryBaseUrl}/works/${workID}.json`);
    const workData = extractWorkData(workResponse.data);
    showWorkData(workData);
}

async function populateEditions(pageNum=0){
    const editionsResponse = await axios.get(`${openLibraryBaseUrl}/works/${workID}/editions.json?offset=${pageNum*50}`);
        console.dir(editionsResponse);
        if (editionsResponse.status === 200) {
            for (const editionEntry of editionsResponse.data.entries) {
                const editionData = extractEditionData(editionEntry);
                const editionDiv = makeEditionCard(editionData);
                editionsDiv.append(editionDiv);
            }
            if(editionsResponse.data.size > 50){
                await makePageIndex(editionsResponse.data.size);
            }
        }
}

async function makePageIndex(responseCount){
    const indexDiv = document.createElement('div');
    indexDiv.setAttribute('id', 'index-div');
    indexDiv.setAttribute('class', 'index-div');
    const pageCount = (responseCount / 50) + 1
    for (let i = 1; i < pageCount; i++) {
        const pageAnchor = document.createElement('a');
        pageAnchor.setAttribute('data-page-num', i);
        pageAnchor.setAttribute('class', 'index-anchor');
        pageAnchor.innerText = `| ${i} |`;
        indexDiv.append(pageAnchor);
    }
    const bodyEl = document.querySelector('#body-wrapper');
    bodyEl.append(indexDiv);
    indexDiv.addEventListener('click', editionsPageNumClick);
}

async function editionsPageNumClick(e){
    e.preventDefault();
    const pageNum = e.target.dataset.pageNum ? e.target.dataset.pageNum : null;
    if(pageNum){
        const oldIndex = document.querySelector('#index-div');
        oldIndex.remove();
    }

    editionsDiv.innerText = '';

    await populateEditions(pageNum-1);
}

function showWorkData(workData) {
    const title = document.createElement('h1');
    title.classList.add('work-detail-title');
    title.innerText = workData.title;
    workDiv.append(title);

    if(workData.description){
        const description = document.createElement('h4');
        description.innerText = `Description: ${workData.description}`;
        workDiv.append(description);
    }

    if(workData.time_periods){
        const time_periods = document.createElement('p');
        time_periods.innerText = `Time Periods: ${workData.time_periods}`;
        workDiv.append(time_periods);
    }

    if(workData.places){
        const places = document.createElement('p');
        places.innerText = `Places: ${workData.places}`;
        workDiv.append(places);
    }

    if(workData.subject_people){
        const subject_people = document.createElement('p');
        subject_people.innerText = `Characters: ${workData.subject_people}`;
        workDiv.append(subject_people);
    }

    if(workData.subjects){
        const subjectsDiv = document.createElement('div');
        const subjectsHeading = document.createElement('p');
        subjectsHeading.innerText = 'Subjects:';
        subjectsHeading.setAttribute('style','text-align:center');
        const subjects = document.createElement('p');
        subjects.innerText = `${workData.subjects.join(' --- ')}`;
        subjectsDiv.append(subjectsHeading);
        subjectsDiv.append(subjects);
        workDiv.append(subjectsDiv);
    }   
}

function extractEditionData(e) {
    let languages = [];
    if(e.languages){
        for(const languageObj of e.languages){
            languages.push(languageNames.of(languageObj['key'].split('/')[2]));
        }
    }
    return {
        title: e.title ? e.title : null,
        publishers: e.publishers ? e.publishers : null,
        publishDate: e.publish_date ? e.publish_date : null,
        languages: e.languages ? languages : null,
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
        time_periods: workData.subject_times ? workData.subject_times : null,
        subject_people: workData.subject_places ? workData.subject_people : null,
        subjects: workData.subjects ? workData.subjects : null
    };
    return wData;
}

function stripEditionID(raw_editionID) {
    const temp = raw_editionID.split('/');
    if (temp.length === 3) {
        return temp[2];
    }
}

function formatSearchTerm(input) {
    return input.split(' ').join('+');
}

function stringifyList(list){
    let retVal = '';
    let i = 0;
    while(i < list.length){
        retVal+= list[i];
        if(i!=list.length-1){
            retVal+= ', ';
        }
        i++;
    }
    return retVal;
}

function makeEditionCard(editionData) {
    const editionDiv = document.createElement('div');
    const titleDiv = document.createElement('div');
    const publishersDiv = document.createElement('div');
    const languagesDiv = document.createElement('div');
    const coverDiv = document.createElement('div');
    const coverImg = document.createElement('img');

    if (editionData.cover) {
        coverImg.setAttribute('src', `http://covers.openlibrary.org/b/id/${editionData.cover}-M.jpg`);
        coverDiv.append(coverImg);
    }
    else {
        coverImg.setAttribute('src', 'https://dictionary.cambridge.org/us/images/full/book_noun_001_01679.jpg?version=5.0.288')
        coverDiv.append(coverImg);
    }

    coverImg.setAttribute('class', 'edition-card-img');

    titleDiv.innerText = editionData.title ? editionData.title : 'title unavailable';
    titleDiv.classList.add('edition-card-title-div');
    
    if (editionData.publishers) {
        publishersDiv.innerText = `Published by ${stringifyList(editionData.publishers)} on: `;
    }

    publishersDiv.innerText+= editionData.publishDate ? editionData.publishDate : 'Pub Date N/A';
    if(editionData.languages){
        languagesDiv.innerText = `${stringifyList(editionData.languages)}`;
    }
    else{
        languagesDiv.innerText = 'Language N/A';
    }
    publishersDiv.classList.add('edition-card-publishers-div');

    editionDiv.append(titleDiv);
    editionDiv.append(publishersDiv);
    editionDiv.append(coverDiv);
    editionDiv.append(languagesDiv);

    editionDiv.setAttribute('class', 'card-div');

    editionDiv.addEventListener('click', function (e) {
        const editionID = stripEditionID(editionData.key);
        window.location.href = `/books/editions/${editionID}`;
    })

    return editionDiv;
}

window.onload = populatePage;


