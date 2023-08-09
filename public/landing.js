const landingImage = document.getElementById('landing-background')
const landingContent = document.getElementById('landing-content')
const loader = document.getElementById('loader')
const wrapper = document.getElementById('wrapper')
let started = false
let timer = false

function resizeEvent() {
        if (!started) {
            if (screen.availWidth > 833) {
                landingImage.src = '/images/landing-page.jpg'
                landingContent.classList.remove('mobile-height')
                landingContent.classList.remove('medium-height')
                landingContent.classList.add('desktop-height')
            } else if (screen.availWidth <= 414) {
                landingImage.src = '/images/mobile-breakpoint.jpg'
                landingContent.classList.add('mobile-height')
                landingContent.classList.remove('medium-height')
                landingContent.classList.remove('desktop-height')
            } else if (
                screen.availWidth <= 833 &&
                screen.availWidth > 414
            ) {
                landingImage.src = '/images/medium-breakpoint.jpg'
                landingContent.classList.remove('mobile-height')
                landingContent.classList.add('medium-height')
                landingContent.classList.remove('desktop-height')
            } 
            started = true
        } else if (!timer) {
            timer = true
            setTimeout(() => {
                started = false
                timer = false
                if (screen.availWidth > 833) {
                    landingImage.src = '/images/landing-page.jpg'
                    landingContent.classList.remove('mobile-height')
                landingContent.classList.remove('medium-height')
                landingContent.classList.add('desktop-height')
                } else if (screen.availWidth <= 414) {
                    landingImage.src = '/images/mobile-breakpoint.jpg'
                    landingContent.classList.add('mobile-height')
                landingContent.classList.remove('medium-height')
                landingContent.classList.remove('desktop-height')
                } else if (
                    screen.availWidth <= 833 &&
                    screen.availWidth > 414
                ) {
                    landingImage.src = '/images/medium-breakpoint.jpg'
                    landingContent.classList.remove('mobile-height')
                landingContent.classList.add('medium-height')
                landingContent.classList.remove('desktop-height')
                } 
            }, 300)
        }      
}

function loading() {
    setTimeout(() => {
        loader.classList.add('hidden')
        wrapper.classList.remove('hidden')
    }, 2000)
}

window.addEventListener('load', resizeEvent)
window.addEventListener('resize', resizeEvent)
window.addEventListener('load', loading)