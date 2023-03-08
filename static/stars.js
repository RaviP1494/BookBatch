const container = document.querySelector('body');
const containerRect = container.getBoundingClientRect();

let i = 0;
while (i < (containerRect.height) / 4) {
    const star1 = makeStar(1);
    container.append(star1);
    const star2 = makeStar(2);
    container.append(star2);
    const star3 = makeStar(3);
    container.append(star3);
    const star4 = makeStar(4);
    container.append(star4);
    i++;
}

function makeStar(size) {
    const star = document.createElement('div');
    star.classList.add('star');
    const left = Math.floor(Math.random() * containerRect.width) + containerRect.x;
    const top = Math.floor(Math.random() * containerRect.height) + containerRect.y;
    star.style.position = 'absolute';
    star.style.left = `${left}px`;
    star.style.top = `${top}px`;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    return star;
}