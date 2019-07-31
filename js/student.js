        var opponents =[];
        var rounds =10;
        var play=[];
        var oppScore= [];
        var nick = "";
        var roomNum = 0;
        var timeleft =0;
        var cheatOpp = [];
        var coopOpp = [];
        var kicked=  false;
        var secs =0;
        var permRounds = 10;
        var haveIPlayed = [];
        var leadArray = [];
        var totScore = 0;
        var anon = false;
        var rest = false
        var city = "";
        var country = "";
        $.getJSON('http://ip-api.com/json?callback=?', function(data) {
          var string = JSON.stringify(data, null, 2);

             city = string.split("\"")[7];
             country = string.split("\"")[11];    
        });

        
        
     $(function () {
         
        var socket = io();
         
         
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
            if(nick.indexOf(",")!==-1 || nick.indexOf("~")!==-1){
                var e = document.getElementById("nickError");
                    e.style.display = 'block';
                    e.innerHTML = "Nickname cannot include commas or squiggly lines";
                    return false;
            }
            
          //sends the roomNum and nickname to the server   
           e.preventDefault(); // prevents page reloading
           socket.emit('nickname', $("#studentNick").val().trim() + "," + roomNum+","+city+","+country);
        
          return false;
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
            
            if(isCodeSuccessful.split(",")[0]==="restart" && isCodeSuccessful.split(",")[1]!== nick){
                return false;
            }
            for(var i =0;i<opponents.length;i++){
                document.getElementById("ready"+i).style.display = "block";

                document.getElementById("cheat"+i).style.display = "inline-block";
                document.getElementById("coop"+i).style.display = "inline-block";
            }
           
            document.getElementById("waiting").style.display = 'none';
            document.getElementById("student").style.display = 'none';
            document.getElementById("enterNickname").style.display = 'none';
            document.getElementById("chatbox").style.display = 'block';
            document.getElementById("photo").style.display = 'inline-block';

            //timer goes 30 seconds?
            
            timeleft = secs;
            var downloadTimer = setInterval(function(){
              document.getElementById("countdown0").innerHTML = timeleft + " seconds remaining";
              timeleft -= 1;
                
                
              if(timeleft <= -1 || rest){
                rest = false;

                for(var i =0;i<opponents.length;i++){
                    if(!haveIPlayed[i]){
                        var opp =opponents[i];
                        socket.emit('move',1 + "," + roomNum + "," + nick + "," + opp);
                        coopOpp[i] =true;
                        haveIPlayed[i] = false;
                        
                    }
                }  
                  
                  
                socket.emit('updateBoard',"play " + roomNum);
                clearInterval(downloadTimer);
                  
                document.getElementById("countdown0").innerHTML = "Round Done"
                  
                socket.emit('updateBoard',"reset " + roomNum);
                  
                if(rounds==1){
                    
                    document.getElementById("countdown0").innerHTML = "Game over!";
                    socket.emit('restart',roomNum);

                    for(var i =0; i<opponents.length;i++){
                        document.getElementById("ready"+i).style.display = "none";
                        document.getElementById("opp"+i).style.display = "none";

                    }
                    document.getElementById("chatbox").style.display = "none";
                    document.getElementById("photo").style.display = "none";

                    document.getElementById("leaderboard").style.display = "block";
                    document.getElementById("totalScores").style.display = "block";

                    return false;
                }  
                rounds--;  
                socket.emit('readyToPlay',"restart," +roomNum + "," + nick);
              }
            }, 1000);
            
        });
         
        $('.cheatButton').click(function(e){
            
            var id = $(this).attr('id');
            var opp =opponents[id[id.length-1]];
            
            socket.emit('move',0 + "," + roomNum + "," + nick +"," +opp );
            document.getElementById("cheat"+id[id.length-1]).style.display = "none";
            document.getElementById("coop"+id[id.length-1]).style.display = "none";
            cheatOpp[opponents.indexOf(opp)] =true;
            haveIPlayed[opponents.indexOf(opp)] = true;
            return false;
            
        }); 
        $('.coopButton').click(function(e){        
            var id = $(this).attr('id');
            var opp =opponents[id[id.length-1]];
            
            socket.emit('move',1 + "," + roomNum + "," + nick + "," + opp);
            document.getElementById("cheat"+id[id.length-1]).style.display = "none";
            document.getElementById("coop"+id[id.length-1]).style.display = "none";
            coopOpp[opponents.indexOf(opp)] =true;
            haveIPlayed[opponents.indexOf(opp)] = true;
            return false;
            
        }); 
        socket.on('updateBoard',function(oppMove){
            //first is cheat/coop
            //second is roomNum
            //third is nick
            //fourth is opponent
            var cheatOrCoop = oppMove.split(",")[0];
            var nickName = oppMove.split(",")[2];
             
            
            if(nickName !== nick && oppMove.split(",")[3] !== nick){
                return 0;
            }
            
            if(nickName!==nick){
                var oppNum = opponents.indexOf(nickName);
            if(cheatOpp[oppNum]){
                if(cheatOrCoop==1){
                    //you cheated, opp cooperated
                        play[oppNum]+=3;
                        totScore+=3;
                        oppScore[oppNum]-=1;
                        document.getElementById("result"+oppNum).innerHTML="Your opponent cooperated, but you cheated them!";
                }else{
                    //both cheat
                        document.getElementById("result"+oppNum).innerHTML= "Both you and your opponent cheated!";
                }
            }
            
            if(coopOpp[oppNum]){
                if(cheatOrCoop==1){
                    //both cooperated
                        play[oppNum]+=2;
                    totScore+=2;
                        oppScore[oppNum]+=2;
                        document.getElementById("result"+oppNum).innerHTML= "Both you and your opponent cooperated!";
                }else{
                    //you coop, opp cheated :(
                        play[oppNum]-=1;
                        totScore-=1;
                        oppScore[oppNum]+=3;
                        document.getElementById("result"+oppNum).innerHTML="You cooperated, but your opponent cheated!";
                }
            }
                
            cheatOpp[oppNum]=false;
            coopOpp[oppNum] = false; 
            document.getElementById("yourScore"+oppNum).innerHTML="<p>"+play[oppNum]+"</p>";
            document.getElementById("oppScore"+oppNum).innerHTML="<p>"+oppScore[oppNum]+"</p>";
            socket.emit('score',nick+ "," + play[oppNum] + ","+roomNum + "," +opponents[oppNum] + "," +totScore);    
            }
        });
         
        socket.on('numberOfUsers',function(users){
            if(kicked){
                return false;
            }
            opponents = users.split(",");
                
            for(var i =0;i<opponents.length-1;i++){
                document.getElementById("ready"+i).style.display="block";
            }
            
            var index = opponents.indexOf(nick);
            
            if(index>-1){
                opponents.splice(index,1);
            }
            var opps = opponents.length;
            play= Array(opps).fill(0);
            oppScore=Array(opps).fill(0);
            cheatOpp = Array(opps).fill(false);
            coopOpp = Array(opps).fill(false);
            haveIPlayed = Array(opps).fill(false);
       
            for(var i =0; i<opponents.length;i++){
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
            }
        }); 
          socket.on('opt', function(msg){
          permRounds = msg.split(",")[0];
          rounds = permRounds;
          secs = msg.split(",")[1];
          if(msg.split(",")[2]==="true"){
              anon = true;
          }
          
        });
        socket.on('r', function(msg){
            
        totScore = 0;
        document.getElementById("leaderboard").style.display = "none";
        document.getElementById("totalScores").style.display = "none";
        for(var i=0;i<=opponents.length;i++){
            document.getElementById("yourScore"+i).innerHTML="<p>"+0+"</p>";
            document.getElementById("oppScore"+i).innerHTML="<p>"+0+"</p>"; 
        }
        var opps = opponents.length;
        leadArray = [];
        for(var i =0; i<opponents.length;i++){
                    leadArray.push(opponents[i] + ":0");
                if(!anon){
                    document.getElementById("opp"+i).innerHTML ="Opponent: " + opponents[i];
                }
        }
        leadArray.push(nick + ":0");    
            
        play= Array(opps).fill(0);
        oppScore=Array(opps).fill(0);
        haveIPlayed = Array(opps).fill(false);
        cheatOpp = Array(opps).fill(false);
        coopOpp = Array(opps).fill(false);
        rounds = permRounds;
            
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
           rest = true;
        });
        
     });      
    
        
function swap(items, leftIndex, rightIndex){
        var temp = items[leftIndex];
        items[leftIndex] = items[rightIndex];
        items[rightIndex] = temp;
    }
    function partition(items, left, right) {
        var pivot   = items[Math.floor((right + left) / 2)].split(":")[1], //middle element
            i       = left, //left pointer
            j       = right; //right pointer
        while (i <= j) {
            while (items[i].split(":")[1] > pivot) {
                i++;
            }
            while (items[j].split(":")[1] < pivot) {
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
    