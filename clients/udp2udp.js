var dgram = require('dgram');

var message = new Buffer('{"ID":"001","Light":"750","Sound":"30","Temp":"461"}');
//var message = data;
var client = dgram.createSocket("udp4");
client.send(message, 0, message.length, 8080, "localhost", function(err, bytes) {
  client.close();
});