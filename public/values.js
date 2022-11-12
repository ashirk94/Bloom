const form = document.getElementById('form')
//new values
const value1Submit = document.getElementById('value-submit1')
const value2Submit = document.getElementById('value-submit2')
const value3Submit = document.getElementById('value-submit3')
const value4Submit = document.getElementById('value-submit4')
const value5Submit = document.getElementById('value-submit5')

const value1Container = document.getElementById('value1-container')
const value2Container = document.getElementById('value2-container')
const value3Container = document.getElementById('value3-container')
const value4Container = document.getElementById('value4-container')
const value5Container = document.getElementById('value5-container')

const error = document.getElementById('error')
const resetBtn = document.getElementById('reset')

resetBtn.addEventListener('click', () => {
	window.location.reload()
})

const draggables = document.getElementById('value-group')

const drake = dragula(
	[
		draggables,
		value1Container,
		value2Container,
		value3Container,
		value4Container,
		value5Container
	],
	{
		isContainer: function (el) {
			return false // only elements in drake.containers will be taken into account
		},
		moves: function (el, source, handle, sibling) {
			return true // elements are always draggable by default
		},
		accepts: function (el, target, source, sibling) {
			return true // elements can be dropped in any of the `containers` by default
		},
		invalid: function (el, handle) {
			return false // don't prevent any drags from initiating by default
		},
		direction: 'horizontal',
		copy: false, // elements are moved by default, not copied
		copySortSource: false, // elements in copy-source containers can be reordered
		revertOnSpill: true,
		removeOnSpill: false, // spilling will `.remove` the element, if this is true
		mirrorContainer: document.body, // set the element that gets mirror elements appended
		ignoreInputTextSelection: true, // allows users to select input text, see details below
		slideFactorX: 0, // allows users to select the amount of movement on the X axis before it is considered a drag instead of a click
		slideFactorY: 0 // allows users to select the amount of movement on the Y axis before it is considered a drag instead of a click
	}
)
drake.on('drag', function (el) {
	el.className = el.className.replace('ex-moved', '')
})
drake.on('drop', function (el, target) {
	//one item per box
	if (target.children.length > 1 && target.id !== 'value-group') drake.cancel()
	el.className += ' ex-moved'
})
drake.on('over', function (el, container) {
	container.className += ' ex-over'
})
drake.on('out', function (el, container) {
	container.className = container.className.replace('ex-over', '')
})

function applyValues() {
    if (document.getElementById('value1-container').firstElementChild) {
        value1Submit.value =
		document.getElementById('value1-container').firstElementChild
			.textContent
    }
    if (document.getElementById('value2-container').firstElementChild) {
        value2Submit.value = document.getElementById('value2-container').firstElementChild
        .textContent
    }
    if(document.getElementById('value3-container').firstElementChild) {
        value3Submit.value = document.getElementById('value3-container').firstElementChild
        .textContent
    }
	if (document.getElementById('value4-container').firstElementChild) {
        value4Submit.value = document.getElementById('value4-container').firstElementChild
        .textContent
    }
	if (document.getElementById('value5-container').firstElementChild) {
        value5Submit.value = document.getElementById('value5-container').firstElementChild
        .textContent
    }	
}

//submit data
form.addEventListener('submit', (e) => {
	e.preventDefault()
	applyValues()
	if (value1Submit.value === '') {
		error.textContent = 'Please add a #1 value'
	} else {
		form.submit()
	}
})