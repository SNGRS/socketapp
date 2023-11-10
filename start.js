//import { print } from "pdf-to-printer";
//import { getPrinters } from "pdf-to-printer";

import pkg from 'pdf-to-printer';
const { getPrinters } = pkg;

const server = require('http').createServer();
const io = require('socket.io')(server);
io.on('connection', client => {
  client.on('event', data => { /* … */ });
  client.on('disconnect', () => { /* … */ });
});
server.listen(3000);
process.stdout.write("APP GESTART OP POORT 3000");
getPrinters().then(console.log);