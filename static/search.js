const resultsList = document.querySelector("#results-list");
const searchInput = document.querySelector("#book-search-input");
const searchBtn = document.querySelector("#book-search-btn");

async function search(input) {
    const q = formatSearchTerm(input);
    try {
        const response = await axios.get(`http://openlibrary.org/search.json?q=${q}`);
        console.log(response);
        for (const doc of response.data.docs) {
            const book_data = extractBookData(doc);
            const li = makeLI(book_data);
            resultsList.append(li);
        }
    }
    catch (err) {
        console.log(err);
    }

}

function formatSearchTerm(input) {
    return input.split(' ').join('+');
}

function extractBookData(doc){
    const title = doc.title ? doc.title : null;
    const book_key = doc.key;
    //^ unique openlibrary identifier
    const author_names = typeof doc.author_name !== 'string' ? doc.author_name : null;
    let author = '';
    if(author_names){
        let i = 0;
        for (const author_name of author_names) {
            author+= i<author_names.length ? `${author_name}|` : `${author_name}`;
            i++;
        }
    }
    else{
        author = author_names;
    }
    return {
        Title:title,
        Author:author,
        Key:book_key
    };
}

function makeLI(obj) {    
    const li = document.createElement('li');
    const infoEl = document.createElement('p');
    const favBtn = document.createElement('button');
    favBtn.innerText = "Favorite"
    favBtn.setAttribute('data-book-key', `${obj['Key']}`)
    for (const key in obj) {
        infoEl.innerText = infoEl.innerText + `${key}:${obj[key]}  `;
    }

    li.append(infoEl);
    infoEl.prepend(favBtn);
    return li;
}

searchBtn.addEventListener("click", function (e) {
    e.preventDefault();
    resultsList.innerText = '';
    search(searchInput.value);
})

resultsList.addEventListener("click", function(e){
    e.preventDefault();
    if(e.target.tagName === 'BUTTON'){
        console.log(e.target.dataset.bookKey);
    }
})