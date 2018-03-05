# Hello, Operator
> A multiplayer cooperative mission based action game concept with asynchronous player roles

Live Link: www.hello-operator.net

## Summary

'Hello, Operator' is a stealth action game where two users play as different roles. The Agent must traverse and avoid enemies in the physical world to finish the mission. The Handler on the other hand has access to map blueprints and must safely guide the Agent to mission critical objects and locations.

This repo contains both the client and server applications for running the 'Hello, Operator' multiplayer game. Not included in this repo are the MySQL databases needed to handle user accounts & dynamic map generation.

## Features

- Sign up & login system for securely handling multiple players.

- Real-time updating lobby system for joining & creating games. Players may browse currently open games and see other users who also online.

- Real-time stealth mechanics featuring obstacles such as guards, cameras, and locked doors.

## Details

### Lobby Design

The key goal attained by the game lobby is responsive and smooth transitions from joining and leaving games. The general design of the page is intended to be straight forward, with sections that show games waiting for players to join, players not currently involved in games, and feedback messages to guide players through the lobby. Each player is able to see changes as they happen, enabled via Socket.io routing changes to the server and updating the React component state. Another included feature is abort functionality, so no player is truly locked into a game and can change their mind at any point.

Building the lobby was definitely an exceptional learning experience. Being the main component that handled significant client and server communication, I had to become much more comfortable with POST requests to the server, and simultaneously handing updating functions with Socket.io. I also had the chance to work through the logic of the variety of checks necessary to make sure that players, while seeing the same information, saw it displayed differently. React's local state was very helpful in this regard, allowing me to manage what each individual player is seeing. In a similar vein, choosing to also use Redux was invaluable in handling app-wide information access. Despite not knowing how to use React or Redux before starting this project, choosing to use these technologies led to a better-designed application.

### Game Design

A core design feature of 'Hello, Operator' is having cooperative mechanics implemented in asynchronously differing roles. As such, there are three main challenges for the game engine:

1. Simulating the total state of the game
2. Determing what parts of the total state should be accessible to each player
3. Delivering rendering updates in real-time

To accomplish these goals, Node.js was chosen as the primary backend run-time environement due to its capacity for load management and additionally its flexibility in running asynchronous processes. The project initially started with a single run-time game simulation script that directly served rendering updates to clients. However, with the development of a proper [lobby system](#lobby-design) for handling matchmaking functions, the game simulation script was reworked to run as an individually instanced on-demand Node.js child process. As such, this Game Design section will cover the ```gameserver.js``` file specifically while more details about how it is implemented in the overall app can be found in the [Server Design](#server-design) section that discusses the ```lobbyserver.js``` file.

To simulate the game, the ```gameserver.js``` script pulls map construction JSON data from a MySQL database and uses it to assemble an initial game simulation state. This is done by cross-referencing the ```gameObjects.js``` file which defines the properties of all possible game entities. By structuring individual game entities through commonly inherited characteristics via [Javascript extensions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/extends), the game engine is capable of combining multiple game entities together to create complex behaviors.

A good example of this can be found in the [Guard object](https://github.com/Learning-Fuze/c9.17_spygames/blob/fe7c2315a745056957153c78b3b4f89d5b4d662e/helper/gameObject.js#L1092).

### Server Design

## Technologies Used
- React
- Redux
- Javascript
- Socket.io
- Node.js
- HTML5 Canvas
- MySQL

## Roadmap



## Credits

### Producer
- Dan

### Project Manager
- TJ

### SR Devs
- Michael Lin
    * Github: https://github.com/michaeljlin
    * Website: http://www.michaeljameslin.com

- Rebecca Brewster
    * Github: https://github.com/R-Brewster
    * Website: http://www.rebeccabrewster.com/

- Saeed Alavi
    * Github: https://github.com/SaeedAlavi

- Harry Tran
    * Github: https://github.com/H2t2

### Jr Devs
- Jeffrey Pau
- Sangwoo Kim
- Alicia Evans
- Lori Mitchell
