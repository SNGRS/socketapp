
const { WebSocketServer } = require("ws");

const wss = new WebSocketServer({ port: 3636 });

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log('received: %s', data);
    ws.send('terug: %s', data)
  });

  ws.send('something');
});