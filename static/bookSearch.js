const resultsDiv = document.querySelector("#results-div");
const searchInput = document.querySelector("#book-search-input");
const searchBtn = document.querySelector("#book-search-btn");
const openLibraryBaseUrl = 'http://openlibrary.org';

let currentSearchTerm = null;

async function search(q,pageNum=1) {
    try {
        const response = await axios.get(`${openLibraryBaseUrl}/search.json?q=${q}&page=${pageNum}`);
        console.log(response);
        for (const doc of response.data.docs) {
            const book_data = extractWorkCardData(doc);
            const workCard = makeWorkCard(book_data);
            resultsDiv.append(workCard);
        }
        if (response.data.numFound > 100) {
            makePageIndex(response.data.numFound);
        }
    }
    catch (err) {
        console.log(err);
    }

}

async function makePageIndex(responseCount) {
    const indexDiv = document.createElement('div');
    indexDiv.setAttribute('id', 'index-div');
    indexDiv.setAttribute('class', 'index-div');
    const pageCount = (responseCount / 100) + 1
    for (let i = 1; i < pageCount + 1; i++) {
        const pageAnchor = document.createElement('a');
        pageAnchor.setAttribute('data-page-num', i);
        pageAnchor.setAttribute('class', 'search-index-anchor');
        pageAnchor.innerText = `| ${i} |`;
        indexDiv.append(pageAnchor);
    }
    const bodyEl = document.querySelector('#body-wrapper');
    bodyEl.append(indexDiv);
    indexDiv.addEventListener('click', searchPageNumClick);
}

function searchPageNumClick(e) {
    e.preventDefault();
    const pageNum = e.target.dataset.pageNum ? e.target.dataset.pageNum : null;
    if(pageNum){
        const oldIndex = document.querySelector('#search-index-div');
        oldIndex.remove();
    }
    resultsDiv.innerText = '';
    
    search(currentSearchTerm, pageNum);
}

//INTEGRATE QUOTES AND AI IMAGE GENERATOR. 1/26/23 7:14 AM
function extractWorkCardData(doc) {
    const title = doc.title ? doc.title : null;
    const cover_id = doc.cover_i ? doc.cover_i : null;
    const work_id = stripWorkID(doc.key);
    //^ unique openlibrary identifier
    const author_names = typeof doc.author_name !== 'string' ? doc.author_name : null;
    const edition_count = doc.edition_count ? doc.edition_count : null;
    const places = doc.place ? doc.place : null;
    const persons = doc.person ? doc.person : null;
    const time_period = doc.time ? doc.time : null;
    const first_publish_year = doc.first_publish_year ? doc.first_publish_year : null;

    let author = '';
    if (author_names) {
        let i = 0;
        for (const author_name of author_names) {
            if (i === author_names.length - 2) {
                author += `${author_name} and `
            }
            else if (i === author_names.length - 1) {
                author += `${author_name}`
            }
            else {
                author += `${author_name}, `
            }
            i++;
        }
    }
    else {
        author = author_names;
    }
    return {
        title: title,
        author: author,
        work_id: work_id,
        cover_id: cover_id,
        edition_count: edition_count,
        places: places,
        persons: persons,
        time_period: time_period,
        first_publish_year: first_publish_year
    };
}

function formatSearchTerm(input) {
    return input.split(' ').join('+');
}

function stripWorkID(work_id) {
    const temp = work_id.split('/');
    if (temp.length === 3) {
        return temp[2];
    }
}

function makeWorkCard(obj) {
    const { title, author, work_id, cover_id, edition_count, first_publish_year} = obj;

    const workCardDiv = document.createElement('div');
    workCardDiv.setAttribute('class', 'card-div');

    const cardTitleDiv = document.createElement('div');
    cardTitleDiv.setAttribute('class', 'work-card-title-div');
    const titleAnchor = document.createElement('a');

    const cardAuthorDiv = document.createElement('div');
    cardAuthorDiv.setAttribute('class', 'work-card-author-div');
    const authorP = document.createElement('p');

    const coverImg = document.createElement('img');
    if (cover_id) { coverImg.setAttribute('src', `https://covers.openlibrary.org/b/id/${cover_id}-M.jpg`); }
    else { coverImg.setAttribute('src', `https://dictionary.cambridge.org/us/images/full/book_noun_001_01679.jpg?version=5.0.288`); }
    coverImg.setAttribute('class', 'work-card-img');

    const bottomDiv = document.createElement('div');
    bottomDiv.setAttribute('class', 'work-card-bottom-div');
    const editionCountP = document.createElement('p');
    const firstPublishYearP = document.createElement('p');
    // coverImg.hidden = true;

    cardTitleDiv.innerText = title;

    authorP.innerText = `by ${author}`;

    editionCountP.innerText = `${edition_count} editions`;
    firstPublishYearP.innerText = `First published in ${first_publish_year}`;

    cardAuthorDiv.append(authorP);
    bottomDiv.append(editionCountP);
    bottomDiv.append(firstPublishYearP);


    workCardDiv.append(cardTitleDiv);
    workCardDiv.append(cardAuthorDiv);
    workCardDiv.append(coverImg);
    workCardDiv.append(bottomDiv);

    workCardDiv.addEventListener('click',function(e){
        window.location.href = `/books/${work_id}`;
    });

    return workCardDiv;
    // favBtnAnchor.setAttribute('data-book-key', `${work_id}`);

}

searchBtn.addEventListener("click", function (e) {
    e.preventDefault();
    resultsDiv.innerText = '';
    const q = formatSearchTerm(searchInput.value);
    currentSearchTerm = q;
    search(q);
})

// resultsList.addEventListener("click", function(e){
//     e.preventDefault();
//     if(e.target.tagName === 'BUTTON'){
//         bookKey = e.target.dataset.bookKey;
//     }
// })