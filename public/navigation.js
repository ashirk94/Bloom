const navbarToggle = document.getElementById('navbar-toggle')
const navLinks = document.querySelectorAll('.nav-link')
const navItems = document.querySelectorAll('.nav-item')
const lowBar = document.getElementById('lower-navbar')
const topBar = document.getElementById('upper-navbar')
const innerBar = document.getElementById('inner-navbar')

function toggleBar() {
	innerBar.classList.toggle('pop-in')
    topBar.classList.toggle('mobile-invis')
    lowBar.classList.toggle('mobile-invis')

    for (const navItem of navItems) {
		navItem.classList.toggle('mobile-invis')
	}
	for (const navLink of navLinks) {
		navLink.classList.toggle('open')
	}
}

navbarToggle.addEventListener('click', toggleBar)
