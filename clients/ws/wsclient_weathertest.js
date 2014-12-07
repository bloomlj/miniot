var WebSocket = require('faye-websocket'),
    ws        = new WebSocket.Client('ws://localhost:3000');

ws.on('open', function(event) {
  console.log('open');
  //dataformat:温度|湿度|紫外线|PM25|PM10
  ws.send('21|30|15|60|40');
  console.log('close');
  ws.close();
  
});

//ws.on('message', function(event) {
//  console.log('message', event.data);
//});
//
//ws.on('close', function(event) {
//  console.log('close', event.code, event.reason);
//  ws = null;
//});