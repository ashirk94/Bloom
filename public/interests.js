const form = document.getElementById('form')
const interestSubmit = document.getElementById('interest-submit')
const valueSubmit = document.getElementById('value-submit')
const resetBtn = document.getElementById('reset')

resetBtn.addEventListener('click', () => {
    window.location.reload()
})
//emojis/icons?

//on submit add interests to array
let interestData = document.querySelectorAll('.interest')
let interests = []
for (let interest of interestData) {
    if (interest.value != '') interests.push(interest.value)  
}

//submit data
form.addEventListener('submit', event => {
    event.preventDefault()
    valueSubmit.value = JSON.stringify(values)
    interestSubmit.value = JSON.stringify(interests)
    form.submit()
})

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

	draggable.classList.remove('dragging')
    draggable.classList.remove('draggable')
    draggable.classList.add('locked')
    draggable.setAttribute('draggable', false)
    const copy = interest5Container.cloneNode(true)
    interest5Container.replaceWith(copy)
})

