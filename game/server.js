var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var os = require('os');
var bodyParser = require('body-parser')
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
  extended: true
})); 
var ifaces = os.networkInterfaces();
var connectedTo = null
var guestName = null
var ownerName = null
connections = []
server.listen(17141,'0.0.0.0');
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/singleplayer', function (req, res) {
  res.sendFile(__dirname + '/singleplayer.html');
});

app.get('/multiplayer', function (req, res) {
  res.sendFile(__dirname + '/multiplayer.html');
});

app.get("/getnames",function(req,res){
  console.log(ownerName+"-"+guestName)
  res.send(ownerName+"-"+guestName)
})

app.post("/connectedip",function(req,res){
  if(Object.keys(req.body).length!=0){
    ownerName = req.body["name"]
  }
  res.send(connectedTo)
})

app.get('/guest', function (req, res) {
  connectedTo = req.query["connectedTo"]
  guestName = req.query["guest"]
  res.send().status(200)
});

app.post('/getip', function (req, res) {
  'use strict';

  Object.keys(ifaces).forEach(function (ifname) {
    var alias = 0;

    ifaces[ifname].forEach(function (iface) {
      if ('IPv4' !== iface.family || iface.internal !== false) {
        return;
      }

      if (alias >= 1) {
        console.log(ifname + ':' + alias, iface.address);
      } else {
        res.send(iface.address);
      }
      ++alias;
    });
  });

});

turn = 0
colors = ["#fe8a71","#f6cd61"]
socket1 = null
socket2 = null
io.on('connection', function (socket) {
    if(socket1==null){
      socket1 = socket
      console.log("here1")
    }
    else if(socket2==null){
      socket2 = socket
      console.log("here2")
    }
    if(socket1!=null && socket2!=null){
      socket1.emit('send move',{"move":"begin","selfcolor":colors[0],"matrixnum":1}) 
      socket2.emit('send move',{"move":"set","selfcolor":colors[1],"matrixnum":2})
    }
    
  socket.on("disconnect",(data)=>{
    if(socket1==socket){
      socket1=null
    }
    else if(socket2==socket){
      socket2=null
    }
    console.log("connected : sockets connected")
  })
  
  socket.on("get moves",(data)=>{
    socket.broadcast.emit('send move',{"data":data[0],"move":true,"color":data[2],"matrixnum":data[1]})
  })
  
  socket.on("complete game",(data)=>{
    if(data==1){
      io.emit("game over message", ownerName+" has won")
    }
    else{
      io.emit("game over message",guestName+" has won")
    }
    
  })

});