'use strict';
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
var geoip = require('geoip-lite');
const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');
const app = express();
app.use(express.static('images'));
app.use(express.static(path.join(__dirname, 'public')));
const server = http.createServer(app);
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
var playerIDs = [];
var geo = [];
 
// inside middleware handler

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

function indexOfArray(array, item) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].toString() === item.toString()) return i;
    }
    return -1;
}

function arrayBufferToString(buffer){
    var byteArray = new Uint8Array(buffer);
    var str = "", cc = 0, numBytes = 0;
    for(var i=0, len = byteArray.length; i<len; ++i){
        var v = byteArray[i];
        if(numBytes > 0){
            //2 bit determining that this is a tailing byte + 6 bit of payload
            if((cc&192) === 192){
                //processing tailing-bytes
                cc = (cc << 6) | (v & 63);
            }else{
                throw new Error("this is no tailing-byte");
            }
        }else if(v < 128){
            //single-byte
            numBytes = 1;
            cc = v;
        }else if(v < 192){
            //these are tailing-bytes
            throw new Error("invalid byte, this is a tailing-byte")
        }else if(v < 224){
            //3 bits of header + 5bits of payload
            numBytes = 2;
            cc = v & 31;
        }else if(v < 240){
            //4 bits of header + 4bit of payload
            numBytes = 3;
            cc = v & 15;
        }else{
            //UTF-8 theoretically supports up to 8 bytes containing up to 42bit of payload
            //but JS can only handle 16bit.
            throw new Error("invalid encoding, value out of range")
        }

        if(--numBytes === 0){
            str += String.fromCharCode(cc);
        }
    }
    if(numBytes){
        throw new Error("the bytes don't sum up");
    }
    return str;
}
io.on('connection', function(socket){
       

http.get({'host': 'api.ipify.org', 'port': 80, 'path': '/'}, function(resp) {
  resp.on('data', function(ip) {

   io.to(socket.id).emit('ip',   String.fromCharCode.apply(null, new Uint16Array(ip))
);
  });
});
    socket.on('message', function(msg){
        //teacher creates a new roomNumber
        socket.join(roomnum);
        players.push(new Array(0));
        geo.push(new Array(0));

        playerIDs.push(new Array(0));

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
       // console.log(array);
        for(var i =0;i<teacherIDs.length;i++){
            var id = teacherIDs[i].split("~~~")[0];
            var code = teacherIDs[i].split("~~~")[1];
            if(id===_id){
                teacherIDs.splice(i,1);
                index = indexOfArray(array,code);
                io.to(index).emit('teacherDisconnected',":(");
                
                
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
        //console.log("success! Room number:" + roomNumber + " Players Code:" + playersCode);
        
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
     var count = theNickname.split(",")[3];

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
//     console.log(theNickname);
//     console.log("Success! " + nick +" is now registered in room" + roomNum);
     players[roomNum].push(nick);
     geo[roomNum].push(city + ":"+count);
     playerIDs[roomNum].push(socket.id);
     io.to(roomNum).emit('nickname',nick+","+city+","+count);
     io.to(roomNum).emit('allNicks',players[roomNum]+"~"+geo[roomNum]);
     io.to(roomNum).emit('playerIds',socket.id);
     io.to(roomNum).emit('nicknameError',"success" + " " +nick);
});
    
    
 socket.on('readyToPlay',function(gameCode){
     //console.log(gameCode);
     var nick = gameCode.split(",")[2];
     var roomNumber = array.indexOf(gameCode.split(",")[1]);
     //console.log(players);
        //sends the nickname of each player in the teacher's room to the teacher
        io.to(roomNumber).emit('readyToPlay',"ready a");
        io.to(roomNumber).emit("round","");
        for (var i=array.length-1; i>=0; i--) {
            if (array[i] === gameCode.split(",")[1]) {
              array[i]+="~";
           }
        }
      
 
});    
          
socket.on('move',function(theMove){
    console.log("move: " +theMove);
    var arr = theMove.split(",");
    var roomNum =arr[1];    
    var id= arr[4];
    
    moves[roomNum].push(theMove);

    
    io.to(id).emit('oppMoveAgainstYou',arr[0]+","+arr[2]);
    io.to(roomNum).emit('score',theMove);
    if(moves[roomNum].length=== (players[roomNum].length * (players[roomNum].length-1)  )){
        io.to(roomNum).emit('everybody',"everybody");
        io.to(roomNum).emit('updateTable',"A");
    }
}); 
    
    
socket.on('resetMoves',function(update){
    
        //resets the moves array
        moves[update] = new Array(0);    
    
});
    
socket.on('numberOfUsers',function(users){
  var arr = users.split("~");
  var teachersCode = arr[2];   
  var roomNumber = array.indexOf(teachersCode);
  io.to(roomNumber).emit('numberOfUsers',arr[0]+"~"+arr[1]);
  console.log("Users: " + users);
});
    

    
socket.on('score',function(score){  
  console.log("Score: " + score);
  var roomNum = score.split(",")[2];
  var totScore = score.split(",")[4];
    
  io.to(roomNum).emit('lead',score.split(",")[0] + "," + totScore);  

});
    
socket.on('chat message', function(msg){
  var roomNum = msg[msg.length - 1];
  msg = msg.substring(0, msg.length - 1);

  io.to(roomNum).emit('chat message', msg);
});  
socket.on('kicked',function(kick){
  var lastIndex = kick.lastIndexOf(" ");
  var roomNumber = indexOfArray(array,kick.split(",")[0]);
   
  console.log(players + " " +roomNumber + " " + array);
  var index = players[roomNumber].indexOf(kick.split(",")[1]);

  if(index>-1){
    players[roomNumber].splice(index,1);
    playerIDs[roomNumber].splice(index,1);
      geo[roomNumber].splice(index,1);
  }  
  io.to(roomNumber).emit('youGotKicked', kick.split(",")[1]);
});
socket.on('options',function(e){
    var roomNum = array.indexOf(e.split(",")[2]);
    console.log(e.split(",")[0]+","+e.split(",")[1]+","+e.split(",")[3]+","+e.split(",")[4]);
    io.to(roomNum).emit('opt',e.split(",")[0]+","+e.split(",")[1]+","+e.split(",")[3]+","+e.split(",")[4]+","+e.split(",")[5]);
});
socket.on('restart',function(e){
    io.to(e).emit('gameDone',"gameDone");
});
socket.on('restartGame',function(e){
    currRound=0;
    var roomNum = array.indexOf(e+"~");
    moves[roomNum] = new Array(0);    
    io.to(roomNum).emit('r',"reset");
    io.to(roomNum).emit('readyToPlay',"ready a");
    io.to(roomNum).emit('round',"ready");


});    
socket.on('lookingForGame',function(e){
  lookingForGame.push(socket.id)
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
socket.on('nextRound',function(e){
 var roomNum = e.split(",")[0];
 var index = players[roomNum].indexOf(e.split(",")[1]);
 
    
    
 io.to(playerIDs[roomNum][index]).emit('round',"?");
}); 
});
