import {io} from 'socket.io-client'

const test = document.getElementById('test')

function displayMessage(message) {
    test.innerHTML = message
}

const socket = io('http://localhost:3000')

socket.on('connect', () => {
    displayMessage(`You connected with id: ${socket.id}`)
    console.log(socket.id)
})



export default null