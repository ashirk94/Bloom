import { io } from 'https://cdn.socket.io/4.4.1/socket.io.esm.min.js'

//html elements
let messageContainer = document.getElementById('message-container')
const messageInput = document.getElementById('message-input')
const form = document.getElementById('chat-form')
const user = document.getElementById('user-name-input').value
const friendId = document.getElementById('friend-id-input').value
const friendSocket = document.getElementById('friend-socket-input').value
let times = document.querySelectorAll('.chat-time')

//creates div and appends with message
function displayMessage(message) {
    const date = new Date(message.time)
    const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

    const fDate = new Intl.DateTimeFormat('en-us', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: localTimeZone
    })
    const time = fDate.format(date)

	if (message.username.trim() === user.trim()) {
        //trying to change date by appending in order
		const heading = document.createElement('div')
		heading.classList.add('chat-heading')
        const timeDisplay = document.createElement('div')
        timeDisplay.innerHTML = `<div class='chat-time'>${time}</div>`
        const usernameDisplay = document.createElement('div')
        usernameDisplay.innerHTML = `<div>${message.username} (you)</div>`
        messageContainer.append(heading)
        heading.append(timeDisplay)
        heading.append(usernameDisplay)

        const msg = document.createElement('div')
		msg.innerHTML = `<div class='message'>${message.text}</div> `
		messageContainer.append(msg)
	} else {
		const heading = document.createElement('div')
        heading.classList.add('chat-heading-other')
		heading.innerHTML = `<div class='chat-time'>${time}</div>${message.username} (you)</div>`
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
	} //need set interval here? or activate when tabbed out

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

    times.forEach (time => {
        let date = new Date(time.innerHTML)
        const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    
        const fDate = new Intl.DateTimeFormat('en-us', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: localTimeZone
        })
        const newTime = fDate.format(date)
        time.innerHTML = newTime
    })

    await Notification.requestPermission()
})

export default socket
