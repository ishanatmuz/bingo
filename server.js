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
	res.sendFile(__dirname + '/room.html');
});

app.use('/static', expres.static('static'));

gameServer = require('./game_server.js');

sio.on('connection', function(client) {
    // Generate and allot a new UUID to client
    client.userid = UUID();
    
    // Connect to room
    client.on('connect-room', function(roomId) {
        // Create empty room
        gameServer.joinRoom(roomId);
        
        // Attach roomId to the client
        client.roomId = roomId;
        
        // Insert the player
        var result = gameServer.insertClient(roomId, client);
        client.type = result.type;
        
        // Initialize the game
        gameServer.initializeGame(roomId);

        // Broadcast game
        gameServer.broadcastGame(roomId);
    });
    
    // Send the player their information
    client.emit('onconnected', {
        id: client.userid
    });
    
    // When player disconnects
    client.on('disconnect', function() {
        // If client has a room remove client from the room
        if (_.has(client, 'roomId')) {
            // Remove the client
            gameServer.removeClient(client.roomId, client);

            // End the game
            gameServer.endGame(client.roomId);

            // Broadcast game
            gameServer.broadcastGame(client.roomId);
        }
    });
    
    // When player intends to start game
    client.on('start', function() {
        // Start game by player
        gameServer.startGame(client.roomId, client);
        
        // Broadcast game
        gameServer.broadcastGame(client.roomId);
    });
    
    // When player clicks on a cell
    client.on('player_input', function(number) {
        // Store player input
        gameServer.playerInput(client.roomId, client, number);
        
        // Brodcast game
        gameServer.broadcastGame(client.roomId);
    });
    
    // When player requests a new game
    client.on('new-game', function() {
        // Request a new game with same players
        gameServer.initializeGame(client.roomId);
        
        // Broadcast game
        gameServer.broadcastGame(client.roomId);
    });
});
