'use strict';
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');
const app = express();
app.use(express.static('images'));
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
app.get("/", function(req, res)
{
    res.sendFile(__dirname + "/index.html");
});
app.get("/a.html", function(req, res)
{
    res.sendFile(__dirname + "/a.html");
});
app.get("/styles.css", function(req, res)
{
    res.sendFile(__dirname + "/styles.css");
});
app.get("/js/student.js", function(req, res)
{
    res.sendFile(__dirname + "/js/student.js");
});
app.get("/js/teacher.js", function(req, res)
{
    res.sendFile(__dirname + "/js/teacher.js");
});
app.get("/js/quickPlay.js", function(req, res)
{
    res.sendFile(__dirname + "/js/quickPlay.js");
});
app.get("/index.html", function(req, res)
{
    res.sendFile(__dirname + "/index.html");
});
app.get("/quickPlay.html", function(req, res)
{
    res.sendFile(__dirname + "/quickPlay.html");
});
app.get("/aboutus.html", function(req, res)
{
    res.sendFile(__dirname + "/aboutus.html");
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
var roomnum=0;
var players = [];
var moves = [];
var scores = 0;
var currRound = 0;
var lookingForGame = [];
var gameCodeUsers = [];
var teacherIDs = [];

function indexOfArray(array, item) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].toString() === item.toString()) return i;
    }
    return -1;
}

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
  
    socket.on('disconnect', function() {
        const _id = socket.id;
        
        var index = lookingForGame.indexOf(_id);
        if(index!=-1){
            lookingForGame.splice(index,1);
        }
        console.log(array);
        for(var i =0;i<teacherIDs.length;i++){
            var id = teacherIDs[i].split("~~~")[0];
            var code = teacherIDs[i].split("~~~")[1];
            if(id===_id){
                teacherIDs.splice(i,1);
                index = indexOfArray(array,code);
                if(index == -1){
                    index= indexOfArray(array,code+"~");
                }
                array[index] = "NULL";
                
                return false;
                
            }
        }
        for(var i =0; i<gameCodeUsers.length;i++){
            
            var nick = gameCodeUsers[i].split("~")[0];
            var id = gameCodeUsers[i].split("~")[1];
            var roomNum = gameCodeUsers[i].split("~")[2];
            
            if(id===_id){
                io.to(roomNum).emit('userDisconnected',nick);
                gameCodeUsers.splice(i,1);
                
        
                return false;
            }
        }
        
        console.log(_id + ' left the room');
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
     var roomNum = theNickname.split(",")[1];
     var city = theNickname.split(",")[2];
     var country = theNickname.split(",")[3];

     gameCodeUsers.push(nick + "~" + socket.id + "~" + roomNum);
     
     if(players[roomNum].includes(nick)){
         
        console.log("Error Nickname " + nick + " is already registered" + players + " " + theNickname[theNickname.length-1]);
        io.to(roomNum).emit('nicknameError',"error" + " " + nick);
        return false;
         
     }
     if(players[roomNum].length==10){
         io.to(roomNum).emit('nicknameError',"limit" + " " +nick)
         return false;
     }
     console.log("Success! " + nick +" is now registered in room" + roomNum);
     players[roomNum].push(nick);
     io.to(roomNum).emit('nickname',nick+","+city+","+country);
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
    io.to(roomNum).emit('score',theMove);
    if(moves[roomNum].length=== (players[roomNum].length * (players[roomNum].length-1)  )){
        io.to(roomNum).emit('everybody',"everybody");
        io.to(roomNum).emit('updateTable',"A");
    }
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
  var totScore = score.split(",")[4];
    
  console.log("totalscore : " + score.split(",")[0] + "  " +totScore);
  io.to(roomNum).emit('lead',score.split(",")[0] + "," + totScore);  

});
    
socket.on('chat message', function(msg){
  var roomNum = msg[msg.length - 1];
  msg = msg.substring(0, msg.length - 1);

  io.to(roomNum).emit('chat message', msg);
});  
socket.on('kicked',function(kick){
  console.log(kick);
  var nickname = kick.split(",")[1];
        
  var roomNumber = array.indexOf(kick.split(",")[0]);   
  if(roomNumber == -1){
      roomNumber = array.indexOf(kick.split(",")[0]+"~");
  }
  
  var index = players[roomNumber].indexOf(nickname);

  if(index>-1){
    players[roomNumber].splice(index,1);
  }  
  console.log("kicked " + nickname);
  io.to(roomNumber).emit('youGotKicked', nickname);
});
socket.on('options',function(e){
    var roomNum = array.indexOf(e.split(",")[2]);
    console.log(e.split(",")[0]+","+e.split(",")[1]+","+e.split(",")[3]+","+e.split(",")[4]);
    io.to(roomNum).emit('opt',e.split(",")[0]+","+e.split(",")[1]+","+e.split(",")[3]+","+e.split(",")[4]);
});
socket.on('restart',function(e){
    io.to(e).emit('gameDone',"gameDone");
});
socket.on('restartGame',function(e){
    currRound=0;
    var roomNum = array.indexOf(e+"~");
    moves[roomNum] = new Array(0);    
    console.log("restartGame! " + e + " " + roomNum + " f " + array);
    io.to(roomNum).emit('r',"reset");
    io.to(roomNum).emit('readyToPlay',"ready a");

});    
socket.on('lookingForGame',function(e){
  lookingForGame.push(socket.id)
  console.log( lookingForGame);
  if(lookingForGame.length>=2){
          io.to(lookingForGame[0]).emit('startGame',lookingForGame[0]+"~~~"+lookingForGame[1]);
          io.to(lookingForGame[1]).emit('startGame',lookingForGame[1]+"~~~"+lookingForGame[0]);
          lookingForGame.shift();
          lookingForGame.shift();
     
  }
     console.log( lookingForGame);
 
}); 
socket.on('quickMove',function(e){
  var move = e.split(",")[0];
  var nick = e.split(",")[1];
  var opp = e.split(",")[2];
    io.to(opp).emit('move',move);
 
});  
socket.on('teacherID',function(e){
 teacherIDs.push(socket.id+"~~~"+e);
}); 
socket.on('opponentLocation',function(e){
    var arr = e.split(",");
    console.log(e);
    var country = arr[0];
    var city = arr[1];
    var id= arr[2];
    var oppId = arr[3];
    io.to(oppId).emit('oppLoc',city+","+country);
}); 
    
});
