const io = require('socket.io')(3000, {
    cors: {
        origin: ['http://localhost:8080'],
    }
})

io.on('connection', socket => {
    socket.on('send-message', message => {
        socket.broadcast.emit('receive-message', message)
    })
})