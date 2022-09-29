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
//button toggle logic

//swimming
let swimBool = false

if (interests.includes('Swimming')) {
    swimBool = true
    swimBtn.classList.add('active')
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
})
//baseball
let baseballBool = false

if (interests.includes('Baseball')) {
    baseballBool = true
    baseballBtn.classList.add('active')
}

baseballBtn.addEventListener('click', () => {
    if (swimBool) {
        let index = interests.findIndex(interest => interest === 'Baseball')
        interests.splice(index, 1)
        baseballBtn.classList.remove('active')
        baseballBool = false
        
    } else if (interests.length < 5) {      
        baseballBtn.classList.add('active')
        interests.push('Baseball')
        baseballBool = true
    }
})
//gaming
let gameBool = false

if (interests.includes('Gaming')) {
    gameBool = true
    gameBtn.classList.add('active')
}

gameBtn.addEventListener('click', () => {
    if (gameBool) {
        let index = interests.findIndex(interest => interest === 'Gaming')
        interests.splice(index, 1)
        gameBtn.classList.remove('active')
        gameBool = false
        
    } else if (interests.length < 5) {      
        gameBtn.classList.add('active')
        interests.push('Gaming')
        gameBool = true
    }
})
//coding
let codeBool = false

if (interests.includes('Coding')) {
    codeBool = true
    codeBtn.classList.add('active')
}

codeBtn.addEventListener('click', () => {
    if (codeBool) {
        let index = interests.findIndex(interest => interest === 'Coding')
        interests.splice(index, 1)
        codeBtn.classList.remove('active')
        codeBool = false
        
    } else if (interests.length < 5) {      
        codeBtn.classList.add('active')
        interests.push('Coding')
        codeBool = true
    }
})
//art
let artBool = false

if (interests.includes('Art')) {
    artBool = true
    artBtn.classList.add('active')
}

artBtn.addEventListener('click', () => {
    if (artBool) {
        let index = interests.findIndex(interest => interest === 'Art')
        interests.splice(index, 1)
        artBtn.classList.remove('active')
        artBool = false
        
    } else if (interests.length < 5) {      
        artBtn.classList.add('active')
        interests.push('Art')
        cartBool = true
    }
})
//submit data
form.addEventListener('submit', event => {
    event.preventDefault()
    valueSubmit.value = JSON.stringify(values)
    interestSubmit.value = JSON.stringify(interests)
    form.submit()
})