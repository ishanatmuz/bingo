var Input = {
    init: function (data) {
        // Used to setup listeners for mouse, keyboard, gamepad etc..
        // Setup mouse click listener
        var self = this;
        data.canvas.addEventListener('click', function (event) {
            if (data.state.turn === true) {
                self.mouseClick(data, event);
            }
        });
        
        data.startButton.addEventListener('click', function(event) {
            GameSocket.requestStart(data);
        });
        
        data.newGameButton.addEventListener('click', function(event) {
            GameSocket.requestNewGame(data);
        });
    },
    
    update: function (data) {
        // Check for changes in input and update game state information accordingly
        // TODO Send input information to the server
    },
    
    mouseClick: function(data, event) {
        data.clickedCell = this.getClickedCell(data, event);
//        console.log('Clicked: cell [' + data.clickedCell.x + ', ' + data.clickedCell.y + ']');
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
        var position = this.getPointerPosition(data, event);
        position.x = Math.floor(position.x / 100);
        position.y = Math.floor(position.y / 100);
        return position;
    }
};
