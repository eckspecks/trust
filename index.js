var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var array = [];
var roomnum = 0;

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
        socket.join(roomnum);
        console.log("success " + roomnum);

        roomnum++;
        console.log('message: ' + msg);
        array.push(msg);
}); 
    
    
  //gets code from the player, compares it with code from teacher    
  socket.on('code', function(theCode){
      
    if(array.includes(theCode)){
        
        socket.join(array.indexOf(theCode));
        //if code from player is found in the set, return success
        socket.emit('code',"success " + array.indexOf(theCode));
        console.log("success! Room number:" + array.indexOf(theCode) + " " + theCode);
        
    }else{
        
        //if not, return failure
        socket.emit('code',"failure");
        console.log("failure");
        
    }
  });
    
 socket.on('nickname',function(theNickname){
     console.log('Nickname: ' + theNickname);
     io.to(theNickname[theNickname.length -1]).emit('nickname',theNickname.slice(0,-2));
});
});
