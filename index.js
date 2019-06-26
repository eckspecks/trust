var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var set = new Set();
var codeSuccessful = "";
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
});
http.listen(3000, function(){
  console.log('listening on *:3000');
});
io.on('connection', function(socket){
  socket.on('message', function(msg){
    console.log('message: ' + msg);
    set.add(msg);
  });
    
    
      
});

io.on('connection', function(socket){
  socket.on('code', function(theCode){
     console.log('TheCode' + theCode);
    if(set.has(theCode)){
        socket.emit('code',"success");
        console.log("success");
    }else{
        socket.emit('code',"failure");
        console.log("failure");
    }
  });
});
