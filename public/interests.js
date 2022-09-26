const swimBtn = document.getElementById('swim')
const codeBtn = document.getElementById('code')
const gameBtn = document.getElementById('game')
const artBtn = document.getElementById('art')
const baseballBtn = document.getElementById('baseball')

let interests = document.querySelectorAll('.interest')

let swimBool = false

if (interests.find('swim')) {
    swimBool = true
}

swimBtn.addEventListener('click', () => {
    if (swimBool) {
        swimBool = false
        swimBtn.classList.remove('active')
    } else if (interests.length > 4) {
        swimBool = true
        swimBtn.classList.add('active')
    }
})