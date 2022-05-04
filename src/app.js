const http = require('http');
const path = require('path');
const express = require('express');
const socketio = require('socket.io');

const { Usercreate, Userdelete, ReturnUser, ReturnUsersInRoom, messageTemplate,fileMessageTemplate ,locationMessageTemplate } = require('./functions.js');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
    console.log('Websocket is connected');

    
    socket.on('join', ({ username, room }, callback) => {
        let u = username;
        let r = room;
        const { error, user } = Usercreate({ id:socket.id, u, r });
        let x = user;
        if(error) {
            return callback(error);
        }

        socket.join(x.room);
        socket.emit('message-deliver', messageTemplate('system', 'Welcome'));
        socket.to(user.room).broadcast.emit('message-deliver', messageTemplate('system', `${x.username} joined the room!`));
        io.to(x.room).emit('rd', {
            room: x.room,
            users: ReturnUsersInRoom(x.room)
        })
        callback();
    });

    socket.on('disconnect', () => {
        const x =  Userdelete(socket.id);

        if(x) {
            io.to(x.room).emit('message-deliver' , messageTemplate('system', `${x.username} left!`));
            io.to(x.room).emit('rd', {
            room: x.room,
            users: ReturnUsersInRoom(x.room)
        })
        }
    });
    
    socket.on('sm', (message, callback) => {
        const x = ReturnUser(socket.id);
        io.to(x.room).emit('message-deliver', messageTemplate(x.username, message));
        callback();
    });


    socket.on('file', (data)=>{
        const x = ReturnUser(socket.id);
        io.to(x.room).emit('file', fileMessageTemplate(x.username, data.buffer, data.filename));
    })

    socket.on('sl', (p, callback) => {
        const x = ReturnUser(socket.id);
        io.to(x.room).emit('loc', locationMessageTemplate(x.username, `https://google.com/maps?q=${p.latitude},${p.longitude}`));
        callback();
    });



});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});  
