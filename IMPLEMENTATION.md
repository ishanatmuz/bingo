# BINGO
(Implementation details)

### Server
Server is divided mainly into two parts
`server.js` and `game_server.js`

This keeps most of the game specific logic separate from the `server.js` file.
#### server.js
Serves the `index.html` and `static` files.

Connects to the player and allocates an id to the player.

Takes some actions like removing / inserting client, assigning a room.

Forward all the client messages to the actual game server `game_server.js`.
#### game_server.js
Initializes the winnig combinations based on number of rows.
    
    NOTE: number of rows is 5 in this case, but connecting everything to number of rows makes it easy to change the number in the future.

Handles room creation, board creation, player inputs, result calculation and broadcast of state to the players.

### Client
The client has only one html file `index.html` which contains the main canvas (`#main-canvas`) for the game board.

All the states are showng by hiding and displaying the div elements except for the 'Waiting' state which is drawn directly over the canvas.

Game is started with `Game.init()`.
Help section is initiated and handled using `help.js`.

Javascript files used are:
#### game.js
Loads the resources

Initializes `GameSocket`, `Input`, `Renderer`

Runs the main game loop to update the game, check for inputs and re-render the game.
`GameSocket`, `Input` and `Renderer` are separated out in an attempt to modularize the code.

#### gamesocket.js
Initiates a connection to the server.

Listens for two events from the server
`onconnected` When connected to the server, connects to the game room, by getting the room id from the url hash or creating a new one.
`game-state` This is recieved whenever there are new changes broadcasted from the server. This just updates the client side data to reflect the same.

Sends the requests for "starting a game", "starting a new game" and "sending the player input" to the server.

#### input.js
Initializes the click listener on the canvas as well as the click listener for the "start game" / "new game" buttons.

Initializes all the gamepad buttons pressed state as false.

Initilizes the mousemove event and updates the currently selected cell.
Handles the gamepad input by long polling to check the pressed buttons.

Sends requests to the GameSocket for requesting a new / start game and player selection.
Sends the gamepad inputs to the `Help`.

#### renderer.js
Displays the message "BINGO" on top of the screen based on the 

Displays and hides the appropriate sections of the webpage based on the game state, ex. if the game is in waiting state, the player has started but the opponent hasn't the element `status` is shown with the text "Waiting for opponent to start...".

During the game "Waiting" is rendered directly on canvas while waiting for other player to make his/her move.

Canvas is rendered with each frame.
Canvas rendering has these parts:

`drawGrid` Draw the grid over the canvas.

`drawNumber` This draws the number on a specific cell. This is called for each cell with a color to represent whether this is an unselected cell or a user selected one.

`drawCross` This draws the cross over any specific cell.

`drawCellBorder` This draws the cell border of the currently selected cell in a different color so that user can see which cell is selected.

`drawWaiting` This draws a "Waiting" message over the canvas.

`drawCanvas` This calls the above mentioned functions to draw the canvas based on the grid, selected numbers and the currently selected cell.

#### help.js
Displays the "Help" Dialog and "Gamepad" help dialog.
Also displays the pressed buttons on the gamepad in the Test section of "Gamepad" dialog.
