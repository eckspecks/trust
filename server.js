'use strict';
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');
const app = express();
app.use(express.static('images'));

const server = http.createServer(app);
app.get("/", function(req, res)
{
    res.sendFile(__dirname + "/index.html");
});
app.get("/index.html", function(req, res)
{
    res.sendFile(__dirname + "/index.html");
});
app.get("/teacher.html", function(req, res)
{
    res.sendFile(__dirname + "/teacher.html");
});
app.get("/student.html", function(req, res)
{
    res.sendFile(__dirname + "/student.html");
});
server.listen(PORT, () => console.log(`Listening on ${ PORT }`));
const io = socketIO(server);
var array = [];
var roomnum = 0;
var players = [];
var moves = [];

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
        console.log("success! Room number:" + roomNumber + " Players Code:" + playersCode);
        
    }else{  
        //if not, return failure
        socket.emit('code',"failure");
    }
      
  });
    
 socket.on('nickname',function(theNickname){
     
     //sends the nickname of each player in the teacher's room to the teacher
     var nick = theNickname.split(",")[0];
     
     if(players[theNickname[theNickname.length-1]].includes(nick)){
         
        console.log("Error Nickname " + nick + " is already registered");
        io.to(theNickname[theNickname.length-1]).emit('nicknameError',"error" + " " + nick);
        return false;
         
     }
     console.log(theNickname);
     var roomNum = theNickname.split(",")[1];
     console.log("Success! " + nick +" is now registered in room" + roomNum);
     players[roomNum].push(nick);
     io.to(roomNum).emit('nickname',nick);
     io.to(roomNum).emit('nicknameError',"success" + " " +nick);
});
    
    
 socket.on('readyToPlay',function(gameCode){
     console.log(gameCode);
     var nick = gameCode.split(",")[2];
     var roomNumber = array.indexOf(gameCode.split(",")[1]);
     
     if(gameCode.split(",")[0]==="restart"){
        roomNumber = gameCode.split(",")[1];
        io.to(roomNumber).emit('readyToPlay',"restart," + nick);
        
     }else{
        //sends the nickname of each player in the teacher's room to the teacher
        io.to(roomNumber).emit('readyToPlay',"ready a");
        
        for (var i=array.length-1; i>=0; i--) {
            if (array[i] === gameCode.split(",")[1]) {
              array[i]+="~";
           }
        }
     }     
 
});    
          
socket.on('move',function(theMove){
    console.log("move: " +theMove);
    var roomNum = theMove.split(",")[1];
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
  var teachersCode = users.split(" ")[users.split(" ").length-1];   
  console.log(teachersCode);
  var roomNumber = array.indexOf(teachersCode);
  io.to(roomNumber).emit('numberOfUsers',users.substring(0, users.lastIndexOf(" ")));

  console.log("Users: " + users);
});
 
socket.on('score',function(score){  
  console.log("Score: " + score);
  var roomNum = score.split(",")[2];
    
  io.to(roomNum).emit('score',score.split(",")[0]+ "," + score.split(",")[1] + "," + score.split(",")[3]);
});
    
socket.on('chat message', function(msg){
  var roomNum = msg[msg.length - 1];
  msg = msg.substring(0, msg.length - 1);

  io.to(roomNum).emit('chat message', msg);
});  
socket.on('kicked',function(kick){
  
  var lastIndex = kick.lastIndexOf(" ");
  kick = kick.substr(0, lastIndex);
        
  var roomNumber = array.indexOf(kick.split(",")[0]);   

  var index = players[roomNumber].indexOf(kick.split(",")[1]);

  if(index>-1){
    players[roomNumber].splice(index,1);
  }  

  io.to(roomNumber).emit('youGotKicked', kick.split(",")[1]);
});
socket.on('options',function(e){
    var roomNum = array.indexOf(e.split(",")[2]);
    io.to(roomNum).emit('opt',e.split(",")[0]+","+e.split(",")[1]);
});
socket.on('restart',function(e){
    io.to(e).emit('gameDone',"gameDone");
});
socket.on('restartGame',function(e){
    var roomNum = array.indexOf(e+"~");
    moves[roomNum] = new Array(0);    
    console.log("restartGame! " + e + " " + roomNum + " f " + array);
    io.to(roomNum).emit('r',"reset");
    io.to(roomNum).emit('readyToPlay',"ready a");

});    
    
});
