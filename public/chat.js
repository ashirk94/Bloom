import { io } from 'https://cdn.socket.io/4.4.1/socket.io.esm.min.js'

//html elements
let messageContainer = document.getElementById('message-container')
const messageInput = document.getElementById('message-input')
const form = document.getElementById('chat-form')
const user = document.getElementById('user-name-input').value
const friendId = document.getElementById('friend-id-input').value
const friendSocket = document.getElementById('friend-socket-input').value

//creates div and appends with message
function displayMessage(message) {
    console.log(message.time)
    let userTime = new Date(message.time)


	if (message.username.trim() === user.trim()) {
        let time = userTime.toLocaleString()

		const heading = document.createElement('div')
		heading.innerHTML = `<div class='chat-heading'>${time}<br>${message.username} (you)</div>`
		messageContainer.append(heading)

        const msg = document.createElement('div')
		msg.innerHTML = `<div class='message'>${message.text}</div> `
		messageContainer.append(msg)
	} else {
        // let date = convertUTCDateToLocalDate(new Date(message.time))
        // console.log(date)
        let time = message.time.toLocaleString()
        console.log(time)

		const heading = document.createElement('div')
		heading.innerHTML = `<div class='chat-heading-other'>${time}<br>${message.username} (you)</div>`
		messageContainer.append(heading)

        const msg = document.createElement('div')
		msg.innerHTML = `<div class='message-other'>${message.text}</div> `
		messageContainer.append(msg)
	}
}
//enables chatting on development and production
let socket

if (window.location.href.slice(0, 21) === 'http://localhost:3000') {
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

	// auto scroll feature
    window.scrollTo(0, messageContainer.scrollHeight - 580)
    
	if (document.hidden && message.username.trim() !== user.trim()) {
		document.title =
			'New message(s) from ' + message.username + ' ' + document.title
	}

	Notification.requestPermission().then((permission) => {
		if (permission === 'granted') {
			if (message.username.trim() !== user.trim()) {
				new Notification(message.username, {
					body: message.text,
                    icon: 'images/bloom-logo.png'
				})
			}
		}
	})
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

window.addEventListener('load', async () => {
    window.scrollTo(0, messageContainer.scrollHeight - 580)

    await Notification.requestPermission()
})

function convertUTCDateToLocalDate(date) {
    //console.log(date.getTimezoneOffset())
	var newDate = new Date(
		date.getTime() - 8 * 60 * 60 * 1000
	)
        //hard coded PST - need to change

	// var offset = date.getTimezoneOffset() / 60
	// var hours = date.getHours()

	// newDate.setHours(hours - offset)

	return newDate
}

export default socket
