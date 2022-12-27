import { io } from 'https://cdn.socket.io/4.4.1/socket.io.esm.min.js'

//html elements
const messageContainer = document.getElementById('message-container')
const messageInput = document.getElementById('message-input')
const form = document.getElementById('chat-form')
const user = document.getElementById('user-name-input').value
const friendId = document.getElementById('friend-id-input').value
const friendSocket = document.getElementById('friend-socket-input').value

//creates div and appends with message
function displayMessage(message) {
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
//enables chatting on development and production
let socket

if (window.location.href.slice(0,21) === 'http://localhost:3000') {
    socket = io('http://localhost:3000', {
    withCredentials: true
  })
} else {
    socket = io('https://bloom-friend-finder.herokuapp.com', {
        withCredentials: true
      })
}


// message from server
socket.on('receive-message', ({ message }) => {
	displayMessage(message)
	// auto scroll feature?
})

//message submit
form.addEventListener('submit', (e) => {
	e.preventDefault()

	//get message text
	let msg = messageInput.value
	msg = msg.trim()

	if (!msg) {
		return
	}

	//emit message to server
	socket.emit('send-message', {
		message: msg,
		to: friendSocket,
		sender: user,
        friendId: friendId
	})
	//clear input
	messageInput.value = ''
	messageInput.focus()
})

export default socket