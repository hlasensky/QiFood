const backdrop = document.querySelector('.backdrop');
const sideDrawer = document.querySelector('.mobile-nav');
const menuToggle = document.querySelector('#side-menu-toggle');
const menuToggleClose = document.querySelector('#side-menu-toggle-close');

function backdropClickHandler() {
    backdrop.style.display = 'none';
    menuToggleClose.style.display = 'none';
    menuToggle.style.display = 'block';
    sideDrawer.classList.remove('open');
    sideDrawer.classList.remove('trans');
}

function menuToggleClickHandler() {
    backdrop.style.display = 'block';
    menuToggleClose.style.display = 'block';
    menuToggle.style.display = 'none';
    sideDrawer.classList.add('open');
    sideDrawer.classList.add('trans');
}

function menuToggleCloseClickHandler() {
    backdrop.style.display = 'block';
    menuToggle.style.display = 'block';
    menuToggleClose.style.display = 'none';
    sideDrawer.classList.remove('open');
    sideDrawer.classList.remove('trans');
    backdropClickHandler()
}

backdrop.addEventListener('click', backdropClickHandler);
menuToggle.addEventListener('click', menuToggleClickHandler);
menuToggleClose.addEventListener('click', menuToggleCloseClickHandler);