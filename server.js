var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
connections = []
server.listen(80);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/singleplayer', function (req, res) {
  res.sendFile(__dirname + '/singleplayer.html');
});

app.get('/multiplayer', function (req, res) {
  res.sendFile(__dirname + '/multiplayer.html');
});

turn = 0
colors = ["#fe8a71","#f6cd61"]
matrixnum = 
function getRandomArbitrary() {
  return Math.floor(Math.random() * (2));
}

io.on('connection', function (socket) {
  connections.push(socket)
  if(connections.length==2){
    connections[0].emit('send move',{"move":"begin","selfcolor":colors[0],"matrixnum":1}) 
    connections[1].emit('send move',{"move":"set","selfcolor":colors[1],"matrixnum":2}) 
  }
  console.log("Connected : %s sockets connected",connections.length)

  socket.on("disconnect",(data)=>{
    connections.splice(connections.indexOf(socket),1)
    console.log("Disconnected : %s sockets connected",connections.length)
  })
  
  socket.on("get moves",(data)=>{
    socket.broadcast.emit('send move',{"data":data[0],"move":true,"color":data[2],"matrixnum":data[1]})
  })
  
  socket.on("complete game",(data)=>{
    if(data==1){
      io.emit("game over message","Player 1 has won")
    }
    else{
      io.emit("game over message","Player 2 has won")
    }
    
  })

});