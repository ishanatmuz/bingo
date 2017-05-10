var Renderer = {
    init: function(data) {
        // Used to draw one time things
//        var bgCtx = data.bgCtx;
//        bgCtx.beginPath();
//        bgCtx.moveTo(100, 0);
//        bgCtx.lineTo(100, 300);
//        bgCtx.moveTo(200, 0);
//        bgCtx.lineTo(200, 300);
//        bgCtx.moveTo(0, 100);
//        bgCtx.lineTo(300, 100);
//        bgCtx.moveTo(0, 200);
//        bgCtx.lineTo(300, 200);
//        bgCtx.stroke();
    },
    
    update: function(data) {
        // Used to re draw/display things
        // Clear Canvas
        data.ctx.clearRect(0, 0, data.canvas.width, data.canvas.height);
        
        // Waiting
        if (data.state.msg === 'waiting') {
            // Opponent hasn't connected
            if ((data.playerType === 'host' && data.state.client === 'unavailable') ||
                (data.playerType === 'client' && data.state.host === 'unavailable')) {
                data.waiting.innerText = 'Waiting for opponent to join...';
                data.waiting.classList.remove('hide');
                data.start.classList.add('hide');
                data.canvas.classList.add('hide');
                data.result.classList.add('hide');
            }
            
            // Opponent has connected
            if ((data.playerType === 'host' && data.state.client === 'available' && data.state.host === 'available') ||
                (data.playerType === 'client' && data.state.host === 'available' && data.state.client === 'available')) {
                data.waiting.classList.add('hide');
                data.start.classList.remove('hide');
                data.canvas.classList.add('hide');
                data.result.classList.add('hide');
            }
            
            // Player and opponent has started
            if (((data.playerType === 'host') && (data.state.host === 'started') && (data.state.client === 'available')) ||
                ((data.playerType === 'client') && (data.state.client === 'started') && (data.state.host === 'available'))) {
                data.waiting.innerText = 'Waiting for opponent to start...';
                data.waiting.classList.remove('hide');
                data.start.classList.add('hide');
                data.canvas.classList.add('hide');
                data.result.classList.add('hide');
            }
        }
        
        // Player turn
        if (data.state.msg === 'host_turn' || data.state.msg === 'client_turn') {
            data.waiting.classList.add('hide');
            data.start.classList.add('hide');
            data.canvas.classList.remove('hide');
            data.result.classList.add('hide');
            
            this.drawCanvas(data);
        }
        
        // Match result
        if (data.state.msg === 'host_won') {
            data.waiting.classList.add('hide');
            data.start.classList.add('hide');
            data.canvas.classList.add('hide');
            if (data.playerType === 'host') {
                data.resultMsg.innerText = 'You Won';
            }
            if (data.playerType === 'client') {
                data.resultMsg.innerText = 'You Lost';
            }
            data.result.classList.remove('hide');
        }
        if (data.state.msg === 'client_won') {
            data.waiting.classList.add('hide');
            data.start.classList.add('hide');
            data.canvas.classList.add('hide');
            if (data.playerType === 'client') {
                data.resultMsg.innerText = 'You Won';
            }
            if (data.playerType === 'host') {
                data.resultMsg.innerText = 'You Lost';
            }
            data.result.classList.remove('hide');
        }
        if (data.state.msg === 'draw') {
            data.waiting.classList.add('hide');
            data.start.classList.add('hide');
            data.canvas.classList.add('hide');
            data.resultMsg.innerText = 'Match Draw';
            data.result.classList.remove('hide');
        }
    },
    
    drawCanvas: function(data) {
        // Draw grid
        this.drawGrid(data);
        // Draw board
        for (var i = 0; i < data.numRows; i++) {
            for (var j = 0; j < data.numRows; j++) {
                var number = data.board[i][j];
                // Draw number
                this.drawNumber(data, number, i, j);
                // Draw selection cross
                if (data.selections.indexOf(number) !== -1) {
                    this.drawCross(data, i, j);
                }
            }
        }
    },
    
    drawGrid: function(data) {
        for (var i = 0; i < data.numRows; i++) {
            // Vertical line
            data.ctx.beginPath();
            data.ctx.moveTo((300 / data.numRows) * (i + 1), 0);
            data.ctx.lineTo((300 / data.numRows) * (i + 1), 300);
            data.ctx.stroke();
            
            // Horizontal line
            data.ctx.beginPath();
            data.ctx.moveTo(0, (300 / data.numRows) * (i + 1));
            data.ctx.lineTo(300, (300 / data.numRows) * (i + 1));
            data.ctx.stroke();
            
        }
    },
    
    drawNumber: function(data, number, x, y) {
        data.ctx.font = '40px serif';
        var xOffset = 10;
        if (number < 10) {
            xOffset = 20;
        }
        data.ctx.fillText('' + number, (y * 60) + xOffset, ((x + 1) * 60) - 15);
    },
    
    drawCross: function(data, x, y) {
        var width = (300 / data.numRows);
        // Diagonal 1
        data.ctx.beginPath();
        data.ctx.moveTo(width * y, width * x);
        data.ctx.lineTo(width * (y + 1), width * (x + 1));
        data.ctx.stroke();
        
        // Diagonal 2
        data.ctx.beginPath();
        data.ctx.moveTo(width * y, width * (x + 1));
        data.ctx.lineTo(width * (y + 1), width * x);
        data.ctx.stroke();
    }
};