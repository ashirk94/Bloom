const famBtn = document.getElementById('family')
const advBtn = document.getElementById('adventure')
const ambBtn = document.getElementById('ambition')
const relBtn = document.getElementById('relax')
const fitBtn = document.getElementById('fitness')

//need better values based on different lifestyles
let valueData = document.querySelectorAll('.value')
let values = []
for (let value of valueData) {
    if (value.value != '') values.push(value.value)  
}

//button toggle logic

//family
let famBool = false

if (values.includes('Family')) {
    famBool = true
    famBtn.classList.add('active')
}

famBtn.addEventListener('click', () => {
    if (famBool) {
        let index = values.findIndex(value => value === 'Family')
        values.splice(index, 1)
        famBtn.classList.remove('active')
        famBool = false
        
    } else if (values.length < 5) {      
        famBtn.classList.add('active')
        values.push('Family')
        famBool = true
    }
})

//adventure
let advBool = false

if (values.includes('Adventure')) {
    advBool = true
    advBtn.classList.add('active')
}

advBtn.addEventListener('click', () => {
    if (advBool) {
        let index = values.findIndex(value => value === 'Adventure')
        values.splice(index, 1)
        advBtn.classList.remove('active')
        advBool = false
        
    } else if (values.length < 5) {      
        advBtn.classList.add('active')
        values.push('Adventure')
        advBool = true
    }
})

//ambition
let ambBool = false

if (values.includes('Ambition')) {
    ambBool = true
    ambBtn.classList.add('active')
}

ambBtn.addEventListener('click', () => {
    if (ambBool) {
        let index = values.findIndex(value => value === 'Ambition')
        values.splice(index, 1)
        ambBtn.classList.remove('active')
        ambBool = false
        
    } else if (values.length < 5) {      
        ambBtn.classList.add('active')
        values.push('Ambition')
        ambBool = true
    }
})

//relaxation
let relBool = false

if (values.includes('Relaxation')) {
    relBool = true
    relBtn.classList.add('active')
}

relBtn.addEventListener('click', () => {
    if (relBool) {
        let index = values.findIndex(value => value === 'Relaxation')
        values.splice(index, 1)
        relBtn.classList.remove('active')
        relBool = false
        
    } else if (values.length < 5) {      
        relBtn.classList.add('active')
        values.push('Relaxation')
        relBool = true
    }
})

//fitness
let fitBool = false

if (values.includes('Fitness')) {
    fitBool = true
    fitBtn.classList.add('active')
}

fitBtn.addEventListener('click', () => {
    if (fitBool) {
        let index = values.findIndex(value => value === 'Fitness')
        values.splice(index, 1)
        fitBtn.classList.remove('active')
        fitBool = false
        
    } else if (values.length < 5) {      
        fitBtn.classList.add('active')
        values.push('Fitness')
        fitBool = true
    }
})