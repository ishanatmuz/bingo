var Input = {
    init: function (data) {
        // Used to setup listeners for mouse, keyboard, gamepad etc..
        // Setup mouse click listener
        var self = this;
        data.canvas.addEventListener('click', function (event) {
            if (((data.playerType === 'host') && (data.state.msg === 'host_turn')) ||
                ((data.playerType === 'client') && (data.state.msg === 'client_turn'))) {
                self.mouseClick(data, event);
            }
        });
        
        data.startButton.addEventListener('click', function(event) {
            GameSocket.requestStart(data);
        });
        
        data.newGameButton.addEventListener('click', function(event) {
            GameSocket.requestNewGame(data);
        });
        
        // NOTE gamepadconnected and gamepaddisconnected are both useless events in chrome
        // Have to old school and do long polling
        // However this will not be old school to me as I have always done event handling in the past
        // So technically this is a new (even though inferior) technology to me
        data.gamepad = {};
        data.gamepad.buttons = [];
        data.gamepad.exists = false;
        data.gamepad.selectedCell = {x: 0, y: 0};
        // Initialized all buttons as depressed
        for (var i = 0; i <= 15; i++) {
            data.gamepad.buttons.push(false);
        }
    },
    
    update: function (data) {
        // Check for changes in input and update game state information accordingly
        // Only concerned with first gamepad
        data.gamepad.gamepad = navigator.getGamepads()[0];
        if (data.gamepad.gamepad) {
            // xpad connected
            if (data.gamepad.exists === false) {
                data.gamepad.exists = true;
            }

            // NOTE For Left Trigger / Right Trigger, this doesn't provides the value
            // NOTE For Left Stick / Right Stick, these provide presses and not movements
            for (var i = 0; i <= 15; i++) {
                if (data.gamepad.gamepad.buttons[i].pressed === true && data.gamepad.buttons[i] === false) {
                    data.gamepad.buttons[i] = true;
                }
                if (data.gamepad.gamepad.buttons[i].pressed === false && data.gamepad.buttons[i] === true) {
                    data.gamepad.buttons[i] = false;
                    this.gamepadInput(data, i);
                }
            }
        }
    },
    
    mouseClick: function(data, event) {
        var clickedCell = this.getClickedCell(data, event);
        this.sendSelection(data, clickedCell);
    },
    
    getPointerPosition: function(data, event) {
        var x;
        var y;
        if (event.pageX != undefined && event.pageY != undefined) {
            x = event.pageX;
            y = event.pageY;
        }
        else {
            x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        
        x -= data.canvas.offsetLeft;
        y -= data.canvas.offsetTop;
        
        return {
            x: x,
            y: y
        }
    },
    
    getClickedCell: function(data, event) {
        var cellWidth = (data.canvas.width / data.numRows);
        var position = this.getPointerPosition(data, event);
        position.x = Math.floor(position.x / cellWidth);
        position.y = Math.floor(position.y / cellWidth);
        return position;
    },
    
    gamepadInput: function(data, buttonIndex) {
        var buttonTypes = ['A', 'B', 'X', 'Y', 'Left Bummper', 'Right Bumper', 'Left Trigger', 'Right Trigger',
                                   'View', 'Menu', 'Left Stick', 'Right Stick', 'D-Up', 'D-Down', 'D-Left', 'D-Right'];
        console.log('xPad - ' + buttonTypes[buttonIndex]);
        // If this is the player's turn then poll for xpad input
        if (((data.playerType === 'host') && (data.state.msg === 'host_turn')) ||
                ((data.playerType === 'client') && (data.state.msg === 'client_turn'))) {
            switch(buttonTypes[buttonIndex]) {
                case 'A':
                case 'X':
                    console.log('Send selection ' + buttonTypes[buttonIndex]);
                    this.sendSelection(data, data.gamepad.selectedCell);
                    break;
                case 'D-Up':
                    console.log('Go up ' + buttonTypes[buttonIndex]);
                    console.log(data.gamepad.selectedCell);
                    data.gamepad.selectedCell.y -= 1;
                    if (data.gamepad.selectedCell.y < 0) {
                        data.gamepad.selectedCell.y = data.numRows - 1;
                    }
                    console.log(data.gamepad.selectedCell);
                    break;
                case 'D-Down':
                    console.log('Go down ' + buttonTypes[buttonIndex]);
                    console.log(data.gamepad.selectedCell);
                    data.gamepad.selectedCell.y += 1;
                    if (data.gamepad.selectedCell.y >= data.numRows) {
                        data.gamepad.selectedCell.y = 0;
                    }
                    console.log(data.gamepad.selectedCell);
                    break;
                case 'D-Left':
                    console.log(data.gamepad.selectedCell);
                    data.gamepad.selectedCell.x -= 1;
                    if (data.gamepad.selectedCell.x < 0) {
                        data.gamepad.selectedCell.x = data.numRows - 1;
                    }
                    console.log(data.gamepad.selectedCell);
                    console.log('Go left ' + buttonTypes[buttonIndex]);
                    break;
                case 'D-Right':
                    console.log(data.gamepad.selectedCell);
                    data.gamepad.selectedCell.x += 1;
                    if (data.gamepad.selectedCell.x >= data.numRows) {
                        data.gamepad.selectedCell.x = 0;
                    }
                    console.log(data.gamepad.selectedCell);
                    console.log('Go right ' + buttonTypes[buttonIndex]);
                    break;
            }
        }
        
        // Opponent has connected and waiting for the player to start
        if ((data.playerType === 'host' && data.state.client === 'available' && data.state.host === 'available') ||
            (data.playerType === 'client' && data.state.host === 'available' && data.state.client === 'available')) {
            if (buttonTypes[buttonIndex] === 'Menu') {
                GameSocket.requestStart(data);
            }
        }
        
        // New game message
        if ((data.state.msg === 'host_won') || (data.state.msg === 'client_won') || ((data.state.msg === 'draw'))) {
            GameSocket.requestNewGame(data);
        }
    },
    
    sendSelection: function(data, clickedCell) {
        console.log('sending selection');
        console.log(clickedCell);
        // TODO Check for number value as selected
        // Get number value from clickedCell as below
        GameSocket.sendSelection(data, data.board[clickedCell.y][clickedCell.x]);
    }
};
