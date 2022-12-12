const landingImage = document.getElementById('landing-background')
let started = false
let timer = false

function resizeEvent() {
        if (!started) {
            if (window.innerWidth * window.devicePixelRatio > 833) {
                landingImage.src = '/images/landing-page.jpg'
            } else if (window.innerWidth * window.devicePixelRatio <= 414) {
                landingImage.src = '/images/mobile-breakpoint.jpg'
            } else if (
                window.innerWidth * window.devicePixelRatio <= 833 &&
                window.innerWidth * window.devicePixelRatio > 414
            ) {
                landingImage.src = '/images/medium-breakpoint.jpg'
            } 
            started = true
        } else if (!timer) {
            timer = true
            setTimeout(() => {
                started = false
                timer = false
                if (window.innerWidth * window.devicePixelRatio > 833) {
                    landingImage.src = '/images/landing-page.jpg'
                } else if (window.innerWidth * window.devicePixelRatio <= 414) {
                    landingImage.src = '/images/mobile-breakpoint.jpg'
                } else if (
                    window.innerWidth * window.devicePixelRatio <= 833 &&
                    window.innerWidth * window.devicePixelRatio > 414
                ) {
                    landingImage.src = '/images/medium-breakpoint.jpg'
                } 
            }, 300)
        }      
}
window.addEventListener('load', resizeEvent)
window.addEventListener('resize', resizeEvent)