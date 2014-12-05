var dgram = require('dgram');

var message = new Buffer(12);
message.writeUInt32BE(0x142A2357,0);
message.writeUInt32BE(0x68011A09,4);
message.writeUInt32BE(0x1E2A3907,8);

//var message = data;
var client = dgram.createSocket("udp4");
client.send(message, 0, message.length, 8080, "localhost", function(err, bytes) {
  client.close();
});