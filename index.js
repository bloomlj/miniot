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
var knex = require('knex')({
  client: 'mysql',
  connection: {
    host     : '127.0.0.1',
    user     : 'root',
    password : 'password',
    database : 'lightiot'
  }
});

var sensormsg =  new Array();
//save  all ws clients.
var clients = new Array();
//gps position  format exchange.
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
               "servertime":"",
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
    
    var now=new Date() 
    var nowstring = now.getFullYear()+"-"+now.getMonth()+"-"+now.getDate()+" "+now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
    msg.servertime = nowstring;
    console.log(nowstring);
     
    clientmsg = msg.longitude.decimal+"|"+msg.latitude.decimal+"|"+msg.servertime;
    
    console.log(clientmsg);
    sensormsg.push(clientmsg);
    //now datetime

    
    var WSclient= new WebSocket.Client('ws://localhost:3000');

    WSclient.on('open', function(event) {
          console.log('open');
          WSclient.send(clientmsg);
          //ws.send('104.021|30.709');

          console.log('close');
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

server.bind(8080);




app.get('/', function(req, res){
   res.sendfile(__dirname + '/index_ems.html');
});

var wsserver = http.createServer();

var wsclients = new Array();
wsserver.on('upgrade', function(request, socket, body) {
  if (WebSocket.isWebSocket(request)) {
    var ws = new WebSocket(request, socket, body);
    wsclients.push(ws);
    ws.on('message', function(event) {
     
      //save  to db
    var now=new Date() 
    var nowstring = now.getFullYear()+"-"+now.getMonth()+"-"+now.getDate()+" "+now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
    var msgwithdtime = nowstring+"|"+event.data;

      //broadcast to all client.
      if(event.data != 'webstart'){
          //boardcast
           for(i=0;i<wsclients.length;i++){
            wsclients[i].send(msgwithdtime);
           }
                 //save to db
         knex('sensor_data')
         .insert([{sensor_id:'2',data:msgwithdtime,createdtime:nowstring}])
         .then(function(ret){
            console.log(ret);
            console.log("db save success")
         });

           // ws.send(event.data);
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
