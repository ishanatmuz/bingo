var _ = require('underscore');
var gameServer = module.exports = {};

var numRows = 8;
var winningCombinations = [];

gameServer.game = gameServer.game || {};
gameServer.game.state = gameServer.game.state || {};

var generateWinningCombinations = function() {
    var diagonal1 = [];
    var diagonal2 = [];
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

gameServer.insertClient = function(player) {
    if (!_.has(gameServer.game, 'host')) {
        gameServer.game.host = player;
        return {
            type: 'host'
        }
    }
    
    if (!_.has(gameServer.game, 'client')) {
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
    
    if (player.type === 'host') {
        gameServer.game.state.host = 'unavailable';
    } else if (player.type === 'client') {
        gameServer.game.state.client = 'unavailable';
    }
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
    gameServer.game.boardBluePrint = {};
    gameServer.game.boardBluePrint.host = [];
    gameServer.game.boardBluePrint.client = [];
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
            // Store the board blueprint for host player
            for (var i = 0; i < numRows; i++) {
                for (var j = 0; j < numRows; j++) {
                    if (inputNumber === gameServer.game.boards.host[i][j]) {
                        gameServer.game.boardBluePrint.host.push({
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
                    if (inputNumber === gameServer.game.boards.client[i][j]) {
                        gameServer.game.boardBluePrint.client.push({
                            x: i,
                            y: j
                        });
                        break;
                    }
                }
            }
            
            // Change the turn
            if (gameServer.game.state.msg === 'host_turn') {
                gameServer.game.state.msg = 'client_turn';
            } else if (gameServer.game.state.msg === 'client_turn') {
                gameServer.game.state.msg = 'host_turn';
            }
        }
    }
};

gameServer.checkResult = function() {
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
    hostWin = _.find(winningCombinations, function(combination) {
        return containsAll(combination, gameServer.game.boardBluePrint.host) === true;
    });
    hostWin = !_.isUndefined(hostWin);
    
    // Check for client win
    clientWin = _.find(winningCombinations, function(combination) {
        return containsAll(combination, gameServer.game.boardBluePrint.client) === true;
    });
    clientWin = !_.isUndefined(clientWin);
    
    // If both completed at the same time game is draw
    if (hostWin === true && clientWin === true) {
        gameServer.game.state.msg = 'draw';
    } else {
        if (hostWin === true) {
            gameServer.game.state.msg = 'host_won';
        } else if (clientWin === true) {
            gameServer.game.state.msg = 'client_won';
        }
    }
};

gameServer.broadcastToPlayer = function(playerType) {
    if (playerType === 'host') {
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
    }
    
    if (playerType === 'client') {
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
    }
};

gameServer.broadcastGame = function() {
    // Check result
    gameServer.checkResult();
    
    // Broadcast to host
    gameServer.broadcastToPlayer('host');
    
    // Broadcast to client
    gameServer.broadcastToPlayer('client');
};
