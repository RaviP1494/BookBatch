const ul = document.querySelector('#temp');
// axios.get('https://openlibrary.org/isbn/9788497930772.json')
//     .then(resp => console.log(resp))
//     .catch(err => console.log(`error: ${err}`));

// axios.get('https://openlibrary.org/api/books?bibkeys=ISBN:9788497930772&jscmd=data&format=json')
//     .then(resp => console.log(resp))
//     .catch(err => console.log(`error: ${err}`));

//q=, title=, author=, 
//.org/search/authors.json?q=dostoevsky
//?sort=
//^ https://github.com/internetarchive/openlibrary/blob/master/openlibrary/plugins/worksearch/code.py#L135-L154

axios.get('https://openlibrary.org/api/books?bibkeys=ISBN:9788497930772&format=json')
    .then(resp => console.log(resp))
    .catch(err => console.log(`error: ${err}`));

axios.get('https://openlibrary.org/api/books?bibkeys=ISBN:9788497930772&jscmd=data&format=json')
    .then(resp => console.log(resp))
    .catch(err => console.log(`error: ${err}`));

axios.get('http://openlibrary.org/search.json?q=the+brothers+karamazov')
    .then(
        (resp) => {
            const data = resp.data;
            console.log(data);
            if (data.numFound != 0) {
                for (let i = 0; i < data.docs.length; i++) {
                    add_book_search_result(data.docs[i]);
                }
            }
        })
    .catch(err => console.log(`error: ${err}`));

function add_book_search_result(doc) {
    const li = document.createElement('li');
    const author_names = typeof doc.author_name !== 'string' ? doc.author_name : null;
    li.innerText = `Title: ${doc.title} | Author: `
    if (author_names) {
        for (const name of author_names) {
            li.innerText = `${li.innerText} ${name} |`;
        }
    }
    else {
        li.innerText = li.innerText + doc.author_name;
    }
    // li.innerText = `${doc.title}, ${doc.title_suggest}, ${doc.number_of_pages_median}, ${doc.key}`;
    ul.append(li);
}
