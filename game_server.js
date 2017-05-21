var _ = require('underscore');

// Number of rows in the board
var numRows = 5;
var gameServer = module.exports = {};
gameServer.rooms = [];

// Generating winning combinations based on numRows
var winningCombinations = [];
var generateWinningCombinations = function() {
    // Two diagonals
    var diagonal1 = [];
    var diagonal2 = [];
    // Horizontal and Vertical lines
    for (var i = 0; i < numRows; i++) {
        var row = [];
        var col = [];
        for (var j = 0; j < numRows; j++) {
            row.push({
                x: j,
                y: i
            });
            col.push({
                x: i,
                y: j
            });
        }
        winningCombinations.push(row);
        winningCombinations.push(col);

        diagonal1.push({
            x: i,
            y: i
        });
        diagonal2.push({
            x: numRows - i - 1,
            y: i
        });
    }
    winningCombinations.push(diagonal1);
    winningCombinations.push(diagonal2);
};
generateWinningCombinations();

// Helper function to get the room from rooms list
var getRoom = function(roomId) {
    // Find room
    var room = _.find(gameServer.rooms, function(item) {
        return item.id === roomId;
    });
    // If room doesn't exists create one
    if (_.isUndefined(room)) {
        gameServer.rooms.push({
            id: roomId
        });
    };
    // Find room again
    room = _.find(gameServer.rooms, function(item) {
        return item.id === roomId;
    });
    return room;
}

gameServer.joinRoom = function(roomId) {
    var room = getRoom(roomId);
    // Create game if it doesn't exists
    if (!_.has(room, 'game')) {
        room.game = {};
        room.game.state = room.game.state || {};
    }
};

gameServer.insertClient = function(roomId, player) {
    winston.log('debug', 'insertClient ' + roomId + ' ' + player.type);
    var room = getRoom(roomId);
    var game = room.game;
    if (!_.has(game, 'host')) {
        game.host = player;
        return {
            type: 'host'
        }
    }
    
    if (!_.has(game, 'client')) {
        game.client = player;
        
        return {
            type: 'client'
        }
    }
    
    return {
        type: null
    }
};

gameServer.removeClient = function(roomId, player) {
    winston.log('debug', 'removeClient ' + roomId + ' ' + player.type);
    if (player.type === null) {
        return;
    }
    var room = getRoom(roomId);
    delete room.game[player.type];
    
    if (player.type === 'host') {
        room.game.state.host = 'unavailable';
    } else if (player.type === 'client') {
        room.game.state.client = 'unavailable';
    }
};

// Helper function which generates the possible list of inputs / numbers
var generatePossibleInputs = function() {
    var possibleInputs = [];
    for (var i = 1; i <= numRows * numRows; i++) {
        possibleInputs.push(i);
    }
    return possibleInputs;
};

// Helper function to create a board with randomly filled numbers
var createBoard = function() {
    // List of all possible inputs / numbers
    var possibleInputs = generatePossibleInputs();
    // Blank board
    var board = [];
    for (var i = 0; i < numRows; i++) {
        board.push([]);
        for (var j = 0; j < numRows; j++) {
            // Insert a random nummber on the board
            board[i].push(possibleInputs[Math.floor(Math.random() * possibleInputs.length)]);
            var position = possibleInputs.indexOf(board[i][j]);
            // Remove the inserted number from the list of possible inputs / numbers to avoid duplication
            possibleInputs.splice(position, 1);
        }
    }
    return board;
};

// Initialize all variables for the room
gameServer.initializeGame = function(roomId) {
    var room = getRoom(roomId);
    
    room.game.numRows = numRows;
    // List of all selections made by the players
    room.game.selections = [];
    // Randomly generated board for the two players
    room.game.boards = {};
    room.game.boards.host = createBoard();
    room.game.boards.client = createBoard();
    // Board blue print is the selections made by the two players
    room.game.boardBluePrint = {};
    room.game.boardBluePrint.host = [];
    room.game.boardBluePrint.client = [];
    // State indicates the state in which game is, i.e. host_won, client_won, draw, waiting etc..
    room.game.state = {};
    room.game.state.msg = 'waiting';
    room.game.state.host = _.has(room.game, 'host') ? 'available' : 'unavailable';
    room.game.state.client = _.has(room.game, 'client') ? 'available' : 'unavailable';
    room.game.hostScore = 0;
    room.game.clientScore = 0;
};

// Update the state if players wants to start the game
gameServer.startGame = function(roomId, player) {
    winston.log('debug', 'startGame ' + roomId + ' ' + player.type);
    var room = getRoom(roomId);
    // Setting player state as started
    if (player.type === 'host') {
        room.game.state.host = 'started';
    } else if (player.type === 'client') {
        room.game.state.client = 'started';
    }
    
    // Starting with host_turn
    if (room.game.state.host === 'started' &&
        room.game.state.client === 'started' &&
        room.game.state.msg === 'waiting') {
        room.game.state.msg = 'host_turn';
    }
}

// Update state to reflect the game has ended
gameServer.endGame = function(roomId) {
    var room = getRoom(roomId);
    room.game.state.msg = 'end';
};

// Process a selection made by the player
gameServer.playerInput = function(roomId, player, inputNumber) {
    winston.log('debug', 'Player input ' + roomId + ' ' + player.type);
    var room = getRoom(roomId);
    // Check if input is valid
    if ((inputNumber > 0) && (inputNumber <= numRows * numRows)) {
        // Check if number is already clicked
        var result = _.find(room.game.selections, function(number) {
            return number === inputNumber;
        });
        // If number is not already clicked
        if (_.isUndefined(result)) {
            // Store newly clicked number information
            room.game.selections.push(inputNumber);
            // Store the board blueprint for host player
            for (var i = 0; i < numRows; i++) {
                for (var j = 0; j < numRows; j++) {
                    if (inputNumber === room.game.boards.host[i][j]) {
                        room.game.boardBluePrint.host.push({
                            x: i,
                            y: j
                        });
                        break;
                    }
                }
            }
            
            // Store the board blueprint for client player
            for (var i = 0; i < numRows; i++) {
                for (var j = 0; j < numRows; j++) {
                    if (inputNumber === room.game.boards.client[i][j]) {
                        room.game.boardBluePrint.client.push({
                            x: i,
                            y: j
                        });
                        break;
                    }
                }
            }
            
            // Change the turn
            if (room.game.state.msg === 'host_turn') {
                room.game.state.msg = 'client_turn';
            } else if (room.game.state.msg === 'client_turn') {
                room.game.state.msg = 'host_turn';
            }
        }
    }
};

// Helper function to check the result of the game
gameServer.checkResult = function(roomId) {
    var room = getRoom(roomId);
    
    // Helper function to check if all the needles exist in the haystack
    var containsAll = function(needles, haystack){ 
        var results = 0;
        for(var i = 0 , len = needles.length; i < len; i++){
            for(var j = 0, jlen = haystack.length; j < jlen; j++) {
                if ((haystack[j].x === needles[i].x) && (haystack[j].y === needles[i].y)) {
                    results += 1;
                }
            }
        }
        return results === needles.length;
    };
    var hostWin = false;
    var clientWin = false;
    
    // Check for host win
    var hostScore = 0;
    _.each(winningCombinations, function(combination) {
        if (containsAll(combination, room.game.boardBluePrint.host) === true) {
            hostScore += 1;
        }
    });
    hostWin = hostScore === numRows;
    room.game.hostScore =  hostScore;
    winston.log('debug', 'HostWin ' + hostWin);
    winston.log('debug', 'HostScore ' + hostScore);
    winston.log('debug', 'Host board :' + room.game.boards.host);
    winston.log('debug', room.game.boards.host);
    winston.log('debug', 'Host board blueprint ' + room.game.boardBluePrint.host);
    winston.log('debug', room.game.boardBluePrint.host);

    // Check for client win
    var clientScore = 0;
    _.each(winningCombinations, function(combination) {
        if(containsAll(combination, room.game.boardBluePrint.client) === true) {
            clientScore += 1;
        }
    });
    clientWin = clientScore === numRows;
    room.game.clientScore = clientScore;
    winston.log('debug', 'ClientWin ' + clientWin);
    winston.log('debug', 'clientScore ' + clientScore);
    winston.log('debug', 'Client board :');
    winston.log('debug', room.game.boards.client);
    winston.log('debug', 'Client board blueprint :');
    winston.log('debug',  room.game.boardBluePrint.client)
    
    // If both completed at the same time game is draw
    if (hostWin === true && clientWin === true) {
        room.game.state.msg = 'draw';
    } else {
        if (hostWin === true) {
            room.game.state.msg = 'host_won';
        } else if (clientWin === true) {
            room.game.state.msg = 'client_won';
        }
    }
    winston.log('debug', 'Match state ' + room.game.state.msg);
};

// Send the game state to the player
gameServer.broadcastToPlayer = function(roomId, playerType) {
    var room = getRoom(roomId);
    
    if (playerType === 'host') {
        // Emit the state to host
        if (_.has(room.game, 'host')) {
            room.game.host.emit('game-state', {
                room: room.id,
                numRows: room.game.numRows,
                playerType: 'host',
                selections: room.game.selections,
                board: room.game.boards.host,
                state: room.game.state,
                score: room.game.hostScore
            });
        }
    }
    
    if (playerType === 'client') {
        // Emit the state to client
        if (_.has(room.game, 'client')) {
            room.game.client.emit('game-state', {
                room: room.id,
                numRows: room.game.numRows,
                playerType: 'client',
                selections: room.game.selections,
                board: room.game.boards.client,
                state: room.game.state,
                score: room.game.clientScore
            });
        }
    }
};

// Send the game state to both the connected players
gameServer.broadcastGame = function(roomId) {
    var room = getRoom(roomId);
    winston.log('debug', 'broadcasting game to players ' + roomId);
    
    // Check result
    gameServer.checkResult(roomId);
    
    // Broadcast to host
    gameServer.broadcastToPlayer(roomId, 'host');
    
    // Broadcast to client
    gameServer.broadcastToPlayer(roomId, 'client');
};
