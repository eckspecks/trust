 $(function () {
        var socket = io();
          socket.emit('lookingForGame', "on");
         socket.on('youLeft',function(e){
         });
          socket.on('startGame',function(e){
             alert(e);
         });
    });