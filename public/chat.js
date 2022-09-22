import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js"

//html elements
const messageContainer = document.getElementById('message-container')
const messageInput = document.getElementById('message-input')
const form = document.getElementById('form')
const roomInput = document.getElementById('room-input')
const joinRoomButton = document.getElementById('room-button')
let user = document.getElementById('user-input').value

//creates div and appends with message
function displayMessage(message) {
    const div = document.createElement('div')
    div.textContent = user + ': ' + message
    div.classList.add('message')
    messageContainer.append(div)
}

//local socket
const socket = io('http://localhost:3000')

socket.on('connect', () => {
    console.log(`You connected with id: ${socket.id}`)
})

//recieving messages
socket.on('receive-message', message => displayMessage(message))

//send a message
form.addEventListener('submit', e => {
    e.preventDefault()
    const message = messageInput.value
    const room = roomInput.value

    if (message === '') return
    displayMessage(message)
    socket.emit('send-message', message, room)
    messageInput.value = ''
})

joinRoomButton.addEventListener('click', () => {
    const room = roomInput.value
    socket.emit('join-room', room, message => {
        displayMessage(message)
    })
})


export default null