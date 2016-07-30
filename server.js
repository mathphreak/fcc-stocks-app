/* eslint babel/new-cap: 0 */

'use strict';

var httpMod = require('http');
var express = require('express');
var socketio = require('socket.io');

var routes = require('./app/routes/index.js');

var app = express();
var http = httpMod.Server(app);
var io = socketio(http);

app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/common', express.static(process.cwd() + '/app/common'));

routes(app, io);

var port = process.env.PORT || 8080;
http.listen(port, function () {
  console.log('Node.js listening on port ' + port + '...');
});
