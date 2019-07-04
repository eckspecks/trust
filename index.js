const express = require('express');
const app = express();
app.use(express.static('images'));

const port = 3000;
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var array = [];
var roomnum = 0;
var players = [];
var moves = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/teacher.html', function(req, res){
  res.sendFile(__dirname + '/teacher.html');
});
app.get('/student.html', function(req, res){
  res.sendFile(__dirname + '/student.html');
});
app.get('/game.html', function(req, res){
  res.sendFile(__dirname + '/game.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});


io.on('connection', function(socket){
    
    console.log('a user connected');
    
    socket.on('message', function(msg){
        //teacher creates a new roomNumber
        socket.join(roomnum);
        players.push(new Array(0));
        moves.push(new Array(0));
        roomnum++;
        
        //adds the room code to array
        array.push(msg);
}); 
    
    
  //gets code from the player, compares it with code from teacher    
  socket.on('code', function(playersCode){
      
    if(array.includes(playersCode) && playersCode!==""){
        
        //gets the room number the player is in based on index of the code player inputted
        var roomNumber = array.indexOf(playersCode);
        socket.join(roomNumber);
        //if code from player is found in the set, return success
        socket.emit('code',"success " + roomNumber);
        console.log("success! Room number:" + roomNumber + " " + playersCode);
        
    }else{
        
        //if not, return failure
        socket.emit('code',"failure");
        
    }
  });
    
 socket.on('nickname',function(theNickname){
     
     
     //sends the nickname of each player in the teacher's room to the teacher
     var nick = theNickname.slice(0,-2);
     players[theNickname[theNickname.length-1]].push(nick);
     io.to(theNickname[theNickname.length -1]).emit('nickname',nick);
});
    
    
 socket.on('readyToPlay',function(gameCode){
     
     
     
     var nick = gameCode.split(" ")[2];
     var roomNumber = array.indexOf(gameCode.split(" ")[1]);

     if(gameCode.split(" ")[0]==="restart"){
        roomNumber = gameCode.split(" ")[1];
        io.to(roomNumber).emit('readyToPlay',"restart " + nick);
 
     }else{
        //sends the nickname of each player in the teacher's room to the teacher
        io.to(roomNumber).emit('readyToPlay',"ready");
        
        for (var i=array.length-1; i>=0; i--) {
            if (array[i] === gameCode.split(" ")[1]) {
               array[1]= "";
            }
        }
     }     
 
});    
          
socket.on('move',function(theMove){
    console.log("move: " +theMove);
    var roomNum = theMove.split(" ")[1];
    moves[roomNum].push(theMove);
}); 
    
    
socket.on('updateBoard',function(update){
    
    var roomNum = update.split(" ")[1];
    
    if(update.split(" ")[0]==="reset"){
        //resets the moves array
        moves[roomNum] = new Array(0);    
    }else{
        
        for(var i =0;i<moves[roomNum].length;i++){
            io.to(roomNum).emit('updateBoard',moves[roomNum][i]);
        }
        
    }
});
socket.on('numberOfUsers',function(users){
  var roomNumber = array.indexOf(users.split(" ")[1]);
  io.to(roomNumber).emit('numberOfUsers',users.split(" ")[0]);
 console.log(users);
});
 
socket.on('score',function(score){  
  console.log("Score: " + score);
  var roomNum = score.split(" ")[2];
  io.to(roomNum).emit('score',score.split(" ")[0]+ " " + score.split(" ")[1]);
});
    

});