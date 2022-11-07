const form = document.getElementById('form')
//new interests
const interest1Submit = document.getElementById('interest-submit1')
const interest2Submit = document.getElementById('interest-submit2')
const interest3Submit = document.getElementById('interest-submit3')
const interest4Submit = document.getElementById('interest-submit4')
const interest5Submit = document.getElementById('interest-submit5')

const resetBtn = document.getElementById('reset')

//prior interests
let interest1 = document.getElementById('interest1').value || ''
let interest2 = document.getElementById('interest2').value || ''
let interest3 = document.getElementById('interest3').value || ''
let interest4 = document.getElementById('interest4').value || ''
let interest5 = document.getElementById('interest5').value || ''

resetBtn.addEventListener('click', () => {
    window.location.reload()
})
//emojis/icons?


const draggables = document.querySelectorAll('.draggable')
const interestGroup = document.getElementById('interest-group')

const interest1Container = document.getElementById('interest1-container')
const interest2Container = document.getElementById('interest2-container')
const interest3Container = document.getElementById('interest3-container')
const interest4Container = document.getElementById('interest4-container')
const interest5Container = document.getElementById('interest5-container')

//add reset button - window.reload()

draggables.forEach((draggable) => {
	draggable.addEventListener('dragstart', () => {
		draggable.classList.add('dragging')
	})
	draggable.addEventListener('dragend', () => {
		draggable.classList.remove('dragging')
	})
})

//swap out interests
interest1Container.addEventListener('dragenter', (e) => {
	e.preventDefault()
	const draggable = document.querySelector('.dragging')
	if (!draggable) return

	const container = interest1Container.firstElementChild
    container.classList.add('dragover')

	if (!container.classList.contains('drop')) {
		//respawn element at top
        const newElem = container.cloneNode(true)
		interestGroup.appendChild(newElem)
        newElem.addEventListener('dragstart', () => {
            draggable.classList.add('dragging')
        })
        newElem.addEventListener('dragend', () => {
            draggable.classList.remove('dragging')
        })  
	} 
    container.remove()


	//swap in container
	interest1Container.appendChild(draggable)
    interest1 = draggable.textContent

	draggable.classList.remove('dragging')
    draggable.classList.remove('draggable')
    draggable.classList.add('locked')
    draggable.setAttribute('draggable', false)
    const copy = interest1Container.cloneNode(true)
    interest1Container.replaceWith(copy)
})

interest2Container.addEventListener('dragenter', (e) => {
	e.preventDefault()
	const draggable = document.querySelector('.dragging')
	if (!draggable) return

	const container = interest2Container.firstElementChild
    container.classList.add('dragover')

	if (!container.classList.contains('drop')) {
		//respawn element at top
        const newElem = container.cloneNode(true)
		interestGroup.appendChild(newElem)  
        newElem.addEventListener('dragstart', () => {
            draggable.classList.add('dragging')
        })
        newElem.addEventListener('dragend', () => {
            draggable.classList.remove('dragging')
        })  
	} 
    container.remove()


	//swap in container
	interest2Container.appendChild(draggable)
    interest2 = draggable.textContent

	draggable.classList.remove('dragging')
    draggable.classList.remove('draggable')
    draggable.classList.add('locked')
    draggable.setAttribute('draggable', false)
    const copy = interest2Container.cloneNode(true)
    interest2Container.replaceWith(copy)
})

interest3Container.addEventListener('dragenter', (e) => {
	e.preventDefault()
	const draggable = document.querySelector('.dragging')
	if (!draggable) return

	const container = interest3Container.firstElementChild
    container.classList.add('dragover')

	if (!container.classList.contains('drop')) {
		//respawn element at top
        const newElem = container.cloneNode(true)
		interestGroup.appendChild(newElem)  
	} 
    container.remove()


	//swap in container
	interest3Container.appendChild(draggable)
    interest3 = draggable.textContent

	draggable.classList.remove('dragging')
    draggable.classList.remove('draggable')
    draggable.classList.add('locked')
    draggable.setAttribute('draggable', false)
    const copy = interest3Container.cloneNode(true)
    interest3Container.replaceWith(copy)
})

interest4Container.addEventListener('dragenter', (e) => {
	e.preventDefault()
	const draggable = document.querySelector('.dragging')
	if (!draggable) return

	const container = interest4Container.firstElementChild
    container.classList.add('dragover')

	if (!container.classList.contains('drop')) {
		//respawn element at top
        const newElem = container.cloneNode(true)
		interestGroup.appendChild(newElem)  
	} 
    container.remove()


	//swap in container
	interest4Container.appendChild(draggable)
    interest4 = draggable.textContent

	draggable.classList.remove('dragging')
    draggable.classList.remove('draggable')
    draggable.classList.add('locked')
    draggable.setAttribute('draggable', false)
    const copy = interest4Container.cloneNode(true)
    interest4Container.replaceWith(copy)
})

interest5Container.addEventListener('dragenter', (e) => {
	e.preventDefault()
	const draggable = document.querySelector('.dragging')
	if (!draggable) return

	const container = interest5Container.firstElementChild
    container.classList.add('dragover')

	if (!container.classList.contains('drop')) {
		//respawn element at top
        const newElem = container.cloneNode(true)
		interestGroup.appendChild(newElem)  
	} 
    container.remove()


	//swap in container
	interest5Container.appendChild(draggable)
    interest5 = draggable.textContent

	draggable.classList.remove('dragging')
    draggable.classList.remove('draggable')
    draggable.classList.add('locked')
    draggable.setAttribute('draggable', false)
    const copy = interest5Container.cloneNode(true)
    interest5Container.replaceWith(copy)
})

function applyInterests() {
    interest1Submit.value = interest1
    interest2Submit.value = interest2
    interest3Submit.value = interest3
    interest4Submit.value = interest4
    interest5Submit.value = interest5
}

//submit data
form.addEventListener('submit', event => {
    event.preventDefault()
    applyInterests()

    form.submit()
})