const backdrop = document.querySelector('.backdrop');
const sideDrawer = document.querySelector('.mobile-nav');
const menuToggle = document.querySelector('#side-menu-toggle');

function backdropClickHandler() {
    backdrop.style.display = 'none';
    sideDrawer.classList.remove('open');
    sideDrawer.classList.remove('trans');
}

function menuToggleClickHandler() {
    backdrop.style.display = 'block';
    sideDrawer.classList.add('open');
    sideDrawer.classList.add('trans');
    if (sideDrawer.classList.contains("open")) {
        console.log("fuck")
        menuToggle.addEventListener('click', backdropClickHandler);
    }
}

backdrop.addEventListener('click', backdropClickHandler);
menuToggle.addEventListener('click', menuToggleClickHandler);