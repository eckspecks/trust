var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var set = new Set();

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
app.get('/teacher.html', function(req, res){
  res.sendFile(__dirname + '/teacher.html');
});
app.get('/student.html', function(req, res){
  res.sendFile(__dirname + '/student.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});


io.on('connection', function(socket){
    
    console.log('a user connected');
    
    socket.on('message', function(msg){
        
        console.log('message: ' + msg);
        set.add(msg);
}); 
    
    
  //gets code from the player, compares it with code from teacher    
  socket.on('code', function(theCode){
      
     console.log('Code: ' + theCode);
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
    
 socket.on('nickname',function(theNickname){
     console.log('Nickname: ' + theNickname);
     socket.broadcast.emit('nickname',theNickname);
});
});
