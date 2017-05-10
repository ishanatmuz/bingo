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

console.log('Bazinga game server listening on port ' + gameport);

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.use('/static', expres.static('static'));

gameServer = require('./game_server.js');

sio.on('connection', function(client) {
    // Generate and allot a new UUID to client
    client.userid = UUID();
    
    // Insert the player
    var result = gameServer.insertClient(client);
    client.type = result.type;
    
    // Send the player their information
    client.emit('onconnected', {
        id: client.userid,
        playerType: client.type,
    });
    
    // Initialize the game
    gameServer.initializeGame();
    
    // Broadcast game
    gameServer.broadcastGame();
    
    // When player disconnects
    client.on('disconnect', function() {
        // Remove the client
        gameServer.removeClient(client);

        // End the game
        gameServer.endGame();
        
        // Broadcast game
        gameServer.broadcastGame();
        
    });
    
    // When player intends to start game
    client.on('start', function() {
        // Start game by player
        gameServer.startGame(client);
        
        // Broadcast game
        gameServer.broadcastGame();
    });
    
    // When player clicks on a cell
    client.on('player_input', function(number) {
        // Store player input
        gameServer.playerInput(client, number);
        
        // Brodcast game
        gameServer.broadcastGame();
    });
    
    // When player requests a new game
    client.on('new-game', function() {
        // Request a new game with same players
        gameServer.initializeGame(client);
        
        // Broadcast game
        gameServer.broadcastGame();
    });
});
