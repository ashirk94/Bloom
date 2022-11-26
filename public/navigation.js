const navbarToggle = document.getElementById('navbar-toggle')
const navLinks = document.querySelectorAll('.nav-link')
const navItems = document.querySelectorAll('.nav-item')
const lowBar = document.getElementById('lower-navbar')
const topBar = document.getElementById('upper-navbar')
const navBar = document.getElementById('navbar')

function toggleBar() {
	navBar.classList.toggle('pop-in')
    lowBar.classList.toggle('mobile-invis')
    topBar.classList.toggle('appear')
    lowBar.classList.toggle('appear')
    for (const navItem of navItems) {
		navItem.classList.toggle('mobile-invis')
	}
	for (const navLink of navLinks) {
		navLink.classList.toggle('open')
	}
}

navbarToggle.addEventListener('click', toggleBar)
