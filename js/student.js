        var opponents =[];
        var rounds =10;
        var play=[];
        var oppScore= [];
        var nick = "";
        var roomNum = 0;
        var timeleft =0;
        var kicked=  false;
        var secs =0;
        var permRounds = 10;
        var haveIPlayed = [];
        var leadArray = [];
        var totScore = 0;
        var anon = false;
        var rest = false;
        var oppIDs = [];
        var oppMoves = [];
        var cheatOpp = [];
        var coopOpp = [];
        var oppCoopRep = [];
        var oppCheatRep = [];
        var playCoopRep = 0;
        var playCheatRep =0;
        var city = "Unknown";
        var allnicks = false;
        var country = "Unknown";
        var ip = "";
        var survival = false;

      function getIP(json) {
        ip =  json.ip;
      }
        function percentageToHsl(percentage, hue0, hue1) {
            var hue = (percentage * (hue1 - hue0)) + hue0;
            return 'hsl(' + hue + ', 100%, 50%)';
        }

     $(function () {
         
        var socket = io();
         socket.emit('geo',ip);
         
        $("#submitRoomCode").click(function(e){
                    
          e.preventDefault(); // prevents page reloading
        
          //sends the code that player has put in to the server
          socket.emit('code', $("#studentRoomCode").val());
            
            //gets a message back from the server whether or not the code was successful
            socket.on('code',function(isCodeSuccessful){
             
               var e = document.getElementById("codeError");
                
               //if it is not valid, tell user    
               if(isCodeSuccessful==="failure"){
                    e.style.display = 'block';
                    e.innerHTML = "Invalid Room Code";
                }else{
                    //allows user to enter nickname if it is successful
                    roomNum = isCodeSuccessful.split(" ")[1];
                    document.getElementById("enterNickname").style.display = 'block';
                    document.getElementById("student").style.display = 'none';
                }
            }) 
          return false;
        });
         
        $("#nickname").click(function(e){
         nick =  $("#studentNick").val().trim();
            if(nick.length==0){
                var e = document.getElementById("nickError");
                    e.style.display = 'block';
                    e.innerHTML = "Must Enter Nickname";
                    return false;
            }
            if(nick.indexOf(",")!==-1 || nick.indexOf("~")!==-1 || nick.indexOf(":")!==-1){
                var e = document.getElementById("nickError");
                    e.style.display = 'block';
                    e.innerHTML = "Nickname cannot include special characters";
                    return false;
            }
            
          //sends the roomNum and nickname to the server   
           e.preventDefault(); // prevents page reloading
           socket.emit('nickname', $("#studentNick").val().trim() + "," + roomNum+","+city+","+country);
        
          return false;
        });
         
        socket.on('allNicks',function(nickname){
           if(allnicks){
               return false;
           }    
           allnicks = true;
           //adds the names that the server sends back to the list of connected players
           var ul = document.getElementById("studentNames");
           var nicks = nickname.split("~")[0];
           var locations = nickname.split("~")[1].split(",");
           for(var i =0;i<nicks.split(",").length;i++){
                var li = document.createElement("li");
              
                li.appendChild(document.createTextNode(nicks.split(",")[i] + " (" + locations[i].split(":")[0] + " " + locations[i].split(":")[1]+")"));

                ul.appendChild(li);    
         //  players.push(arr[0]);
        }
        });
         
         socket.on('nickname',function(nickname){
            if(!allnicks){
                return false;
            }
           var ul = document.getElementById("studentNames");
           var li = document.createElement("li");
           var arr = nickname.split(",");
           li.appendChild(document.createTextNode(arr[0] + "(" + arr[1] + " " + arr[2] + ")"));
           ul.appendChild(li);
         });
         
        socket.on('nicknameError',function(error){
            if((error.substr(error.indexOf(' ')+1)) !== nick){
                return false;
            }
            
            if(error.split(" ")[0]==="success"){
              document.getElementById("enterNickname").innerHTML = "";  
              document.getElementById("waiting").style.display = "block";  
              return false;
            }
            if(error.split(" ")[0]==="limit"){
                e.style.display = 'block';
                e.innerHTML = "Too many people already in room."
                return false;
            }
           var e = document.getElementById("nickError");
           e.style.display = 'block';
           e.innerHTML = "Nickname has already been chosen.";       
        });
         
        socket.on('readyToPlay',function(isCodeSuccessful){
            
            if(kicked){
                return false;
            }
          
            for(var i =0;i<opponents.length;i++){
                document.getElementById("ready"+i).style.display = "block";
                document.getElementById("cheat"+i).style.display = "inline-block";
                document.getElementById("coop"+i).style.display = "inline-block";
                document.getElementById("opp"+i).style.display = "block";
            }
            document.getElementById("lead").style.display = "block";
            document.getElementById("leaderboard").style.display = "block";
                        document.getElementById("hideRep").style.display = "block";

            document.getElementById("waiting").style.display = 'none';
            document.getElementById("student").style.display = 'none';
            document.getElementById("enterNickname").style.display = 'none';
            document.getElementById("chatbox").style.display = 'block';
            document.getElementById("photo").style.display = 'inline-block';

        });
         
        $(document).on("click", ".cheatButton", function(e){
            playCheatRep++;
            e.preventDefault();
            var id = $(this).attr('id');
            var opp =opponents[id[id.length-1]];
            var opponentID = oppIds[id[id.length-1]];
        
            socket.emit('move',0 + "," + roomNum + "," + nick +"," +opp+","+opponentID );
            document.getElementById("cheat"+id[id.length-1]).style.display = "none";
            document.getElementById("coop"+id[id.length-1]).style.display = "none";
            haveIPlayed[opponents.indexOf(opp)] = true;
            cheatOpp[opponents.indexOf(opp)] =true;

            return false;
        }); 
         
        $(document).on("click", ".coopButton", function(e){
            playCoopRep++;
            e.preventDefault();
            var id = $(this).attr('id');
            var opp =opponents[id[id.length-1]];

            var opponentID = oppIds[id[id.length-1]];
        
            socket.emit('move',1 + "," + roomNum + "," + nick +"," +opp+","+opponentID);
            document.getElementById("cheat"+id[id.length-1]).style.display = "none";
            document.getElementById("coop"+id[id.length-1]).style.display = "none";
            haveIPlayed[opponents.indexOf(opp)] = true;
            coopOpp[opponents.indexOf(opp)] =true;

            return false;
        }); 
         
         socket.on('round',function(e){
             console.log(rounds + " A " + permRounds);
             if(kicked){
                return false;
             }
              timeleft = secs;
              var downloadTimer = setInterval(function(){
              document.getElementById("countdown0").innerHTML = timeleft + " seconds remaining";
              timeleft -= 1;
                
              if(timeleft <= -1 || rest){
                  
                rest = false;
               
                clearInterval(downloadTimer);
                document.getElementById("countdown0").innerHTML = "Round Done"
                  
                updateBoard(); 
                  
                socket.emit('resetMoves',roomNum);
                if(rounds==1){
                        
                    if(survival){
                        
                        setTimeout(function () {
                            
                            if(opponents.length==2||opponents.length==1){
                                var winner = leadArray[0].split(":")[0];
                                socket.emit('winner',winner+","+roomNum);
                                
                                if(nick===winner){
                                    document.getElementById("countdown0").innerHTML = "Congrats " + nick + "<br>" + "You are the last survivor! You win!";
                                    return false;
                                }else{
                                    document.getElementById("countdown0").innerHTML = "Game over!  <br>" + winner + " is the last survivor! You lose!";
                                    return false;
                                }
                            }
                            
                            
                            var index = leadArray.length-1;
                        
                            
                        socket.emit('survival',leadArray[index]+","+roomNum);
                            
                        var nickEliminated = leadArray[index].split(":")[0];
                        if(nickEliminated===nick){
                            document.getElementById("countdown0").innerHTML = "You were eliminated!";
                            kicked=true;
                        }else{
                            
                            for(var i =0; i<opponents.length;i++){
                                document.getElementById("opp"+i).style.display = "none";
                            }
                            
                            document.getElementById("countdown0").innerHTML = nickEliminated + " was eliminated! <br> Waiting for teacher to start next round...";
                            
                            socket.emit("requestRounds",roomNum);
                            

                            var index = opponents.indexOf(nickEliminated);
                            
                            if(index>-1){
                                opponents.splice(index,1);
                                oppIds.splice(index,1);
                            }
                            
                            var opps = opponents.length;
                            
                           
                            
                            play= Array(opps).fill(0);
                            oppScore=Array(opps).fill(0);

                            haveIPlayed = Array(opps).fill(false);
                            oppMoves = [];
                            leadArray = [];
                            
                            for(var i =0; i<opponents.length;i++){
                               
                                oppMoves.push("null");
                                leadArray.push(opponents[i] + ":0");
                                
                                if(!anon){
                                    document.getElementById("opp"+i).innerHTML ="Opponent: " + opponents[i];
                                }
                                
                                document.getElementById("yourScore"+i).innerHTML="<p>"+play[i]+"</p>";
                                document.getElementById("oppScore"+i).innerHTML="<p>"+oppScore[i]+"</p>";
                            }
                            leadArray.push(nick + ":0");
                            
                            var scores = document.getElementById("leaderboard"); 
                            var line = "";
                            for(var i =0;i<leadArray.length;i++){
                                 line+=leadArray[i]+"<br>";
                            }
                            scores.innerHTML = line;
                            
                        }
                            
                        }, 3000);
                    
                    }else{

                        document.getElementById("countdown0").innerHTML = "Game over!";
                    }
                    
                    socket.emit('restart',roomNum);

                    for(var i =0; i<opponents.length;i++){
                        document.getElementById("ready"+i).style.display = "none";
                        document.getElementById("opp"+i).innerHTML = "";
                    }
                    document.getElementById("hideRep").style.display = "none";

                    document.getElementById("chatbox").style.display = "none";
                    document.getElementById("photo").style.display = "none";

                    document.getElementById("totalScores").style.display = "block";
                    
                    return false;
                }  
                rounds--;  
                socket.emit('nextRound',roomNum+","+nick);
                  
                for(var i =0;i<opponents.length;i++){
                    
                    document.getElementById("cheat"+i).style.display = "inline-block";
                    document.getElementById("coop"+i).style.display = "inline-block";
                    
                }
                  
              }
            }, 1000);
        }); 
        socket.on('numberOfUsers',function(users){
            var arr = users.split("~");
            if(kicked){
                return false;
            }
            opponents = arr[0].split(",");
            oppIds = arr[1].split(",");
            for(var i =0;i<opponents.length-1;i++){
                document.getElementById("ready"+i).style.display="block";
                
            }
            
            var index = opponents.indexOf(nick);
            
            if(index>-1){
                opponents.splice(index,1);
                oppIds.splice(index,1);
            }
            var opps = opponents.length;
            play= Array(opps).fill(0);
            oppScore=Array(opps).fill(0);
            oppCheatRep=Array(opps).fill(0);
            oppCoopRep=Array(opps).fill(0);
            
            haveIPlayed = Array(opps).fill(false);
       
            for(var i =0; i<opponents.length;i++){
               // alert(opponents[i]);
                oppMoves.push("null");
                leadArray.push(opponents[i] + ":0");
                if(!anon){
                document.getElementById("opp"+i).innerHTML ="Opponent: " + opponents[i];
                }
            }
            leadArray.push(nick + ":0");
        }); 
         
        $("#sendmsg").click(function(e){
          socket.emit('chat message', nick + ": " + $('#m').val() + roomNum);
          $('#m').val('');
          return false;
        });
         
        socket.on('chat message', function(msg){
          $('#messages').append($('<li>').text(msg));
          window.scrollTo(0, document.body.scrollHeight);
        });
         socket.on('youGotKicked', function(msg){
            if(msg===nick){
              document.getElementById("waiting").innerHTML= "<h1>You got kicked by the teacher! :(</h1><br>    <a href ='/student.html'>Go Back</a>";
              kicked = true;
              return false;
            }
             
        var listItems = $("#studentNames li");
        listItems.each(function(idx, li) {
            var product = $(li);
            var text = product.text();
            
            if(text.split("(")[0].trim()===msg){
                product.hide();
            }
            
        });
             
             
             
        }); 
          socket.on('opt', function(msg){
          permRounds = msg.split(",")[0];
          rounds = Number(permRounds);
          secs = msg.split(",")[1];
          if(msg.split(",")[2]==="true"){
              anon = true;
          }
          if(msg.split(",")[3]==="true"){
              survival = true;
          }
          
        });
        socket.on('r', function(msg){
            if(kicked){
                return false;
            }
            totScore = 0;
            document.getElementById("leaderboard").style.display = "none";
            document.getElementById("hideRep").style.display = "none";

            document.getElementById("totalScores").style.display = "none";
            for(var i=0;i<=opponents.length;i++){
                document.getElementById("yourScore"+i).innerHTML="<p>"+0+"</p>";
                document.getElementById("oppScore"+i).innerHTML="<p>"+0+"</p>"; 
                document.getElementById("oppRep"+i).style.display ="none";  
            }
            var opps = opponents.length;
            leadArray = [];
            for(var i =0; i<opponents.length;i++){
                   // alert(opponents[i]);
                        leadArray.push(opponents[i] + ":0");
                    if(!anon){
                        document.getElementById("opp"+i).innerHTML ="Opponent: " + opponents[i];
                    }
            }
            leadArray.push(nick + ":0");    

            play= Array(opps).fill(0);
            oppScore=Array(opps).fill(0);
            oppMove=Array(opps).fill("null");
            haveIPlayed = Array(opps).fill(false);
            cheatOpp = Array(opps).fill(false);
            rounds = Number(permRounds);
            
        });
         
         socket.on('lead', function(e){
            var n = e.split(",")[0];
            for(var i =0; i<=opponents.length;i++){
                if(leadArray[i].split(":")[0]===n){
                    leadArray[i]=n + ":" + e.split(",")[1];
                }
            }
        
            leadArray = quickSort(leadArray, 0, leadArray.length - 1);
            var scores = document.getElementById("leaderboard"); 
            var line = "";
            for(var i =0;i<leadArray.length;i++){
                 line+=leadArray[i]+"<br>";
            }
            scores.innerHTML = line;
        });
         
        socket.on('everybody',function(e){
            //not sending all the time?
           rest = true;
        });
          socket.on('roundNums',function(e){
           rounds=Number(e);
        });  
        socket.on('teacherDisconnected',function(e){
            document.getElementById("waiting").innerHTML = "<h1>Teacher disconnected! :(</h1><br>    <a href ='/student.html'>Go Back</a>";
        });
         socket.on('ip',function(e){
             if(e==null){
                 return false;
             }
             var ip = JSON.stringify(e).split(",");
             city = ip[6].split("\"")[3];
             country = ip[2].split("\"")[3];
         });
         socket.on('score',function(e){
            var opponent = e.split(",")[2];
            var move = e.split(",")[0];
            var index = opponents.indexOf(opponent);
           
            if(move==1){
            oppCoopRep[index]++;
            }else{
            oppCheatRep[index]++;
            }
        });
         socket.on('oppMoveAgainstYou',function(e){
           var index = opponents.indexOf(e.split(",")[1]);
           oppMoves[index] = e;
        });
         
          function bothCoop(num){
            play[num]+=2;
            totScore+=2;
            oppScore[num]+=2;
            document.getElementById("result"+num).innerHTML= "Both you and your opponent cooperated!";   
          }
         function playCoop(num){
            play[num]-=1;
            totScore-=1;
            oppScore[num]+=3;
            document.getElementById("result"+num).innerHTML="You cooperated, but your opponent cheated!";   
         }
         function playCheat(num){
            play[num]+=3;
            totScore+=3;
            oppScore[num]-=1;
            document.getElementById("result"+num).innerHTML="Your opponent cooperated, but you cheated them!"; 
         }
         
        function updateBoard(){
              
               
        for(var i =0;i<opponents.length;i++){
            var move = oppMoves[i];
           
            if(move=="null"){
                if(haveIPlayed[i]){
                    
                    if(cheatOpp[i]){
                        playCheat(i);
                    }
                    if (coopOpp[i]){
                       bothCoop(i);
                    }
                    
                    
                }else{
                    bothCoop(i);
                }
            }else{
            
                var cheatOrCoop = move.split(",")[0];

                if(!haveIPlayed[i]){
                    if(cheatOrCoop==1){
                        bothCoop(i); 
                    }else{
                        playCoop(i);
                    }
                }else{
                    if(cheatOpp[i]){
                        if(cheatOrCoop==1){
                            playCheat(i);
                        }else{
                            document.getElementById("result"+i).innerHTML= "Both you and your opponent cheated!";
                        }
                    }
                    if(coopOpp[i]){
                        if(cheatOrCoop==1){
                            bothCoop(i); 
                        }else{
                            playCoop(i);    
                        }
                    }
                }
            }
             cheatOpp[i]=false;
             coopOpp[i] = false;
             document.getElementById("yourScore"+i).innerHTML="<p>"+play[i]+"</p>";
             document.getElementById("oppScore"+i).innerHTML="<p>"+oppScore[i]+"</p>";
             var percentage = (oppCoopRep[i])/(oppCoopRep[i] + oppCheatRep[i]).toFixed(2);
             document.getElementById("oppRep"+i).style.background=percentageToHsl(percentage,0,120);
             var myPercentage = playCoopRep/(playCoopRep+playCheatRep);
             myPercentage = myPercentage.toFixed(2);
             
             document.getElementById("myRep").style.background = percentageToHsl(myPercentage,0,120);
            socket.emit('score',nick+ "," + play[i] + ","+roomNum + "," +opponents[i] + "," +totScore);   

        }
            
            for(var i =0;i<opponents.length;i++){
                oppMoves[i] = "null";
                haveIPlayed[i]=false;
            }
        }   
     });      
    
    function changeRep(){
        
    }     
    function swap(items, leftIndex, rightIndex){
        var temp = items[leftIndex];
        items[leftIndex] = items[rightIndex];
        items[rightIndex] = temp;
    }
    function partition(items, left, right) {
        var pivot   = Number(items[Math.floor((right + left) / 2)].split(":")[1]), //middle element
            i       = left, //left pointer
            j       = right; //right pointer
        while (i <= j) {
            while (Number(items[i].split(":")[1]) > pivot) {
                i++;
            }
            while (Number(items[j].split(":")[1]) < pivot) {
                j--;
            }
            if (i <= j) {
                swap(items, i, j); //sawpping two elements
                i++;
                j--;
            }
        }
        return i;
    }

    function quickSort(items, left, right) {
        var index;
        if (items.length > 1) {
            index = partition(items, left, right); //index returned from partition
            if (left < index - 1) { //more elements on the left side of the pivot
                quickSort(items, left, index - 1);
            }
            if (index < right) { //more elements on the right side of the pivot
                quickSort(items, index, right);
            }
        }
        return items;
    }
   
        
        
    
    
    