# BINGO

This is a board game, where you play against an opponent. The goal is to complete 5 lines (Horizontal, Vertical or Diagonal) before the opponent does.

The game is played over the internet by two player connected to the same "Room".

## Rules

* Both players are given a randomly generated board filled with numbers 1-25.
* When you "Cross-Out" a number. The number get's "Crossed-Out" from the opponent's board too.
* The line(s) can be "Horizontal", "Vertical" or "Diagonal"
* Everytime you get a score one character from the word "BINGO" appears on the screen.
* The goal of course is to make the word "BINGO" appear before the opponent does the same.
* To make a selection; you can either click, or use a gamepad if you have any nearby.

## Gamepad Support

Gamepad support is also provided to play the game.
This game is designed to work with only the "First" controller that's connected to your system.

Buttons:

* D-Pad Up    : Move Up.
* D-Pad Down  : Move Down.
* D-Pad Left  : Move Left.
* D-Pad Right : Move Right.
* A / X       : Select ("Cross-Out").
* Menu        : Start / New Game.

## Technology Used

The server is made using node.js

The communication between client and server for the game is done using Websocket with the help of Socket.io library. This is done to improve the latency, compared to long polling in traditional HTTP methods.

The game board is created using HTML 5 Canvas.

Some other libraries such as underscore.js alertify.js and preload.js are also used to make the life easier.
`underscore.js` provides utility functions to handle lists or arrays, makes templating easier.

`alertify.js` provides a nice and cocise way to display a dialog.

`preload.js` lets you load resources in parallel and makes waiting for all the elements to finish loading easier, as you do not have to do reference counting etc.

More details on the implementation can be found [here](IMPLEMENTATION.md)

## How to start
Clone this repo or download the source code.

Install the libraries by running `npm install`

Run the server by running `npm start`
