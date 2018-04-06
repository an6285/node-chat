var path=require('path');
var http=require('http');
var express=require('express');
var socketIO=require('socket.io');


var {isRealString} = require('./utils/validation');
var {generateMessage,generateLocationMessage,generateTypingMessage} = require('./utils/message');
var {Users} = require('./utils/users');
var publicpath=path.join(__dirname,'../public');
var port=process.env.PORT||3000;
var app=express();
var server=http.createServer(app);
var io=socketIO(server);
var users=new Users();

app.use(express.static(publicpath));

io.on('connection', (socket) => {
  console.log('New user connected');

  socket.on('join',(params,callback) => {
    if (!isRealString(params.name) || !isRealString(params.room))
    {
      return callback('Name and room name are required');
    }

    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);

    io.to(params.room).emit('updateUserList',users.getUserList(params.room));

    socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined`));
    callback();
  });

  socket.on('createMessage', (message,callback) => {
    var user=users.getUser(socket.id);

    if (user && isRealString(message.text)) {
      io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
    }
    callback();
  });

  socket.on('typing',()=>{

    var user=users.getUser(socket.id);

    if(user) {
      socket.broadcast.to(user.room).emit('newTypingMessage',generateTypingMessage(user.name));
    }

  });

  socket.on('createLocationMessage',(coords) => {
    var user=users.getUser(socket.id);
    if(user) {
      io.to(user.room).emit('newLocationMessage',generateLocationMessage(user.name,coords.latitude,coords.longitude));
    }

  });
  socket.on('disconnect', () => {
    var user = users.removeUser(socket.id);
    if(user) {
      io.to(user.room).emit('updateUserList',users.getUserList(user.room));
      io.to(user.room).emit('newMessage',generateMessage('Admin',`${user.name} has left`));
    }
    console.log('User was disconnected');
  });
});



server.listen(port,()=>{
  console.log('Server started successfully on Port '+port);
});
