const landingImage = document.getElementById('landing-background')
let started = false

function resizeEvent() {
        if (!started) {
            if (window.innerWidth * window.devicePixelRatio > 833) {
                landingImage.src = '/images/landing-page.jpg'
            } else if (
                window.innerWidth * window.devicePixelRatio <= 833 &&
                window.innerWidth * window.devicePixelRatio > 414
            ) {
                landingImage.src = '/images/medium-breakpoint.jpg'
            } else if (window.innerWidth * window.devicePixelRatio <= 414) {
                landingImage.src = '/images/mobile-breakpoint.jpg'
            }
            started = true
        }
        setTimeout(() => {
        started = false
        console.log('running')
    }, 500)
}
window.addEventListener('load', resizeEvent)
window.addEventListener('resize', resizeEvent)