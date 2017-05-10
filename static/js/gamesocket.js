var GameSocket = {
	init: function(data) {
		// Connect to server for registering player
        data.socket = io.connect('/');
        
        data.socket.on('onconnected', function(serverData) {
            console.log('socket io connected');
            console.log(serverData);
            // Initialize player type, i.e. host or client
            data.state.playerType = serverData.playerType;
            data.state.id = serverData.id;
        });
        
        data.socket.on('game-state', function(serverData) {
            console.log('on game state');
            console.log(serverData);
            data.numRows = serverData.numRows;
            data.playerType = serverData.playerType;
            data.selections = serverData.selections;
            data.board = serverData.board;
            data.state = serverData.state;
        });
	},
    
    requestStart: function(data) {
        data.socket.emit('start');
    },
    
    requestNewGame: function(data) {
        data.socket.emit('new-game');
    }
};