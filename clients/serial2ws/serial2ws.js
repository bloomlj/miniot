//var dgram = require('dgram');
var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("COM6", {
  baudrate: 38400
});

var WebSocket = require('faye-websocket');

serialPort.on("open", function () {
  console.log('open');
  serialPort.on('data', function(data) {
    console.log('data received: ' + data);
      var ws = new WebSocket.Client('ws://localhost:3000')
      ws.on('open', function(event) {
          console.log('openws');
          console.log(data.toString());
          ws.send(data.toString());
          console.log('wsclose');
          ws.close();
        });
      
  });
    
  serialPort.write("ls\n", function(err, results) {
    console.log('err ' + err);
    console.log('results ' + results);
  });
});


