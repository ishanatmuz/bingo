var _ = require('underscore');
var gameServer = module.exports = {};

var numRows = 5;
//var winningCombinations = [
//    [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}], // Top Row
//    [{x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1}], // Middle Row
//    [{x: 0, y: 2}, {x: 1, y: 2}, {x: 2, y: 2}], // Bottom Row
//    [{x: 0, y: 0}, {x: 0, y: 1}, {x: 0, y: 2}], // First Column
//    [{x: 1, y: 0}, {x: 1, y: 1}, {x: 1, y: 2}], // Second Column
//    [{x: 2, y: 0}, {x: 2, y: 1}, {x: 2, y: 2}], // Third Column
//    [{x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 2}], // Diagonal 1
//    [{x: 0, y: 2}, {x: 1, y: 1}, {x: 2, y: 0}], // Diagonal 1
//];

gameServer.game = gameServer.game || {};
gameServer.game.state = gameServer.game.state || {};

gameServer.insertClient = function(player) {
    if (!_.has(gameServer.game, 'host')) {
        gameServer.game.host = player;
        return {
            type: 'host'
        }
    }
    
    if (!_.has(gameServer.game, 'client')) {
        console.log('setting client');
        gameServer.game.client = player;
        
        return {
            type: 'client'
        }
    }
    
    return {
        type: null
    }
};

gameServer.removeClient = function(player) {
    if (player.type === null) {
        return;
    }
    delete gameServer.game[player.type];
};

var generatePossibleInputs = function() {
    var possibleInputs = [];
    for (var i = 1; i <= numRows * numRows; i++) {
        possibleInputs.push(i);
    }
    return possibleInputs;
};

var createBoard = function() {
    var possibleInputs = generatePossibleInputs();
    var board = [];
    for (var i = 0; i < numRows; i++) {
        board.push([]);
        for (var j = 0; j < numRows; j++) {
            board[i].push(possibleInputs[Math.floor(Math.random() * possibleInputs.length)]);
            var position = possibleInputs.indexOf(board[i][j]);
            possibleInputs.splice(position, 1);
        }
    }
    return board;
};

gameServer.initializeGame = function() {
    gameServer.game.numRows = numRows;
    gameServer.game.selections = [];
    gameServer.game.boards = {};
    gameServer.game.boards.host = createBoard();
    gameServer.game.boards.client = createBoard();
    gameServer.game.state = {};
    gameServer.game.state.msg = 'waiting';
    gameServer.game.state.host = _.has(gameServer.game, 'host') ? 'available' : 'unavailable';
    gameServer.game.state.client = _.has(gameServer.game, 'client') ? 'available' : 'unavailable';
};

gameServer.startGame = function(player) {
    // Setting player state as started
    if (player.type === 'host') {
        gameServer.game.state.host = 'started';
    } else if (player.type === 'client') {
        gameServer.game.state.client = 'started';
    }
    
    // Starting with host_turn
    if (gameServer.game.state.host === 'started' &&
        gameServer.game.state.client === 'started' &&
        gameServer.game.state.msg === 'waiting') {
        gameServer.game.state.msg = 'host_turn';
    }
}

gameServer.endGame = function() {
    gameServer.game.state.msg = 'end';
};

gameServer.playerInput = function(player, inputNumber) {
    // Check if input is valid
    if ((inputNumber > 0) && (inputNumber <= numRows * numRows)) {
        // Check if number is already clicked
        var result = _.find(gameServer.game.selections, function(number) {
            return number === inputNumber;
        });
        // If number is not already clicked
        if (_.isUndefined(result)) {
            // Store newly clicked number information
            gameServer.game.selections.push(inputNumber);
            
            // Change the turn
            if (gameServer.game.state.msg === 'host_turn') {
                gameServer.game.state.msg = 'client_turn';
            } else if (gameServer.game.state.msg === 'client_turn') {
                gameServer.game.state.msg = 'host_turn';
            }
        }
    }
};

//gameServer.getResult = function() {
//    console.log('calculating result');
//    var containsAll = function(needles, haystack){ 
//        var results = 0;
//        for(var i = 0 , len = needles.length; i < len; i++){
//            for(var j = 0, jlen = haystack.length; j < jlen; j++) {
//                if ((haystack[j].x === needles[i].x) && (haystack[j].y === needles[i].y)) {
//                    results += 1;
//                }
//            }
//        }
//        return results === needles.length;
//    };
//    var hostWin = false;
//    var clientWin = false;
//    
//    // Check for host win
//    hostWin = _.find(winningCombinations, function(combination) {
//        return containsAll(combination, gameServer.game.input.host) === true;
//    });
//    hostWin = !_.isUndefined(hostWin);
//    
//    if (hostWin === true) {
//        gameServer.announceResult('host_won');
//        return 'host_won';
//    }
//    
//    // Check for client win
//    clientWin = _.find(winningCombinations, function(combination) {
//        return containsAll(combination, gameServer.game.input.client) === true;
//    });
//    clientWin = !_.isUndefined(clientWin);
//    if (clientWin === true) {
//        gameServer.announceResult('client_won');
//        return 'client_won';
//    }
//    
//    // Check for draw
//    if ((gameServer.game.input.client.length + gameServer.game.input.host.length) === 9) {
//        gameServer.announceResult('draw');
//        return 'draw';
//    }
//    
//    // Game is still going on
//    return 'ready';
//};

gameServer.broadcastGame = function() {
    // TODO Check for winner
    
    // Emit the state to host
    if (_.has(gameServer.game, 'host')) {
        gameServer.game.host.emit('game-state', {
            numRows: gameServer.game.numRows,
            playerType: 'host',
            selections: gameServer.game.selections,
            board: gameServer.game.boards.host,
            state: gameServer.game.state
        });
    }
    
    // Emit the state to client
    if (_.has(gameServer.game, 'client')) {
        gameServer.game.client.emit('game-state', {
            numRows: gameServer.game.numRows,
            playerType: 'client',
            selections: gameServer.game.selections,
            board: gameServer.game.boards.client,
            state: gameServer.game.state
        });
    }
};
