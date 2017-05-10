var _ = require('underscore');
var gameServer = module.exports = {};

var winningCombinations = [
    [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}], // Top Row
    [{x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1}], // Middle Row
    [{x: 0, y: 2}, {x: 1, y: 2}, {x: 2, y: 2}], // Bottom Row
    [{x: 0, y: 0}, {x: 0, y: 1}, {x: 0, y: 2}], // First Column
    [{x: 1, y: 0}, {x: 1, y: 1}, {x: 1, y: 2}], // Second Column
    [{x: 2, y: 0}, {x: 2, y: 1}, {x: 2, y: 2}], // Third Column
    [{x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 2}], // Diagonal 1
    [{x: 0, y: 2}, {x: 1, y: 1}, {x: 2, y: 0}], // Diagonal 1
];

gameServer.game = gameServer.game || {};

gameServer.insertClient = function(player) {
    if (!_.has(gameServer.game, 'host')) {
        gameServer.game.host = player;
        var status = gameServer.startGame();
        
        // Sending opponent connected message to the client
        if (_.has(gameServer.game, 'client')) {
            gameServer.game.client.emit('opponent_connected');
            gameServer.startGame();
        }
        
        return {
            type: 'host',
            status: status
        }
    }
    
    if (!_.has(gameServer.game, 'client')) {
        gameServer.game.client = player;
        var status = gameServer.startGame();
        
        // Sending opponent connected message to the host
        if (_.has(gameServer.game, 'host')) {
            gameServer.game.host.emit('opponent_connected');
            gameServer.startGame();
        }
        
        return {
            type: 'client',
            status: status
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
    gameServer.endGame();
};

gameServer.startGame = function() {
    if (_.has(gameServer.game, 'host') && _.has(gameServer.game, 'client')) {
        gameServer.initializeGame();
        return 'ready';
    } else {
        return 'waiting';
    }
};

gameServer.initializeGame = function() {
    // gameServer.game.score = 0;
    gameServer.game.input = {};
    gameServer.game.input.host = [];
    gameServer.game.input.client = [];
};

gameServer.endGame = function() {
    console.log('Game ended, send the other user game status');
    gameServer.initializeGame();
};

gameServer.playerInput = function(player, inputCell) {
    // Check if cell is already clicked
    var result = _.find(gameServer.game.input.host.concat(gameServer.game.input.client), function(cell) {
        return cell.x === inputCell.x && cell.y === inputCell.y;
    });
    // Storing clicked cell information
    if (_.isUndefined(result)) {
        if (player.type === 'host') {
            gameServer.game.input.host.push(inputCell);
            // Sending the input to client player
            gameServer.game.client.emit('opponent_input', {
                input: inputCell,
                result: gameServer.getResult()
            });
        } else {
            gameServer.game.input.client.push(inputCell);
            // Sending the input to host player
            gameServer.game.host.emit('opponent_input', {
                input: inputCell,
                result: gameServer.getResult()
            });
        }
    }
};

gameServer.getResult = function() {
    console.log('calculating result');
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
        return containsAll(combination, gameServer.game.input.host) === true;
    });
    hostWin = !_.isUndefined(hostWin);
    
    if (hostWin === true) {
        gameServer.announceResult('host_won');
        return 'host_won';
    }
    
    // Check for client win
    clientWin = _.find(winningCombinations, function(combination) {
        return containsAll(combination, gameServer.game.input.client) === true;
    });
    clientWin = !_.isUndefined(clientWin);
    if (clientWin === true) {
        gameServer.announceResult('client_won');
        return 'client_won';
    }
    
    // Check for draw
    if ((gameServer.game.input.client.length + gameServer.game.input.host.length) === 9) {
        gameServer.announceResult('draw');
        return 'draw';
    }
    
    // Game is still going on
    return 'ready';
};

gameServer.announceResult = function(result) {
    gameServer.game.client.emit('result', result);
    gameServer.game.host.emit('result', result);
};
