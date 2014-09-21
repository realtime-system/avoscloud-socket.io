// Setup basic express server
// var path = require('path');
// var read = require('fs').readFileSync;
var express = require('express');
var app = express();

app.set('views','cloud/views');   // 设置模板目录
app.set('view engine', 'ejs');    // 设置 template 引擎
app.use(express.bodyParser());    // 读取请求 body 的中间件

// var clientSource = read(path.resolve('.', 'socket.io-client/socket.io.js'), 'utf-8');
// var clientSource1 = read('socket.io-client/socket.io.js', 'utf-8');
// var clientSource2 = read('node_modules/socket.io-client/socket.io.js', 'utf-8');
// var clientSource = read('/mnt/avos/data/uluru-cloud-code/repos/7aiwizqicba5sk4ez3xa54buczyjti1ypsqqelsboojdonl9/test_b/node_modules/socket.io/node_modules/socket.io-client/socket.io.js', 'utf-8');
//
// app.get('/socket.io/socket.io.js', function(req, res) {
//     var etag = req.headers['if-none-match'];
//     if (etag) {
//       if (clientVersion == etag) {
//         debug('serve client 304');
//         res.writeHead(304);
//         res.end();
//         return;
//       }
//     }
//
//     debug('serve client source');
//     res.setHeader('Content-Type', 'application/javascript');
//     res.setHeader('ETag', clientVersion);
//     res.writeHead(200);
//     res.end(clientSource);
// });

var server = require('http').createServer(app);
var io = require('socket.io')(server);
// var port = process.env.PORT || 3000;
var port = 80;

// Routing
// app.use(express.static(__dirname + '/public'));

// Chatroom

// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;

io.on('connection', function (socket) {
	console.log('new connection.');
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    // we store the username in the socket session for this client
    socket.username = username;
    // add the client's username to the global list
    usernames[username] = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    // remove the username from global usernames list
    if (addedUser) {
      delete usernames[socket.username];
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});
