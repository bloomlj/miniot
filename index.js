var express = require('express');
var app = express();
app.use('/static', express.static(__dirname + '/public'));

var WebSocket = require('faye-websocket');

var http = require('http');
var exserver = http.Server(app);
//var wsserver = require('faye-websocket')(http);
//var io = require('socket.io')(http);

var dgram = require("dgram");
var server = dgram.createSocket("udp4");
//mysql


var sensormsg =  new Array();
//save  all ws clients.
var clients = new Array();
//gps position  format exchange.
var wsserver = http.createServer();

//var wsclients = new Array();

server.on("error", function (err) {
  console.log("server error:\n" + err.stack);
  server.close();
});


server.on("message", function (buf, rinfo) {
  console.log("server got: " + buf + " from " +
    rinfo.address + ":" + rinfo.port);

    var bufStr = buf.toString();
    console.log(bufStr);

    var msg = bufStr;

    var now=new Date()
    var nowstring = now.getFullYear()+"-"+now.getMonth()+"-"+now.getDate()+" "+now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();

    console.log(nowstring);

    sensormsg.push(msg);
    //now datetime


    var WSclient= new WebSocket.Client('ws://localhost:3000');

    WSclient.on('open', function(event) {
          console.log('open websocket');
          WSclient.send(msg);
          //ws.send('104.021|30.709');

          console.log('close websocket');
          //WSclient.close();
    });

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
  console.log("udp server listening " +
      address.address + ":" + address.port);
});

server.bind(10000);




app.use('/', function(req, res){
   res.sendFile(__dirname + '/index_ems.html');
});

//var wsserver = http.createServer();

var wsclients = new Array();
wsserver.on('upgrade', function(request, socket, body) {
  if (WebSocket.isWebSocket(request)) {
    var ws = new WebSocket(request, socket, body);
    wsclients.push(ws);
    ws.on('message', function(event) {
		//ws.send(event.data);
		//console.log(event.data);

      //save  to db
    //var now=new Date()
    //var nowstring = now.getFullYear()+"-"+now.getMonth()+"-"+now.getDate()+" "+now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
    //var msgwithdtime = nowstring+"|"+event.data;

      //broadcast to all client.
	  var msgudp = event.data;
      if(event.data != 'webstart'){
          //boardcast
           for(i=0;i<wsclients.length;i++){
            wsclients[i].send(msgudp);
           }
		   console.log(msgudp);
                 //save to db
        //		knex('sensor_data')
        // .insert([{sensor_id:'2',data:msgwithdtime,createdtime:nowstring}])
         //.then(function(ret){
         //   console.log(ret);
          //  console.log("db save success")
         //});

           // ws.send(event.data);
     // }

	}
});

    ws.on('close', function(event) {
      console.log('close', event.code, event.reason);
      ws = null;
    });
  }
});

wsserver.listen(3000,function(){
    console.log('websocket listening on *:3000');
});

exserver.listen(80, function(){
  console.log('http listening on *:80');

});
