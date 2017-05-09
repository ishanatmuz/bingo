var _ = require('underscore');
var gameServer = module.exports = {};

gameServer.game = gameServer.game || {};

gameServer.insertClient = function(player) {
    if (!_.has(gameServer.game, 'host')) {
        gameServer.game.host = player;
        var status = gameServer.startGame();
        
        // Sending opponent connected message to the client
        if (_.has(gameServer.game, 'client')) {
            gameServer.game.client.emit('opponent_connected');
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
    gameServer.game.score = 0;
    gameServer.game.input = {};
    gameServer.game.input.host = [];
    gameServer.game.input.client = [];
};

gameServer.endGame = function() {
    console.log('Game ended, send the other user game status');
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
            gameServer.game.client.emit('opponent_input', inputCell);
        } else {
            gameServer.game.input.client.push(inputCell);
            // Sending the input to host player
            gameServer.game.host.emit('opponent_input', inputCell);
        }
    }
};
