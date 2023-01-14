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

function stripBookKey(book_key) {
    const temp = book_key.split('/');
    if (temp.length === 3) {
        return temp[2];
    }
}
// function formatBookQuery(book_key){
//     return `https://openlibrary.org/${book_key}.json`;
// }

function extractBookData(doc) {
    const title = doc.title ? doc.title : null;
    const book_key = stripBookKey(doc.key);
    //^ unique openlibrary identifier
    const author_names = typeof doc.author_name !== 'string' ? doc.author_name : null;
    let author = '';
    if (author_names) {
        let i = 0;
        for (const author_name of author_names) {
            author += author_name;
            i++;
        }
    }
    else {
        author = author_names;
    }
    return {
        title: title,
        author: author,
        book_key: book_key
    };
}

function makeLI(obj) {
    const { title, author, book_key } = obj;
    const li = document.createElement('li');

    const infoEl = document.createElement('p');
    const infoDiv = document.createElement('div');

    const favBtnAnchor = document.createElement('a');
    const favBtn = document.createElement('button');
    favBtn.innerText = "View";


    favBtnAnchor.setAttribute('href', `/books/${book_key}`);
    favBtnAnchor.setAttribute('data-book-key', `${book_key}`);
    infoEl.innerText = `${title} by ${author}`
    infoDiv.append(infoEl);
    li.append(infoDiv);
    favBtnAnchor.append(favBtn);
    infoDiv.prepend(favBtnAnchor);
    return li;
}

searchBtn.addEventListener("click", function (e) {
    e.preventDefault();
    resultsList.innerText = '';
    search(searchInput.value);
})

// resultsList.addEventListener("click", function(e){
//     e.preventDefault();
//     if(e.target.tagName === 'BUTTON'){
//         bookKey = e.target.dataset.bookKey;
//     }
// })