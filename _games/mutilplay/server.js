var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
 
app.use(express.static(__dirname + '/public'));
 
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

// 玩家
var players = {}


io.on('connection', function (socket) {
  console.log('一个用户连接...');	
	
  players[socket.id] = {
	  rotation: 0,
	  x: Math.floor(Math.random() * 700) + 50,
	  y: Math.floor(Math.random() * 500) + 50,
	  playerId:socket.id,
	  team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue'
  }
  // send all player
  socket.emit('currentPlayers',players)
  // send one new player	
  socket.broadcast.emit('newPlayer',players[socket.id])
  
  socket.on('playerMovement', function (movementData) {
	  players[socket.id].x = movementData.x;
	  players[socket.id].y = movementData.y;
	  players[socket.id].rotation = movementData.rotation;
	  socket.broadcast.emit('playerMoved', players[socket.id]);
  });

  socket.on('disconnect', function () {
    console.log('一个用户离开');
	delete players[socket.id]
	// tell other players to remove this player
	io.emit('disconnect',socket.id)
  });
});
 
server.listen(8081, function () {
  console.log(`Listening on ${server.address().port}`);
});