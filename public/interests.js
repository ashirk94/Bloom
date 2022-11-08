const form = document.getElementById('form')
//new interests
const interest1Submit = document.getElementById('interest-submit1')
const interest2Submit = document.getElementById('interest-submit2')
const interest3Submit = document.getElementById('interest-submit3')
const interest4Submit = document.getElementById('interest-submit4')
const interest5Submit = document.getElementById('interest-submit5')

const resetBtn = document.getElementById('reset')

resetBtn.addEventListener('click', () => {
	window.location.reload()
})
//emojis/icons?
//once item is place, immediately replaces since it's on a drop zone

const draggables = document.querySelectorAll('.draggable')
const interestGroup = document.getElementById('interest-group')

const interest1Container = document.getElementById('interest1-container')
const interest2Container = document.getElementById('interest2-container')
const interest3Container = document.getElementById('interest3-container')
const interest4Container = document.getElementById('interest4-container')
const interest5Container = document.getElementById('interest5-container')

draggables.forEach((draggable) => {
	draggable.addEventListener('dragstart', () => {
		draggable.classList.add('dragging')
	})
	draggable.addEventListener('dragend', () => {
		draggable.classList.remove('dragging')
	})
})

//put prior interest obj in zone?
const interests = {
	interest1: document.getElementById('interest1').value || null,
	interest2: document.getElementById('interest2').value || null,
	interest3: document.getElementById('interest3').value || null,
	interest4: document.getElementById('interest4').value || null,
	interest5: document.getElementById('interest5').value || null
}

//swap out interests
const dropContainers = document.getElementsByClassName('drop-container')
Array.from(dropContainers).forEach((dropContainer) => {
	dropContainer.addEventListener('dragenter', (e) => {
		e.preventDefault()
		const draggable = document.querySelector('.dragging')
		if (!draggable) {
			return
		}

		const interestName = dropContainer.getAttribute('id').split('-')[0]

		const container = dropContainer.firstElementChild

		
        if (!draggable.classList.contains('on-target')) {
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
            interests[interestName] = draggable.textContent
    
            draggable.classList.remove('dragging')
            draggable.classList.add('on-target')
        }

	})
    dropContainer.addEventListener('dragleave', (e) => {
        e.preventDefault()
		const draggable = document.querySelector('.dragging')
		if (!draggable) {
			return
		}
        draggable.classList.remove('on-target')
    })
})

function applyInterests() {
	interest1Submit.value = interests.interest1
	interest2Submit.value = interests.interest2
	interest3Submit.value = interests.interest3
	interest4Submit.value = interests.interest4
	interest5Submit.value = interests.interest5
}

//submit data
form.addEventListener('submit', (event) => {
	event.preventDefault()
	applyInterests()

	form.submit()
})
