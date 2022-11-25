const navbarToggle = document.getElementById('navbar-toggle')
const navLinks = document.querySelectorAll('.nav-link')
const navItems = document.querySelectorAll('.nav-item')

function toggleBar() {
    for (const navLink of navLinks) {
        navLink.classList.toggle('open') 
    }
    for (const navItem of navItems) {
        navItem.classList.toggle('mobile-invis') 
    }
  }

navbarToggle.addEventListener("click", toggleBar)