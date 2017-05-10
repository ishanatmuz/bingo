var GameSocket = {
	init: function(data) {
		// Connect to server for registering player
        data.socket = io.connect('/');
        
        data.socket.on('onconnected', function(serverData) {
            console.log('socket io connected');
            console.log(serverData);
            // TODO: Initialize player type, i.e. set X or O
            data.state.type = serverData.type;
            data.state.runningStatus = serverData.status;
            console.log(serverData.status);
            if (serverData.type === 'client') {
                data.state.turn = false;
            } else if (serverData.type === 'host') {
                data.state.turn = true;
            }
        });
        
        data.socket.on('opponent_connected', function() {
            console.log('opponent connected message');
            // Initializing new game by clearing old data
            data.state.input = {
                me: [],
                opponent: [],
            };
            data.state.runningStatus = 'ready';
            console.log(data.state.type);
            if (data.state.type === 'host') {
                data.state.turn = true;
            } else if (data.state.type === 'client') {
                data.state.turn = false;
            }
        });
        
        data.socket.on('opponent_disconnected', function() {
            console.log('opponent disconnected');
            // TODO Hang the game, show disconnect message, Show a button for refresh to start a new game
            alert('The other player disconnected');
            // Initializing new game by clearing old data
            data.state.input = {
                me: [],
                opponent: [],
            };
            data.state.runningStatus = 'waiting';
        });
        
        data.socket.on('opponent_input', function(serverData) {
            // TODO Store the opponent input
            console.log('opponent input received');
            data.state.input.opponent.push(serverData.input);
            
            data.state.runningStatus = serverData.result;
            if (serverData.result === 'ready') {
                // Setting player's turn to true
                data.state.turn = true;
            }
        });
        
        data.socket.on('result', function(result) {
            data.state.runningStatus = result;
        });
	}
};