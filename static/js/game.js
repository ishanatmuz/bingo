var Game = {
    init: function() {
        // Canvas
        this.data = {};
        this.data.canvas = document.getElementById('main-canvas');
        this.data.ctx = this.data.canvas.getContext('2d');
        this.data.bgCanvas = document.getElementById('background-canvas');
        this.data.bgCtx = this.data.bgCanvas.getContext('2d');
        
        // Loading resources
        this.queue = new createjs.LoadQueue();
        this.queue.on("complete", this.loadComplete, this);
        this.queue.loadFile({
            id: 'spritesheet_img',
            src: '/static/img/spritesheet.png'
        });
        this.queue.loadFile({
            id: 'spritesheet_json',
            src: '/static/img/spritesheet.json'
        });
        this.queue.loadFile({
            id: 'theme',
            src: '/static/audio/bensound-relaxing.mp3'
        });
    },
    
    loadComplete: function() {
        var self = this;
        // Preparing loaded resources
        this.data.spritesheet = {
            img: this.queue.getResult('spritesheet_img'),
            json: this.queue.getResult('spritesheet_json')
        };
        this.data.theme = this.queue.getResult('theme');
        this.data.theme.loop = true;
        
        // Playing theme
        this.data.theme.play();
        
        // Initializing game
        this.data.cellHeight = 100;
        this.data.cellWidth = 100;
        this.data.animationFrame = 0;
        this.data.state = {
            type: null,
            input: {
                me: [],
                opponent: [],
            },
            result: {
                state: 'loading'
            }
        };
        
        // Connect to server for registering player
        this.data.socket = io.connect('/');
        
        this.data.socket.on('onconnected', function(data) {
            console.log('socket io connected');
            console.log(data);
            // TODO: Initialize player type, i.e. set X or O
            self.data.state.type = data.type;
        });
        
        this.data.socket.on('opponent_disconnected', function(data) {
            console.log('opponent disconnected');
            console.log(data);
            // TODO Hang the game, show disconnect message, Show a button for refresh to start a new game
        });
        
        this.data.socket.on('opponent_input', function(opponentCell) {
            // TODO Store the opponent input
            console.log('opponent input received');
            console.log(opponentCell);
            self.data.state.input.opponent.push(opponentCell);
        });
        
        Input.init(this.data);
        Renderer.init(this.data);
        Game.run(this.data);
    },
    
    run: function(data) {
        var gameLoop = function() {
            Game.input(data);
            Game.update(data);
            Game.render(data);
            
            data.animationFrame += 1;
            
            window.requestAnimationFrame(gameLoop);
        };
        
        gameLoop();
    },
    
    input: function(data) {
        Input.update(data);
    },
    
    update: function(data) {
        // Game update Physics, Gameinfo etc...
        // If user has clicked on a new cell
        if (data.clickedCell) {
            // Check if cell is already clicked
            var result = _.find(data.state.input.me.concat(data.state.input.opponent), function(cell) {
                return cell.x === data.clickedCell.x && cell.y === data.clickedCell.y;
            });
            console.log(result);
            // Storing clicked cell information
            if (_.isUndefined(result)) {
                data.state.input.me.push(data.clickedCell);
                
                // Sending input information to server
                data.socket.emit('player_input', data.clickedCell);
            }
            
            delete data.clickedCell;
        }
    },
    
    render: function(data) {
        Renderer.update(data);
    }
};
Game.init();
