var opp = "";
var id ="";
var oppMove = "null";
var playMove = "null";
var oppS = 0;
var playS = 0;
var rounds = 10;


$(function () {
        function updateScores(){
            if(playMove==1){
                if(oppMove==1){
                    //both coop
                    document.getElementById("photo").src="bothcoop.png";
                    oppS+=2;
                    playS+=2;
                }else{
                    //play coop, opp cheat
                    document.getElementById("photo").src="theycheat.png";
                    oppS+=3;
                    playS-=1;
                }
            }else{
                if(oppMove==1){
                    //play cheat, opp coop
                    document.getElementById("photo").src="youcheat.png";
                    playS+=3;
                    oppS-=1;
                }else{
                    //both cheat
                    document.getElementById("photo").src="bothcheat.png";

                }
            }
            document.getElementById("yourScore").innerHTML=playS;
            document.getElementById("oppScore").innerHTML=oppS;
            oppMove = "null";
            playMove = "null";
            rounds--;
            if(rounds==0){
                document.getElementById("ready").innerHTML = "<h1>Game Over!</h1><br><h1>Final Score:</h1><br><h1>Player: "+playS+" Opponent: " + oppS + "</h1>";
                ;
                document.getElementById("afterGame").style.display="block";

            }
        }
        function doMove(num){
        
        socket.emit('quickMove',num+","+id+","+opp);
            playMove=num;

            if(oppMove==="null"){
                document.getElementById("waiting").innerHTML = "Waiting for opponent to move...";
                document.getElementById("cheat").style.display = "none";
                document.getElementById("coop").style.display = "none";

            }else{
                document.getElementById("waiting").innerHTML = "";
                updateScores();
              
            }
        } 
    
    
        var socket = io();
          socket.emit('lookingForGame', "on");
        
          socket.on('startGame',function(e){
              opp = e.split("~~~")[1];
              id = e.split("~~~")[0];
              document.getElementById("connecting").style.display = "none";
              document.getElementById("ready").style.display = "block";

          });
        socket.on('move',function(e){

          oppMove=e;
          if(playMove==="null"){
                document.getElementById("waiting").innerHTML = "Opponent has moved.";
          }else{
                document.getElementById("waiting").innerHTML = "";
                updateScores();
                document.getElementById("cheat").style.display = "inline-block";
                document.getElementById("coop").style.display = "inline-block";
           
          }
            
        });
        $('#coop').click(function(e){
           e.preventDefault();

           doMove(1);

        });
      $('#cheat').click(function(e){
           e.preventDefault();

           doMove(0);

        });
    });