# Hello, Operator
> A multiplayer cooperative mission based action game concept with asynchronous player roles

Live Link: www.hello-operator.net

Works best on Chrome. Partial support for Firefox & Edge. Not supported on IE.

If live link appears to be down or extreme lag is present, please contact Michael at mjameslin@gmail.com

README.md last updated 3/12/2018

## Table of Contents

**[Summary](#summary)**<br>
**[Features](#features)**<br>
**[Key Technologies](#key-technologies-used)**<br>
**[Details](#details)**<br>
 -**[Lobby Design](#lobby-design)**<br>
 -**[Game Design](#game-design)**<br>
 --**[1. State Simulation](#1-state-simulation)**<br>
 --**[2. Selective Accessibility](#2-selective-accessibility)**<br>
 --**[3. Rendering Updates](#3-rendering-updates)**<br>
 -**[Server Design](#server-design)**<br>
**[Deployment](#deployment)**<br>
**[Contributing](#contributing)**<br>
**[Roadmap](#roadmap)**<br>
**[Credits](#credits)**<br>
**[Team](#team)**<br>

## Summary

'Hello, Operator' is a stealth action game where two users play as different roles. The Agent must traverse and avoid enemies in the physical world to finish the mission. The Handler on the other hand has access to map blueprints and must safely guide the Agent to mission critical objects and locations.

This repo contains both the client and server applications for running the 'Hello, Operator' multiplayer game. Not included in this repo are the MySQL databases needed to handle user accounts & dynamic map generation.

## Features

- Sign up & login system for securely handling multiple players.

- Real-time updating lobby system for joining & creating games. Players may browse currently open games and see other users who also online.

- Real-time stealth mechanics featuring obstacles such as guards, cameras, and locked doors.

- Native HTML5 Canvas based rendering engine.

- Server-side game engine simulation for offloaded state computation

- Support for multiple simultaneously running game instances.

## Key Technologies Used
- React
- Redux
- Javascript & JSX
- Node.js
   - Express
   - Socket.io
   - Passport.js
   - bcrypt
   - JSON Web Token
- Webpack
- HTML5 Canvas
- CSS3
- MySQL

## Details

### Lobby Design

The key goal attained by the game lobby is responsive and smooth transitions from joining and leaving games. The general design of the page is intended to be straight forward, with sections that show games waiting for players to join, players not currently involved in games, and feedback messages to guide players through the lobby. Each player is able to see changes as they happen, enabled via Socket.io routing changes to the server and updating the React component state. Another included feature is abort functionality, so no player is truly locked into a game and can change their mind at any point.

Building the lobby was definitely an exceptional learning experience. Being the main component that handled significant client and server communication, I had to become much more comfortable with POST requests to the server, and simultaneously handing updating functions with Socket.io. I also had the chance to work through the logic of the variety of checks necessary to make sure that players, while seeing the same information, saw it displayed differently. React's local state was very helpful in this regard, allowing me to manage what each individual player is seeing. In a similar vein, choosing to also use Redux was invaluable in handling app-wide information access. Despite not knowing how to use React or Redux before starting this project, choosing to use these technologies led to a better-designed application.

<img src="https://raw.githubusercontent.com/michaeljlin/hello-operator/master/readme%20assets/lobby.jpg" width="50%">

> Screenshot of lobby design. Games are tracked on the top half while the lower half contains a list of player names and general messages

### Game Design

A core design feature of 'Hello, Operator' is having cooperative mechanics implemented in asynchronously differing roles. As such, there are three main challenges for the game engine:

1. Simulating the total state of the game
2. Determing what parts of the total state should be accessible to each player
3. Delivering rendering updates in real-time

To accomplish these goals, Node.js was chosen as the primary backend run-time environement due to its capacity for load management and additionally its flexibility in running asynchronous processes. The project initially started with a single run-time game simulation script that directly served rendering updates to clients. However, with the development of a proper [lobby system](#lobby-design) for handling matchmaking functions, the game simulation script was reworked to run as an individually instanced on-demand Node.js child process. As such, this Game Design section will cover the ```gameserver.js``` file specifically while more details about how it is implemented in the overall app can be found in the [Server Design](#server-design) section that discusses the ```lobbyserver.js``` file.

#### 1. State Simulation
To simulate the game, the ```gameserver.js``` script starts by pulling map construction JSON data from a MySQL database and uses it to assemble an initial game simulation state. This is done by cross-referencing the [```gameObjects.js```](https://github.com/michaeljlin/hello-operator/blob/master/server/helper/gameObject.js) file which defines the properties of all possible game entities. By structuring individual game entities through commonly inherited characteristics via [Javascript extensions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/extends), the game engine is capable of combining multiple game entities together to create complex behaviors.

A good example of this can be found in the [Guard object](https://github.com/michaeljlin/hello-operator/blob/fe7c2315a745056957153c78b3b4f89d5b4d662e/helper/gameObject.js#L1092). Guards are extensions of Circle objects which are themselves extensions of Basic_obj. In more detail, at the top most level Guards have specific unique properties such as movement direction and speed. Guards then inherit the shape boundary properties (i.e. hitboxes) from circle objects such as radius and angles. It then also inherits the core coordinate location properties from Basic_obj.

To implement a sight radius, the Guard object at assembly instantiates a [Camera object](https://github.com/michaeljlin/hello-operator/blob/fe7c2315a745056957153c78b3b4f89d5b4d662e/helper/gameObject.js#L1218) tied to the coordinates inherited from the Basic_obj. Like before, the Camera object is also another extension of the Circle object with customized properties. The actual guard behavior mechanisms are defined in the update method which is called by the simulation on every frame.

The full simuation state is contained within an array of gameObjects where the first three positions are reserved for user states, guard sim states, and active object states respectively. All additional objects are then appended to the array as standard objects. To calculate each frame update, a repeating setInterval method invokes the ```simulation()``` function at a polling rate of 16.66 ms.

#### 2. Selective accessibility
Conceptually, the game is designed to encourage player cooperation by serving different sets of information to each role. The Agent can see the physical world in a small sight range centered around his avatar. Such physical objects include things like switches, doors, and guards when nearby. The handler on the other hand can see all objects connected to his "cybernetic network" which includes objects like camera sight ranges and the lock state of doors.

<img src="https://raw.githubusercontent.com/michaeljlin/hello-operator/master/readme%20assets/agentView.jpg" width="50%">
<img src="https://raw.githubusercontent.com/michaeljlin/hello-operator/master/readme%20assets/handlerView.jpg" width="50%">

> Screenshots of agent and handler views. Note the small field of view & representation of physical objects in the first screenshot and the complete cybernetic view on the second screenshot

To achieve this, during the ```simulation()``` function gameObjects are pushed into the spySimState and handlerSimState arrays respectively. Because every gameObject contains a type property, it is possible to selectively choose whether or not each sim state should render the object. As an example, the spySimState will never receive any Camera type objects while the handlerSimState will aways receive them. More complex selections are possible through object handler interceptors. This can be seen on switches & buttons that unlock doors. For these objects, the spy will be able to see a physical display screen if he is close enough. The handler on the other hand will see a looping geometric pattern, a design meant to indicate holes in his "cybernetic network".

#### 3. Rendering Updates
Once the ```gamerserver.js``` has calculated an individual frame update and the resulting Agent & Handler states, Socket.io is used to send frame rendering data to clients at a polling rate of 16.66 ms. On the client side, the JSX ```canvasUpdater()``` method breaks up the frame rendering data into HTML5 canvas compatible drawing functions while using [```window.requestAnimationFrame()```](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) to automatically adjust rendering rates to local client hardware.

To do this, the ```canvasUpdater()``` method effectively divides the raw rendering data into several layers to accomodate how Canvas' drawing functions effectively render sequentially (i.e. successive drawing calls will overwrite previous drawing results). These conceptual layers are split into bottom level background objects (e.g. static walls that do not change), mid level active objects (e.g. player or guard objects that may be in constant motion), and then finally high level objects (e.g. UI messages that do not interact with anything and are meant to be overlaid on top of everything else). By breaking it up in such a way, a complex scene containing many objects can be quickly rendered in milliseconds.

Because a mixture of custom designed objects and pre-rendered spritesheets are used, an ```objectInterpreter()``` method is used to quickly pull up the correct set of rendering tasks. Based on the inherent ```object.type``` property defined in the ```gameObject.js``` file, the ```objectInterpreter()``will execute in succession the required Canvas drawing functions.

```
// Example of one set of Canvas drawing functions for rendering guards

case 'guard':
                context.save();
                context.translate(object.x, object.y);
                context.rotate(object.degrees* Math.PI/180);
                context.translate(-object.x, -object.y);
                context.drawImage(
                    this.state.char, object.sx, object.sy,
                    object.sWidth, object.sHeight,
                    object.dx-42, object.dy-45,
                    object.dWidth, object.dHeight
                );
                context.restore();
      break;
```

To break down the code snippet example for rendering guards, the context object in this case is a direct reference to the Canvas DOM element that has been pre-initiated to expect a 2d drawing environment. Because guards are considered mid level active objects, the canvas is first saved in its current state to prevent additional drawing calls from mutating the objects already drawn at the bottom level. The Canvas is then itself translated and rotated to find the correct location of the guard at the given frame. Once this location is prepared, a ```drawImage()``` method uses the properties defined in the guard object from the ```gameObject.js``` file to draw a guard based on a SVG spritesheet that was previously loaded into the React char state. A restore method is then invoked to restore the Canvas to its pre-translated/rotated state that now contains the newly drawn guard.

### Server Design

For handling general interactions outside of the game, the ```lobbyserver.js``` script file is run continuously on an Ubuntu server through the [node module forever](https://www.npmjs.com/package/forever). [Express.js](https://expressjs.com/) is used to serve a pre-compiled deployable React app through [Webpack](https://webpack.js.org/).

While active, the script maintains two trackers, one for players that have logged in and another for games that have been created. These trackers are regularly updated for the lifetime of the ```lobbyserver.js``` script file in response to successful login requests, client disconnections, and matchmaking requests from the clients.

Login and sign up requests are validated through [regex tests](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) on both the client and server sides. Keeping in line with [NIST Digital Identity Guidelines](https://pages.nist.gov/800-63-3/sp800-63-3.html), the only hard requirements for passwords is a minimum of 8 characters and no white spaces. Usernames are similarily subjected to a minimum requirement of 6 characters. Secure password handling is implemented through immediate [bcrypt](https://www.npmjs.com/package/bcrypt) hashing and all comparisons are made through the built in asynchronous [```bcrypt.compare()```](https://www.npmjs.com/package/bcrypt#to-check-a-password) method to ensure that no plain text password is ever retained.

To handle secured matchmaking requests as described in the [lobby section](#lobby-design), custom API routes based on [Express.js routing](https://expressjs.com/en/guide/routing.html) use POST requests that are then processed through [Passport.js](http://www.passportjs.org/) for authentication via the [JWT strategy](https://github.com/themikenicholson/passport-jwt) which uses [JSON Web Tokens](https://jwt.io/). After a successful login request, [```window.sessionStorage```](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) is used on the client-side to maintain valid JWTs for the duration of the session. All direct modification requests to the player tracker and game tracker objects require valid JWTs to reduce the severity of potential malicious activity.

```
// Pseudo-code example of API route & call design:

app.post('api/game/'+ACTION, passport.authenticate('jwt', {session: true}), (request, response)=>{
   
   Verify & Extract userTokenData from request.body.token based on secret passphrase
   
   Find userAccount in playerTracker based on username contained in userTokenData
   
   Find gameRoom in gameTracker based on gameID contained in userTokenData
   
   Apply appropriate ACTION to userAccount and/or gameRoom
   
   Update playerTracker & gameTracker as needed
   
   Send response back to client:
   response.status(200).send({status: 'Okay ACTION request'});
));
```

For real time updates, the ```lobbyserver.js``` relies on Socket.io's continuous connections as a passive one-way transmission. On every modification to playerTracker and gameTracker, an update emit is sent out by the server to all connected clients.

Transitioning from the lobby to the game is done through Node.js child processes, specifically by running the ```gameserver.js``` script using the [fork method](https://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options) which comes with built in parent-child communication channels. As an inherently asynchronous process, multiple forks of the same script can be run independently, assuming the hardware can handle the memory & CPU requirements. 

## Deployment

The 'Hello, Operator' repo contains the necessary parts to deploy the app on an Ubuntu server through Node.js. However, because the app requires a MySQL database to handle user accounts and serve map data, additional database setup is required to have it running in full capacity.

### General Setup

1. Clone the repo into the appropriate file location with the command ```git clone https://github.com/michaeljlin/hello-operator.git```
2. Install the required node modules with the command ```npm run setup```
3. Bundle the client side application with the command ```npm run bundle```
4. Deploy the lobbyserver.js script
  - If running locally, use the command ```npm test```. The app will be accessible at the address ```localhost:8000```
  - If running on a remote server, use a CLI Tool such as [Forever](https://www.npmjs.com/package/forever). To use Forever, move into the the server folder and run the command ```forever start lobbyserver.js``` .

### MySQL Database Setup
1. The server application folder requires a cred.js file to enable full functionality. The format of the file should be as follows:
```
// Fill in the cred object with your MySQL Database Credentials
const cred = {
   host: 'MySQL DATABASE URL HERE',
   user: 'USERNAME HERE',
   password: 'PASSWORD HERE',
   port: 'PORT HERE',
   database: 'DATABASE NAME HERE'
};
const secret = 'SECURE SECRET PASS PHRASE HERE';
const saltRounds = 15;

module.exports = { cred, saltRounds, secret };
```
Make sure to include cred.js in your .gitignore file to avoid accidentally uploading important credentials.

2. Database structure to come in a future update

## Contributing

To report bugs or contribute to this project, please contact Michael for more details at mjameslin@gmail.com

This repo contains Node.js scripts to set up a local debugging environment. Follow the instructions in [General Setup](#general-setup) and use the command ```npm test``` to run the app locally.

## Roadmap

'Hello, Operator' is considered feature-complete at this time as a proof-of-concept for implementing a multiplayer HTML5 game in the React framework. Additional features being considered for a production ready version include the following:

- Overhaul of server-side game simulation engine (i.e. better efficiency, easier maintenance/updates)
- Rework of HTML5 Canvas rendering engine to reduce browser CPU & RAM usage
- Implementation of fully featured player accounts (e.g. game progress tracking, user pages, etc.)
- Addition of oAuth2.0 protocols for improved accessibility
- Development of load balancing mechanisms for handling high capacities of running games
- Integration of email services (e.g. validation & 2FA)
- Addition of proper sound effects/music

## Credits

- Art assets from [Kenney](https://kenney.nl/assets)
- Music by Eric Matyas @ [Soundimage.org](http://www.soundimage.org)

## Team

### Producer
- Dan Paschal
   * Github: https://github.com/dpaschal-lf

### Project Manager
- TJ Kinion

### Senior Devs

#### Lead Developer & Network System Designer
- Michael Lin
    * Github: https://github.com/michaeljlin
    * Website: http://www.michaeljameslin.com
    * Linkedin: https://www.linkedin.com/in/michaeljlin/

#### Lead Frontend Developer
- Rebecca Brewster
    * Github: https://github.com/R-Brewster
    * Website: http://www.rebeccabrewster.com/
    * Linkedin: https://www.linkedin.com/in/rebecca-brewster-3a30a9a3/

#### Backend Developer
- Saeed Alavi
    * Github: https://github.com/SaeedAlavi

#### Backend Developer
- Harry Tran
    * Github: https://github.com/H2t2

### Junior Devs
- Jeffrey Pau
    * Github: https://github.com/Finleth

- Sangwoo Kim
    * Github: https://github.com/sangwoo89118

- Alicia Evans
    * Github: https://github.com/unleashalicia

- Lori Mitchell
    * Github: https://github.com/lmitchell524
