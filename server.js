const express = require('express');
const path =  require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const adminNm = 'admin';


//set static folder
app.use(express.static(path.join(__dirname, 'public')));


//run when client connects
io.on('connection', socket => {

    socket.on('joinRoom', ({username, room}) =>{
        const user =  userJoin(socket.id, username, room);

        socket.join(user.room);


        socket.emit('message',formatMessage(adminNm, `Welcome ${user.username}!`, 'welcome'));

        socket.broadcast.to(user.room).emit('message', formatMessage(adminNm, `${user.username} has joined`,'join'));

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    

   

    socket.on('chatMsg', (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg, "message"));
    });

    socket.on('disconnect', () => {

        const user = userLeave(socket.id);

        if(user){
            io.to(user.room).emit(
                'message',
                formatMessage(adminNm, `${user.username} has left`, "left"));

                io.to(user.room).emit('roomUsers', {
                    room: user.room,
                    users: getRoomUsers(user.room)
                });
        }

        
    });
})


const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));   