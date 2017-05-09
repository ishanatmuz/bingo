var _ = require('underscore');
const UUID = require('uuid/v4');
var http = require('http');
var expres = require('express');
var app = expres();
var server = http.Server(app);
var io = require('socket.io');

// Create a socket.io instance uisng our express server
var sio = io.listen(server);
var gameport = process.env.PORT || 8000;

server.listen(gameport);

console.log('Tic Tac Toe app listening of port 8000!');

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.use('/static', expres.static('static'));

gameServer = require('./game_server.js');

sio.on('connection', function(client) {
    // Generate and allot a new UUID to client
    client.userid = UUID();
    
    var result = gameServer.insertClient(client);
    client.type = result.type;
    
    // Send the client their information
    client.emit('onconnected', {
        id: client.userid,
        type: client.type
    });
    
    // When client disconnects, remove the client and end the game emitting an end-game message
    client.on('disconnect', function() {
        gameServer.removeClient(client);
        if (client.type === 'host') {
            if (_.has(gameServer.game, 'client')) {
                gameServer.game.client.emit('opponent_disconnected');
            }
        } else {
            if (_.has(gameServer.game, 'host')) {
                gameServer.game.host.emit('opponent_disconnected');
            }
        }
    });
    
    // When player clicks on a cell
    client.on('player_input', function(data) {
        gameServer.playerInput(client, data);
    });
});
