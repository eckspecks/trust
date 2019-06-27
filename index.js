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
        //teacher creates a new roomNumber
        socket.join(roomnum);
        console.log("success " + roomnum);
        
        roomnum++;
        console.log('message: ' + msg);
        
        //adds the room code to array
        array.push(msg);
}); 
    
    
  //gets code from the player, compares it with code from teacher    
  socket.on('code', function(playersCode){
      
    if(array.includes(playersCode)){
        
        //gets the room number the player is in based on index of the code player inputted
        var roomNumber = array.indexOf(playersCode);
        socket.join(roomNumber);
        //if code from player is found in the set, return success
        socket.emit('code',"success " + roomNumber);
        console.log("success! Room number:" + roomNumber + " " + playersCode);
        
    }else{
        
        //if not, return failure
        socket.emit('code',"failure");
        console.log("failure");
        
    }
  });
    
 socket.on('nickname',function(theNickname){
     
     console.log('Nickname: ' + theNickname);
     
     //sends the nickname of each player in the teacher's room to the teacher
     io.to(theNickname[theNickname.length -1]).emit('nickname',theNickname.slice(0,-2));
});
    
    
 socket.on('readyToPlay',function(gameCode){
     
     var roomNumber = array.indexOf(gameCode.split(" ")[1]);

     //sends the nickname of each player in the teacher's room to the teacher
     io.to(roomNumber).emit('readyToPlay',"play");
});    
    
});