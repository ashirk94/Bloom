const swimBtn = document.getElementById('swim')
const codeBtn = document.getElementById('code')
const gameBtn = document.getElementById('game')
const artBtn = document.getElementById('art')
const baseballBtn = document.getElementById('baseball')

let interestData = document.querySelectorAll('.interest')
let interests = []
for (let interest of interestData) {
    interests.push(interest)
}

//need better values based on different lifestyles
let valueData = document.querySelectorAll('.value')
let values = []
for (let value of valueData) {
    values.push(value)
}

let swimBool = false

if (interests.find(interest => interest === 'Swimmming')) {
    swimBool = true
}

swimBtn.addEventListener('click', () => {
    if (swimBool) {
        let index = interests.findIndex(interest => interest === 'Swimmming')
        interests.splice(index, 1)
        swimBtn.classList.remove('active')
        swimBool = false
        
    } else if (interests.length < 5) {      
        swimBtn.classList.add('active')
        interests.push('Swimming')
        swimBool = true
    }
    console.log(interests)
})