import { io } from 'https://cdn.socket.io/4.4.1/socket.io.esm.min.js'

//html elements
const messageContainer = document.getElementById('message-container')
const messageInput = document.getElementById('message-input')
const form = document.getElementById('form')
const user = document.getElementById('user-name-input').value
const userId = document.getElementById('user-id-input').value
const friendName = document.getElementById('friend-name-input').value
const friendId = document.getElementById('friend-id-input').value


//creates div and appends with message
function displayMessage(message) {
    console.log('hi')
	if (message.username.trim() === user.trim()) {
		const div = document.createElement('div')
		div.innerHTML = `<div class='chat-heading'>${message.time}<br>${message.username} (you)</div> ${message.text}`
		div.classList.add('message')
		messageContainer.append(div)
	} else {
		const div = document.createElement('div')
		div.innerHTML = `<div class='chat-heading-other'>${message.time}<br>${message.username}</div> ${message.text}`
		div.classList.add('message')
		messageContainer.append(div)
	}
}

//can now pass username through router by req param id
//the socket io PM tutorial now should work

const socket = io('http://localhost:3000') //with credentials?

// Message from server
socket.on('receive-message', ({user, message}) => {
    console.log('hello')
    console.log(user)
    console.log(message)
	displayMessage(message)

	// Scroll down
	//chatMessages.scrollTop = chatMessages.scrollHeight;
})
socket.on("connect", () => {
    console.log(socket.id)
  })

socket.onAny((event, ...args) => {
	console.log(event, args)
    //console.log(socket.handshake.session)
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
	socket.emit('send-message', {
        message: msg,
        to: friendId,
        sender: user
    })
	// Clear input
	messageInput.value = ''
	messageInput.focus()
})

export default socket
