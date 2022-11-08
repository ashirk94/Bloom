const draggables = document.querySelectorAll('.draggable')
const valueGroup = document.getElementById('value-group')
const form = document.getElementById('form')
//new values
const value1Container = document.getElementById('value1-container')
const value2Container = document.getElementById('value2-container')
const value3Container = document.getElementById('value3-container')
const value4Container = document.getElementById('value4-container')
const value5Container = document.getElementById('value5-container')

const resetBtn = document.getElementById('reset')

//prior values
let value1 = document.getElementById('value1').value || ''
let value2 = document.getElementById('value2').value || ''
let value3 = document.getElementById('value3').value || ''
let value4 = document.getElementById('value4').value || ''
let value5 = document.getElementById('value5').value || ''

resetBtn.addEventListener('click', () => {
    window.location.reload()
})
//emojis/icons?

draggables.forEach((draggable) => {
	draggable.addEventListener('dragstart', () => {
		draggable.classList.add('dragging')
	})
	draggable.addEventListener('dragend', () => {
		draggable.classList.remove('dragging')
	})
})

const dropContainers = document.getElementsByClassName('drop-container')
Array.from(dropContainers).forEach((dropContainer) => {
	dropContainer.addEventListener('dragenter', (e) => {
		e.preventDefault()
		const draggable = document.querySelector('.dragging')
		if (!draggable) {
			return
		}

		const valueName = dropContainer.getAttribute('id').split('-')[0]

		const container = dropContainer.firstElementChild
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
		dropContainer.appendChild(draggable)
		values[valueName] = draggable.textContent

		draggable.classList.remove('dragging')
		draggable.classList.remove('draggable')
		draggable.classList.add('locked')
		draggable.setAttribute('draggable', false)
		const copy = dropContainer.cloneNode(true)
		dropContainer.replaceWith(copy)
	})
})

function applyValues() {
    value1Submit.value = interest1
    value2Submit.value = interest2
    value3Submit.value = interest3
    value4Submit.value = interest4
    value5Submit.value = interest5
}

//submit data
form.addEventListener('submit', event => {
    event.preventDefault()
    applyValues()

    form.submit()
})