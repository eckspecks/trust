var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var set = new Set();

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

  //gets code from teacher, adds code to the set of codes     
  socket.on('message', function(msg){
    console.log('message: ' + msg);
    set.add(msg);
  });
    
    
      
});

io.on('connection', function(socket){
    
  //gets code from the player, compares it with code from teacher    
  socket.on('code', function(theCode){
     console.log('TheCode' + theCode);
    if(set.has(theCode)){
        //if code from player is found in the set, return success
        socket.emit('code',"success");
        console.log("success");
    }else{
        //if not, return failure
        socket.emit('code',"failure");
        console.log("failure");
    }
  });
});
