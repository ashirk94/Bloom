const landingImage = document.getElementById('landing-background')
const landingContent = document.getElementById('landing-content')
let started = false
let timer = false

function resizeEvent() {
        if (!started) {
            if (window.innerWidth > 833) {
                landingImage.src = '/images/landing-page.jpg'
                landingContent.classList.remove('mobile-height')
                landingContent.classList.remove('medium-height')
                landingContent.classList.add('desktop-height')
            } else if (window.innerWidth <= 414) {
                landingImage.src = '/images/mobile-breakpoint.jpg'
                landingContent.classList.add('mobile-height')
                landingContent.classList.remove('medium-height')
                landingContent.classList.remove('desktop-height')
            } else if (
                window.innerWidth <= 833 &&
                window.innerWidth > 414
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
                if (window.innerWidth > 833) {
                    landingImage.src = '/images/landing-page.jpg'
                    landingContent.classList.remove('mobile-height')
                landingContent.classList.remove('medium-height')
                landingContent.classList.add('desktop-height')
                } else if (window.innerWidth <= 414) {
                    landingImage.src = '/images/mobile-breakpoint.jpg'
                    landingContent.classList.add('mobile-height')
                landingContent.classList.remove('medium-height')
                landingContent.classList.remove('desktop-height')
                } else if (
                    window.innerWidth <= 833 &&
                    window.innerWidth > 414
                ) {
                    landingImage.src = '/images/medium-breakpoint.jpg'
                    landingContent.classList.remove('mobile-height')
                landingContent.classList.add('medium-height')
                landingContent.classList.remove('desktop-height')
                } 
            }, 300)
        }      
}
window.addEventListener('load', resizeEvent)
window.addEventListener('resize', resizeEvent)