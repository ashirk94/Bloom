import {io} from 'socket.io-client'

//html elements
const messageContainer = document.getElementById('message-container')
const messageInput = document.getElementById('message-input')
const form = document.getElementById('form')

//creates div and appends with message
function displayMessage(message) {
    const div = document.createElement('div')
    div.textContent = message
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
    //const room = roomInput.value

    if (message === '') return
    displayMessage(message)
    socket.emit('send-message', message)
    messageInput.value = ''
})


export default null