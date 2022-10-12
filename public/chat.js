import { io } from 'https://cdn.socket.io/4.4.1/socket.io.esm.min.js'

//html elements
const messageContainer = document.getElementById('message-container')
const messageInput = document.getElementById('message-input')
const form = document.getElementById('form')
const roomInput = document.getElementById('room-input')
const joinRoomButton = document.getElementById('room-button')
let user = document.getElementById('user-input').value
const roomName = document.getElementById('room-name')

//creates div and appends with message
function displayMessage(message) {
	const div = document.createElement('div')
	div.textContent =
		message.time + '\n' + message.username + ': ' + message.text
	div.classList.add('message')
	messageContainer.append(div)
}

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
	ignoreQueryPrefix: true
})

const socket = io('http://localhost:3000')

// Join chatroom
socket.emit('join-room', { username, room })

// Message from server
socket.on('receive-message', (user, message) => {
	displayMessage(user.message)

	// Scroll down
	//chatMessages.scrollTop = chatMessages.scrollHeight;
})

// Message submit
form.addEventListener('submit', (e) => {
	e.preventDefault()

	// Get message text
	let msg = messageInput.value

	msg = msg.trim()

	if (!msg) {
		return false
	}

	// Emit message to server
	socket.emit('send-message', msg)
	// Clear input
	messageInput.value = ''
	messageInput.focus()
})

export default null
