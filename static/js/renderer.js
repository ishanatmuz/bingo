var Renderer = {
    init: function(data) {
        // Used to draw one time things
        var bgCtx = data.bgCtx;
        bgCtx.beginPath();
        bgCtx.moveTo(100, 0);
        bgCtx.lineTo(100, 300);
        bgCtx.moveTo(200, 0);
        bgCtx.lineTo(200, 300);
        bgCtx.moveTo(0, 100);
        bgCtx.lineTo(300, 100);
        bgCtx.moveTo(0, 200);
        bgCtx.lineTo(300, 200);
        bgCtx.stroke();
    },
    
    update: function(data) {
        var self = this;
        // Used to re-draw things
        // TODO clear Canvas
        data.ctx.clearRect(0, 0, data.canvas.width, data.canvas.height);
        
        // TODO: Draw the canvas based on the information of data.state
        _.each(data.state.input.me, function(cell) {
            // TODO Draw X or O based on player type
            if (data.state.type === 'client') {
                self.drawCircle(data, cell);
            } else {
                self.drawCross(data, cell);
            }
        });
        // TODO Draw opponent moves based on player type
        _.each(data.state.input.opponent, function(cell) {
            // TODO Draw X or O based on player type
            if (data.state.type === 'client') {
                self.drawCross(data, cell);
            } else {
                self.drawCircle(data, cell);
            }
        });
        
        if (data.state.runningStatus === 'draw') {
            self.drawDrawMessage(data);
        } else if (data.state.runningStatus === 'host_won') {
            self.drawWinOrLoose(data, data.state.type === 'host');
        } else if(data.state.runningStatus === 'client_won') {
            self.drawWinOrLoose(data, data.state.type === 'client');
        } else {
            if ((data.state.turn === false) || (data.state.runningStatus === 'waiting')) {
                self.drawPauseWarning(data);
            }
        }
    },
    
    drawCross: function(data, cell) {
        var ctx = data.ctx;
        var xJson = data.spritesheet.json.frames['x.png'].frame;
        ctx.drawImage(data.spritesheet.img, xJson.x, xJson.y, xJson.w, xJson.h, 
                     cell.x * 100, cell.y * 100, 100, 100);
    },
    
    drawCircle: function(data, cell) {
        var ctx = data.ctx;
        var xJson = data.spritesheet.json.frames['o.png'].frame;
        ctx.drawImage(data.spritesheet.img, xJson.x, xJson.y, xJson.w, xJson.h, 
                     cell.x * 100, cell.y * 100, 100, 100);
    },
    
    drawPauseWarning: function(data) {
        data.ctx.font = '30px serif';
        data.ctx.strokeText('Waiting for opponent', 10, 150);
    },
    
    drawWinOrLoose: function(data, win) {
        console.log('draw win or loose');
        console.log(win);
        data.ctx.clearRect(0, 0, data.canvas.width, data.canvas.height);
        data.bgCtx.clearRect(0, 0, data.bgCanvas.width, data.bgCanvas.height);
        if (win) {
            console.log('win case');
            data.ctx.font = '30px serif';
            data.ctx.strokeText('You Won', 100, 150);
        } else {
            console.log('loose case');
            data.ctx.font = '30px serif';
            data.ctx.strokeText('You Lost', 100, 150);
        }
    },
    
    drawDrawMessage: function(data) {
        console.log('drawDrawMessage');
        data.ctx.clearRect(0, 0, data.canvas.width, data.canvas.height);
        data.bgCtx.clearRect(0, 0, data.bgCanvas.width, data.bgCanvas.height);
        data.ctx.font = '30px serif';
        data.ctx.strokeText('Match Draw', 100, 150);
    }
};