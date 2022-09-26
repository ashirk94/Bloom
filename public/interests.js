const swimBtn = document.getElementById('swim')
const codeBtn = document.getElementById('code')
const gameBtn = document.getElementById('game')
const artBtn = document.getElementById('art')
const baseballBtn = document.getElementById('baseball')
const form = document.getElementById('form')
const interestSubmit = document.getElementById('interest-submit')
const valueSubmit = document.getElementById('value-submit')

let interestData = document.querySelectorAll('.interest')
let interests = []
for (let interest of interestData) {
    if (interest.value != '') interests.push(interest.value)  
}

//need better values based on different lifestyles
let valueData = document.querySelectorAll('.value')
let values = []
for (let value of valueData) {
    if (value.value != '') values.push(value.value)  
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

form.addEventListener('submit', event => {
    event.preventDefault()
    valueSubmit.value = JSON.stringify(values)
    interestSubmit.value = JSON.stringify(interests)
    form.submit()
})