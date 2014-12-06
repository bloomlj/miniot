var express = require('express');
var app = express();
app.use('/static', express.static(__dirname + '/public'));

var http = require('http').Server(app);
var io = require('socket.io')(http);

var dgram = require("dgram");
var server = dgram.createSocket("udp4");

var sensormsg =  new Array();

var clients = new Array();

var todecimal = function(ddd,mm,ss,s){
    decimal = ddd+ (mm+ss*0.01+s*0.0001)/ 60 ;
    return decimal;
}

server.on("error", function (err) {
  console.log("server error:\n" + err.stack);
  server.close();
});


server.on("message", function (buf, rinfo) {
  console.log("server got: " + buf + " from " +
    rinfo.address + ":" + rinfo.port);
    
    //show hex str
    var hexStr = buf.toString("hex");
    console.log(hexStr);
    
    var msg = {"time":{"h":0,"m":0,"s":0,"ms":0},
               "longitude":{"ddd":0,"mm":0,"ss":0,"s":0,"decimal":0},
               "latitude":{"ddd":0,"mm":0,"ss":0,"s":0,"decimal":0}
              };
    msg.time.h = buf.readInt8(0);
    msg.time.m = buf.readInt8(1);
    msg.time.s = buf.readInt8(2);
    msg.time.ms = buf.readInt8(3);
    msg.longitude.ddd = buf.readInt8(4);
    msg.longitude.mm= buf.readInt8(5);
    msg.longitude.ss = buf.readInt8(6);
    msg.longitude.s = buf.readInt8(7);
    msg.latitude.ddd = buf.readInt8(8);
    msg.latitude.mm= buf.readInt8(9);
    msg.latitude.ss = buf.readInt8(10);
    msg.latitude.s = buf.readInt8(11);
    
    msg.longitude.decimal = todecimal(msg.longitude.ddd,msg.longitude.mm,msg.longitude.ss,msg.longitude.s);
    msg.latitude.decimal = todecimal(msg.latitude.ddd,msg.latitude.mm,msg.latitude.ss,msg.latitude.s);
    
    clientmsg = msg.longitude.decimal+"|"+msg.latitude.decimal;
    
    console.log(clientmsg);
    sensormsg.push(clientmsg);
    //var longitudebuf = msg.slice(0,3);
    
    //console.log("-");
   // console.log(msg[4]);
    //console.log(longitudebuf.toString("base64"));
    //console.log("-");
    //console.log(msg+"");
    //console.log(sensormsg.length);
    
//      while(clients.length > 1 ){
//      latestsensormsg = sensormsg.shift();
//          for(var client in clients){
//              //  client.emit('chat message', latestsensormsg+"");
//              client.broadcast.emit(latestsensormsg+"");
//          }
//    }
    
    
//    var socket = io.connect('127.0.0.1:3000');
//    socket.on('connect', function(){
//        console.log('connect');
//        socket.emit('chat message', msg);
//    });

});


server.on("listening", function () {
  var address = server.address();
  console.log("server listening " +
      address.address + ":" + address.port);
});

server.bind(8080);




app.get('/', function(req, res){
   res.sendfile(__dirname + '/index_udp.html');
});


io.on('connection', function(socket){
  clients.push(socket);
  io.emit('message', "start");
  socket.on('message', function(msg){
      
      //console.log(msg);
      //io.emit('message', msg);
      if(sensormsg.length >0){
          latestsensormsg = sensormsg.shift();
          io.emit('message', latestsensormsg+"");
          console.log(latestsensormsg);
      }else{
        io.emit('message', "wait");
      }

  });
});




http.listen(3000, function(){
  console.log('listening on *:3000');
    
});
