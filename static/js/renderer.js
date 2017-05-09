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
        // Used to re-draw things
        // TODO clear Canvas
        data.ctx.clearRect(0, 0, data.canvas.width, data.canvas.height);
        
        // TODO: Draw the canvas based on the information of data.state
        var self = this;
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
    }
};