        var matrix = [];
        var users=0;
        var players=[];
        var ids = [];
        var x = 0;
        var y = 0;
        var j = 0;
        var currRound = 1;
        var gamestarted = false;
     $(function () {
         
        var socket = io();
        var teachersCode ="";
         
        $("#send").click(function(e){
          //sends the generated code to server     
          e.preventDefault(); // prevents page reloading
          teachersCode = $("#code").text();
          socket.emit('message', teachersCode);
            socket.emit('teacherID',teachersCode);
          return false;
        });
         
        socket.on('nickname', function(nick){
           var arr = nick.split(",");
           //adds the names that the server sends back to the list of connected players
           var ul = document.getElementById("names");
           var li = document.createElement("li");
           li.appendChild(document.createTextNode(arr[0] + " From " + arr[1] + " , " + arr[2] ));
           var button = document.createElement("button");
           button.setAttribute('class',"kicked");
           button.innerHTML = " Kick";
           button.setAttribute("id",users);
           li.appendChild(button);
           li.setAttribute("id",users+"!");
           ul.appendChild(li);
           users++;
           
           players.push(arr[0]);
        });
        socket.on('playerIds',function(e){
            ids.push(e);
        });
        $(document).on('click', "button.kicked", function() {
            
           if(gamestarted){
               return false;
           }    
            
           var theId = $(this).attr('id');
           var ulElem = document.getElementById("names");
           var text =  ulElem.childNodes[theId].textContent; 
           socket.emit('kicked',teachersCode + ","+text);
    
           var lastIndex = text.lastIndexOf(" ");
           text = text.substr(0, lastIndex);
            
           var index = players.indexOf(players[theId]);
           if(index>-1){
             players.splice(index,1);
             ids.splice(index,1);
           } 
            
           ulElem.removeChild(ulElem.childNodes[theId]);
           users--;
       });
          socket.on('userDisconnected',function(restart){ 
              document.getElementById(players.indexOf(restart)).click();
          });  
        $("#playGame").click(function(e){
            
          var r = document.getElementById("roundNum").value;
          var spr = document.getElementById("secsPerRound").value;
          var c = document.getElementById("anon").checked;
          if(r.length === 0 || spr.length === 0){
              document.getElementById("error").innerHTML = "Options must not be empty";
              return false;
          } 
          if(!isNumeric(r) || !isNumeric(spr)){
              document.getElementById("error").innerHTML = "Options must not be numbers";
              return false;
          } 
          if(r<1 || spr<1){
              document.getElementById("error").innerHTML = "Options must not be negative or zero.";
              return false;
          }
          if(spr<15){
              document.getElementById("error").innerHTML = "Minimum time per round is 15 seconds";
              return false;              
          }
          socket.emit('options',r + "," + spr + "," + teachersCode + "," + c); 
          //sends the generated code to server
          resetMatrix();
            
          if(users<2){
            document.getElementById("error").style.display="block";   
            document.getElementById("error").innerHTML="Must have more than 1 player";
            return false;
          }
             
          e.preventDefault(); // prevents page reloading
          socket.emit('numberOfUsers',players +"~"+ids+"~" +teachersCode);

          socket.emit('readyToPlay',"play," + teachersCode);
          play();
          gamestarted = true;
          
          return false;
        }); 
         
        socket.on('score',function(oppScore){   
            //nickname then score then opponent
            var nick = oppScore.split(",")[2];
            var move = oppScore.split(",")[0];
            var opponent = oppScore.split(",")[3];
            
            var yIndex = players.indexOf(nick); 
            var xIndex = players.indexOf(opponent);
            var arr = matrix[xIndex];
            if(move==0){
                
                matrix[xIndex][yIndex]="Cheat";
            }
            if(move==1){
                matrix[xIndex][yIndex]="Coop";
            }
            
        }); 
        socket.on('updateTable',function(e){
            var tableHTML = "<table id='my-table"+currRound+"'><tbody><tr><td>Round " +currRound+  " </td></tr></tbody></table><br>";
            $("#tableDiv").append(tableHTML);
            
            
            for(var i =0; i<players.length;i++){
                appendColumn();
            }
            j=0;
            for(var i =0; i<players.length;i++){
                appendRow();
            }
            
            resetMatrix();
            currRound++;

        });
        socket.on('gameDone',function(restart){ 
           document.getElementById("restartGameButton").style.display = "block";
        }); 
        
        $("#restartGame").click(function(e){
             
          socket.emit('restartGame',teachersCode);
          socket.emit('numberOfUsers',players +"~"+ids+"~" +teachersCode);
          socket.emit('readyToPlay',"play," + teachersCode);
          document.getElementById("restartGameButton").style.display = "none";              
          currRound =1;
          document.getElementById("tableDiv").innerHTML = "";

        });
     });
    
        function appendRow() {
            var id='my-table'+currRound;
            var tbl = document.getElementById(id), // table reference
                row = tbl.insertRow(tbl.rows.length),      // append table row
                i;
            // insert table cells to the new row
               createCell(row.insertCell(i), players[x], 'row');
            
            //adding the numbas
            var arr = matrix[y];
            for (i = 1; i < tbl.rows[0].cells.length; i++) {
                createCell(row.insertCell(i), arr[i-1], 'row');
            }
            y++;
            x++;
        }
        
        function appendColumn() {
            var id ='my-table'+currRound;
            var tbl = document.getElementById(id), // table reference
                i;
            // open loop for each row and append cell
            
            for (i = 0; i < tbl.rows.length; i++) {
                createCell(tbl.rows[i].insertCell(tbl.rows[i].cells.length), players[j], 'col');
            }
           
            j++;
        }
        
       function createCell(cell, text, style) {
            var div = document.createElement('div'), // create DIV element
            txt = document.createTextNode(text); // create text node
            div.appendChild(txt);                    // append text node to the DIV
            div.setAttribute('class', style);        // set DIV class attribute
            div.setAttribute('className', style);    // set DIV class attribute for IE (?!)
            cell.appendChild(div);                   // append DIV to the table cell
       }
        
        function gen(){
          //hide and show new buttons
          document.getElementById("names").style.display="block";
          document.getElementById("yourRoomCode").style.display = 'block';
          document.getElementById("code").innerHTML = Math.random().toString(36).substr(2, 6);
          document.getElementById("send").style.display = "none";
          document.getElementById("playGame").style.display="block";    
          document.getElementById("players").style.display="block";    
          document.getElementById("options").style.display="block";    
        }
        
        function play(){
            document.getElementById("hideAfterPlayGame").style.display="none";
        }
        
        function resetMatrix(){
            matrix=[];
            for(var i =0;i<players.length;i++){
                
                var a = [];
                for(var j =0;j<players.length;j++){
                    a.push("-");
                }
                
              matrix.push(a);
          }
             x=0;
             y=0;
             j=0;
        }
        
        function isNumeric(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }   
    