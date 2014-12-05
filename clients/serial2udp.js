var dgram = require('dgram');
var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("COM5", {
  baudrate: 38400
});

serialPort.on("open", function () {
  console.log('open');
  serialPort.on('data', function(data) {
    console.log('data received: ' + data);
      
    //var message = new Buffer('{"ID":"001","Light":"750","Sound":"30","Temp":"461"}');
    var message = data;
    var client = dgram.createSocket("udp4");
    client.send(message, 0, message.length, 8080, "localhost", function(err, bytes) {
      client.close();
    });
      
  });
  serialPort.write("ls\n", function(err, results) {
    console.log('err ' + err);
    console.log('results ' + results);
  });
});


