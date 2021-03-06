var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
let port = 8001;
require('console-stamp')(console, { pattern: 'dd/mm/yyyy HH:MM:ss.l' });

var gameObject = require('./helper/gameObject');
gameObject.init(io);
const get = require("./helper/calcFunctions");
const db = require("./helper/getMapCode");
const mapTileDict = require('./helper/mapTileDict');

var mapCode;
var linkCode;
var charStartPos;
var updateList;

process.on('message', (lobbyData) => {
    // console.log('>>>>>>>>>>>>>>>>>>>>>>Player roles and Ids:', lobbyData);

    playerTracker.lobbyData = lobbyData;
    port = lobbyData.port;

    console.log('set lobbyData: ', playerTracker.lobbyData);

    console.log("Child process started for game room ID: ", playerTracker.lobbyData.gameID);

    http.listen(port, function(){
        console.log('listening on *: ', port);
    });

  });

function retrieveMapData() {

    db.queryDBforMapCode.then(function (fromPromise) {
        //Extract MapCode from promise
        let data = fromPromise.data[0];
        mapCode = JSON.parse(data.MapCode);
        linkCode = JSON.parse(data.EventLinking);
        charStartPos = JSON.parse(data.StartPos) || null;
        updateList = JSON.parse(data.UpdateList);
        // console.log("Update List:", updateList);
    }, function (fromRejection) {
        console.log(fromRejection);
    }).then(function() {
        startSim();
    })
}
function updateListItem(item){
    itemIndex = finalSimState.length + parseInt(item);

    finalSimState[itemIndex].update();
}

function harrySetCharStartPos(player) {
    if(charStartPos == null) {
        return;
    }
    let [xStart,yStart] = charStartPos;
    // console.log(player);
    player.status.posX = xStart;
    player.status.posY = yStart;
}


function harryInitMap() {
    let tileSize = 50;

    //Build the Flooring
    if (mapCode.floor.type === 'composite') {
        let flooring = mapCode.floor.content;
        flooring.forEach((item) => {
            let tile = mapTileDict[item.tile];
            if (item.locStart !== item.locEnd) {
                for (let y = item.locStart[1]; y <= item.locEnd[1]; y++) {
                    for (let x = item.locStart[0]; x <= item.locEnd[0]; x++) {
                        finalSimState.push(new gameObject[tile](x * tileSize, y * tileSize));
                    }
                }
            }
        });
    } else {
        let tile = mapTileDict[mapCode.floor.content.tile];
        for (let y = 0; y <= 16; y++) {
            for (let x = 0; x <= 23; x++) {
                finalSimState.push(new gameObject[tile](x * tileSize, y * tileSize));
            }
        }
    }

    // Build physical objects (not guards or cameras)
    mapCode.objects.forEach((physObj) => {
        let {tile, loc: pos} = physObj;
        tile = mapTileDict[tile];
        finalSimState.push(new gameObject[tile](pos[0] * tileSize, pos[1] * tileSize));
    });

    // Build walls
    mapCode.walls.forEach((wallTile) => {
        let {tile, locStart: [stX, stY], locEnd: [endX, endY]} = wallTile;
        tile = mapTileDict[tile];
        if (stX !== endX || stY !== endY) {
            for (let y = stY; y <= endY; y++) {
                for (let x = stX; x <= endX; x++) {
                    finalSimState.push(new gameObject[tile](x * tileSize, y * tileSize));
                }
            }
        } else {
            finalSimState.push(new gameObject[tile](stX * tileSize, stY * tileSize));
        }
    });

    // Build utility objects (triggers, guards, cameras).
    mapCode.mapUtil.forEach((utilObj) => {
        let paramArray = [];

        let type = utilObj['type'];
        let newObj = null;
        switch(type){
            case 'Camera': // Need to remove eval after database is changed
                newObj = new gameObject[type](utilObj['x']*tileSize, utilObj['y']*tileSize, utilObj['radius'], utilObj['start']*Math.PI, utilObj['end']*Math.PI, utilObj['range'], utilObj['dir'], utilObj['color'], utilObj['name']);
                // console.log(`camera: `, newObj);
                activeObjectSimState.push(newObj);
                break;
            case 'Guard':
                newObj = new gameObject[type](utilObj['x']*tileSize, utilObj['y']*tileSize, utilObj['movement'], utilObj['range'], -1, 'guard');
                guardSimState.push(newObj);
                // console.log(`guard: `, newObj);
                break;
            case 'Word':
                newObj = new gameObject[type](utilObj['x']*tileSize, utilObj['y']*tileSize, utilObj['text'], utilObj['color'], utilObj['font'], utilObj['ui'], utilObj['solid'], utilObj['display'], 'word');
                finalSimState.splice(3, 0, newObj);
                // console.log(`word: `, newObj);
                break;
            case 'Button':
                newObj = new gameObject[type](utilObj['x']*tileSize, utilObj['y']*tileSize, utilObj['width'], utilObj['height'], utilObj['color'], utilObj['name'] ? utilObj['name'] : 'button');
                // console.log(`button: `, newObj);
                if(utilObj['name'] === 'treasure'){ 
                    // console.log(`treasure: `, newObj); 
                };

                newObj.display = false; // Temporary workaround
                finalSimState.push(newObj);
                break;
            case 'Door':
                newObj = new gameObject[type](utilObj['x']*tileSize, utilObj['y']*tileSize, utilObj['width'], utilObj['height'], utilObj['color'], utilObj['locked'], utilObj['opened'], utilObj['reversed'], 'door');
                // console.log(`door: `, newObj);
                finalSimState.push(newObj);
                break;
            case 'Exit':
                newObj = new gameObject[type](utilObj['x']*tileSize, utilObj['y']*tileSize, utilObj['width'], utilObj['height'], utilObj['color'], utilObj['objname']);
                finalSimState.push(newObj);
                break;
            default:
                newObj = new gameObject[type](utilObj['x']*tileSize, utilObj['y']*tileSize);
                finalSimState.push(newObj);
        }

    });

    // Link Objects
    linkCode.forEach((item) => {
        for (let eventToLink in item) {
            let [obj, link] = item[eventToLink];

            //Link guards and cams
            if (eventToLink === 'guard' || eventToLink === 'camera') {
                let [guardOrCam, gOcPos] = obj;
                finalSimState[guardOrCam][gOcPos].trigger(finalSimState[link]);
                //Link Other Objs(buttons, doors);
            } else if (eventToLink === 'exit' ) {
                let objIndex = finalSimState.length + obj;
                finalSimState[objIndex].trigger(finalSimState[link]);
            } else {
                let objIndx = finalSimState.length + obj;
                let linkIndx = finalSimState.length + link;
                finalSimState[objIndx].trigger(finalSimState[linkIndx]);
            }
        }
    });

    harrySetCharStartPos(playerTracker[socketHolder2.id]);
}

// Variables for server functionality defined here. Will be organized later.

// var express = require('express');
// var app = express();
// var http = require('http').Server(app);
// var io = require('socket.io')(http);
// const port = 8001;

var eventMessage = "";

// *****Global variables listed below should be transferred to Simulation object at a later time*****

var nameAdj = ['magnificent', 'vicious', 'friendly', 'cheerful', 'sad', 'happy', 'confused', 'lazy', 'jolly', 'effervescent', 'noble', 'cowardly', 'silly', 'thunderous', 'insightful', 'foolish', 'panicked', 'determined', 'awesome', 'sleepy', 'energetic', 'joyful', 'superior', 'alpha', 'courageous', 'far-sighted', 'limping', 'bumbling', 'serious', 'playful', 'cantankerous', 'stubborn', 'relaxed', 'laughing', 'coughing', 'blind', 'sublime', 'naked', 'ascended', 'swift', 'supreme', 'mad', 'silver', 'crimson', 'golden', 'silent', 'brash', 'crying'];
var nameAnimal = ['octopus', 'tiger', 'chihuahua', 'shark', 'whale', 'hawk', 'eagle', 'leopard', 'cheetah', 'elephant', 'horse', 'beagle', 'piranha', 'platypus', 'ostrich', 'kakapo', 'parrot', 'wolf', 'snake', 'lizard', 'butterfly', 'frog', 'chameleon', 'fox', 'coyote', 'hummingbird', 'buffalo', 'chicken', 'hyena', 'lion', 'llama', 'alpaca', 'dove', 'mantis', 'owl', 'ox', 'squid', 'bat', 'capybara', 'bison', 'mammoth', 'chimp', 'hornet', 'squirrel', 'hamster', 'tortoise', 'raven', 'crow', 'dragon', 'unicorn', 'antelope', 'gazelle', 'giraffe', 'mongoose', 'weasel', 'badger'];

var simulationReference = null;

var finalSimState = [];
var spySimState = [];
var handlerSimState = [];
var guardSimState = [];
var activeObjectSimState = [];

var collidingObjects = [];

// Length is used to determine remaining players in sim
// Count is used for ID of players
var playerTracker = {
    length: 0,
    count: 0,
    playerIDs: [],
    lobbyData: {},
    activePlayer: 0,
    handlerPlayer: 0
};

var socketHolder = null;
var socketHolder2 = null;

var pollRate = 1000/60;
// 1000/60 for actual rendering

io.on('connection', function(socket){
    playerTracker.length++;
    playerTracker.count++;
    let randName = nameAdj[Math.floor(Math.random()*nameAdj.length)]+" "+nameAnimal[Math.floor(Math.random()*nameAnimal.length)];
    let profilePic = './assets/images/test_fb_1.jpg';
    let newPlayer = new PlayerObject(playerTracker.count, socket.id, randName, null, profilePic);
    playerTracker[socket.id] = newPlayer;
    playerTracker.playerIDs.push(socket.id);

    console.log('client has connected: ', socket.id);

    socket.emit('identification');

    socket.on('id', (id)=>{
        console.log('>>>>>>>>>>>>>>>>received identification: ', id);

        if(id === playerTracker.lobbyData.spymaster){
            socketHolder = socket;
            socket.join('spymaster');
            playerTracker.lobbyData.localSpymaster = socket.id;
            playerTracker.handlerPlayer = playerTracker.playerIDs.indexOf(socket.id);
        }
        else if(id === playerTracker.lobbyData.spy){
            socketHolder2 = socket;
            socket.join('spy');
            playerTracker.lobbyData.localSpy = socket.id;
            playerTracker.activePlayer = playerTracker.playerIDs.indexOf(socket.id);
        }

        if(playerTracker.length > 1){

            console.log('>>>>>>>>>>> more than 1 player, grabbing map data! <<<<<<<<<<<');

            retrieveMapData();
            io.to('spymaster').emit( 'playerRole', 'spymaster');
            io.to('spy').emit('playerRole', 'spy');
        }
    });

    // console.log(playerTracker);
    // if(playerTracker.length === 1){
    //     socketHolder = socket;
    //     socket.join('spymaster');
    //     // var role = 'spymaster';
    // }
    // else if(playerTracker.length > 1){
    //     retrieveMapData();
    //     socketHolder2 = socket;
    //     socket.join('spy');
    //     // var role = 'spy'
    // }

    // io.to('spymaster').emit( 'playerRole', 'spymaster');
    // io.to('spy').emit('playerRole', 'spy');


    var playerInfo = {
        profilePic: './assets/images/test_fb_1.jpg',
        userName:  'superawesomusername007',
        agentName: 'coughing chameleon',
        sprite: 'test_sprite_1.jpg',
        // role: role,
    };

    //***************Not needed here, just in lobbyserver.js, just added it for development purposes **************//
    socket.on('hello_operator_login_submit', (inputValues, id) => {
        // console.log(inputValues, 'player id', id);
        //Set to dummy value for now, need to change to reflect whether sign in was successful or not
        let authStatus = 'true';
        socket.emit('hello_operator_login_status', authStatus);
        // console.log('user auth status', authStatus);
    });
    //*************************************************************************************************************//

    socket.emit('updatePlayer', playerInfo);

    socket.on('login_submit', (inputValues, id) => {
        // console.log(inputValues, 'player id', id);
    });

    // Click event takes in coordinates and calculates the needed vectors to reach it
    // based on the player's current position.
    socket.on('click', (event)=>{
        // console.log('click event from '+ socket.id +' received: ', event);
        // console.log('attempting to push into: ', playerTracker[socket.id].status);
        // console.log(playerTracker[socket.id].status.name+"'s click history: ", playerTracker[socket.id].status.clickHistory);


        playerTracker[socket.id].status.clickHistory.push(event);
        // playerTracker[socket.id].update();
    });

    socket.on('keydown', (event)=>{
        // console.log('key down event from '+ socket.id +' received: ', event);
        playerTracker[socket.id].status.keys[event] = true;

    });

    socket.on('keyup', (event)=>{
        // console.log('key up event from '+ socket.id +' received: ', event);
        playerTracker[socket.id].status.keys[event] = false;

        if(event === '`'){
            // console.log("resetting!");
            initializeMap();
        }
    });

    // Disconnect event should only fire when individual user leaves game
    // Game exit is handled by child process exit event
    socket.on('disconnect', () =>{
        console.log('client has disconnected: ', socket.id);
        playerTracker.length--;
        // console.log("results: ",playerTracker);

        let exitingPlayer = null;

        if(socket.id === playerTracker.lobbyData.localSpy){
            exitingPlayer = playerTracker.lobbyData.spy;
        }
        else if(socket.id === playerTracker.lobbyData.localSpymaster){
            exitingPlayer = playerTracker.lobbyData.spymaster;
        }

        // console.log('sending back user id: ',exitingPlayer);
        process.send({action: 'quit', payload: exitingPlayer});

        endSim();

        if(playerTracker.length === 0){
            endProcess();
        }
    });

    //Rebecca added for UI input
    socket.on('com_button_press', () =>{
        // console.log('com button pressed');
        switch(arguments[1]){
            case '1':
                console.log('button 1 was clicked');
                break;
            case '2':
                console.log('button 2 was clicked');
                break;
            case '3':
                console.log('button 3 was clicked');
                break;
            case '4':
                console.log('button 4 was clicked');
                break;
            case '5':
                console.log('button 5 was clicked');
                break;
            case '6':
                console.log('button 6 was clicked');
                break;
            case '7':
                console.log('button 7 was clicked');
                break;
            case '8':
                console.log('button 8 was clicked');
                break;
            case '9':
                console.log('button 9 was clicked');
                break;
        }
    });

    socket.on('com_check_clicked', () =>{
        // console.log('com check clicked');
        //Display time elapsed
    });


    // socket.emit('player event', eventMessage);

    // socket.on('disconnect', () => {
    //     // let message = `${role} is leaving mission`;
    //     //
    //     // io.emit('exitMessage', message);
    //
    //     endSim();
    //     console.log(socket.id);
    //     console.log(playerTracker.lobbyData.gameID);
    //     process.send({action: 'quit', info: {gameID: playerTracker.lobbyData.gameID, player: });
    //     console.log('player exiting, id sent to lobbyserver')
    // })
});

app.use(express.static("public"));

function PlayerObject(number, id, name, color, profilePic){
    this.number = number;
    this.id = id;

    this.status = {
        name: name,
        posX: 150,
        posY: 675,
        velX: 0,
        velY: 0,
        width: 40,
        height: 40,
        color: color || 'black',
        profilePic: profilePic,
        keys: [],
        clickHistory: [],
        items: [],
        degrees: 0
    };

    this.update = function(newState){

    };

    this.drawObj = function(context){
        context.fillStyle = this.state.color;
        context.fillRect(this.state.pos.x, this.state.pos.y, this.state.width, this.state.height);
    }
}

function startSim(){
    console.log("Simulation has started!");

    if(simulationReference === null){
        initializeMap();

        simulationReference = setInterval(simulation, pollRate);
    }
}

function endProcess(){
    console.log("Simulation has ended!");
    console.log("Process Exited! (Child Notification)");
    process.exit();
}

function endSim(){

    clearInterval(simulationReference);
    console.log("Simulation has ended!");

    simulationReference = null;
}

function simulation(){

    if(playerTracker.length === 1){
        io.emit('timer', 'green');
    }
    else{

        // Only tracks 1 player object currently
        // Will be updated later to contain all objects
        let newSimState = {
            x: null,
            y: null,
            degrees: null
        };

        // Starts at i = 1 because the 0th player is the spymaster by default
        // for(let i = 1; i < playerTracker.playerIDs.length; i++){
        //     let nextID = playerTracker.playerIDs[i];
        //
        //     simUpdate(playerTracker[nextID]);
        //
        //     newSimState.x = playerTracker[nextID].status.posX;
        //     newSimState.y = playerTracker[nextID].status.posY;
        // }
        // let nextID = playerTracker.playerIDs[playerTracker.playerIDs.length-1];

        let handlerClickHistory = playerTracker.playerIDs[playerTracker.handlerPlayer];
        handlerClickHistory = playerTracker[handlerClickHistory].status.clickHistory;

        let activeObjects = finalSimState[2];
        let handlerPulse = null;

        if(handlerClickHistory !== undefined && handlerClickHistory.length !== 0){
            let handlerCoords = handlerClickHistory[handlerClickHistory.length-1];

            if(activeObjects[activeObjects.length-1].type !== 'pulse'){
                handlerPulse = new gameObject.Pulse(handlerCoords.x, handlerCoords.y);
                // console.log('pulse object at creation: ', handlerPulse);

                activeObjects.push(handlerPulse);
            }
            else if (activeObjects[activeObjects.length-1].x !== handlerCoords.x && activeObjects[activeObjects.length-1].y !== handlerCoords.y){
                // console.log('latest handler coords: ', handlerCoords);
                handlerPulse = new gameObject.Pulse(handlerCoords.x, handlerCoords.y);
                activeObjects.pop();
                activeObjects.push(handlerPulse);
            }
        }

        let nextID = playerTracker.playerIDs[playerTracker.activePlayer];

        simUpdate(playerTracker[nextID]);

        // playerTracker[nextID].status.degrees +=1;
        //
        // if(playerTracker[nextID].status.degrees === 360){
        //     playerTracker[nextID].status.degrees = 0;
        // }

        newSimState.x = playerTracker[nextID].status.posX;
        newSimState.y = playerTracker[nextID].status.posY;
        newSimState.degrees = playerTracker[nextID].status.degrees;

        //Update Camera
        finalSimState[2].forEach((item)=>item.update());

        //Update Each Item in the Update List
        updateList.forEach((item)=> {
            updateListItem(item);
        });


        // Temporary update for word object
        finalSimState[3].update();

        // finalSimState[9].update();
        // finalSimState[10].update();
        // finalSimState[1].update();

        // Set all Sim States at 0th position to recalculated newSimState
        finalSimState[0] = newSimState;
        spySimState[0] = newSimState;
        handlerSimState[0] = newSimState;

        io.to('spymaster').emit('update', handlerSimState);
        io.to('spy').emit('update', spySimState);


    }
}

function initializeMap(){

    let width = 1200;
    let height = 800;

    let tileWidth = 50;
    let tileHeight = 50;

    guardSimState = [];
    activeObjectSimState = [];

    finalSimState = [
        {},
        guardSimState,
        activeObjectSimState,
    ];

    //Build simState from code
    harryInitMap();

    spySimState.push(finalSimState[0]);

    // Add all guards near player
    for(let i = 0; i < finalSimState[1].length; i++){
        if (
            Math.abs(finalSimState[1][i].x - 0 - 25) < 100 &&
            Math.abs(finalSimState[1][i].y - 350 - 25) < 100
        ) {
            spySimState[1].push(finalSimState[i]);
        }
    }

    spySimState.push([]);

    spySimState.push(finalSimState[3]);

    // Add all objects near player
    for(let i = 3; i < finalSimState.length; i++) {

        if (
            Math.abs(finalSimState[i].x - 0 - 25) < 100 &&
            Math.abs(finalSimState[i].y - 350 - 25) < 100
        ) {

            if(finalSimState[i].type !== 'camera'){
                spySimState.push(finalSimState[i]);
            }
        }

        // if(finalSimState[i].type === 'button'){
        //     handlerSimState.push(
        //         new gameObject.Scroll(
        //             finalSimState[i].x, finalSimState[i].y,
        //             finalSimState[i].width, finalSimState[i].height
        //         )
        //
        //     );
        // }
    }

    handlerSimState.push(finalSimState[0]);

    // console.log(finalSimState);
}

function handlerInterpreter(nextObject){

    // console.log('pushing to handler!');

    let type = nextObject.type;

    switch(type){
        case 'pulse':
        case 'exit':
            handlerSimState.push(nextObject);
            break;
        case 'button':
            handlerSimState.push(new gameObject.Scroll(
                nextObject.x, nextObject.y,
                nextObject.width-50, nextObject.height-50
                ));
            break;
        case 'word':
        case 'camera':
            handlerSimState.push(nextObject);
            break;
        case 'wall':
            handlerSimState.push(wallInterpreter(nextObject));
            // console.log(handlerSimState);
            break;
        case 'door':
            handlerSimState.push(
                new gameObject.Box(nextObject.x, nextObject.y,
                    nextObject.width, nextObject.height,
                    nextObject.lockState ? 'red' : 'blue',
                    false, false, true)
            );
            break;
        default:
            return;
    }

}

function wallInterpreter(nextObject){
    // let archetype = nextObject.archtype;
    let x = nextObject.x;
    let y = nextObject.y;

    // Currently inactive until better method for drawing walls is determined.
    // switch(archetype){
    //     case 'horizontal':
    //     case 'vertical':
    //     case 'NorthEnd':
    //     case 'EastEnd':
    //     case 'SouthEnd':
    //     case 'WestEnd':
    //     case 'CornerSW':
    //     case 'CornerNE':
    //     case 'CornerNW':
    //     case 'CornerSE':
    //     default:
    // }

    return new gameObject.DigitalWall(x, y);
}

function handleGuardState(guardArray){

}

var hasCollided = {x: false, y: false, xVal:null, yVal: null};

// Currently only updates player object types
// Will be changed to update all object types later
function simUpdate(objToUpdate) {

    var newCoord = objToUpdate.status.clickHistory[objToUpdate.status.clickHistory.length - 1] !== undefined ? objToUpdate.status.clickHistory[objToUpdate.status.clickHistory.length - 1] : {x: objToUpdate.status.posX, y: objToUpdate.status.posY};
    var oldCoord = {x: objToUpdate.status.posX, y: objToUpdate.status.posY};

    // All states reserve spaces for Player, Guards, Active Objects, and Title Words
    // All static objects are added afterwards

    // RESET SPY SIM STATE HERE TO REFRESH FOR NEXT INSTANCE
    spySimState = [
        {},
        [],
        []
    ];

    // spySimState.push(guardSimState);

    // RESET HANDLER SIM STATE HERE TO REFRESH FOR NEXT INSTANCE
    handlerSimState = [
        {},
        [],
        []
    ];

    // handlerSimState.push(guardSimState);

    // Update guards and check for collision or detection from sight range
    for(let i = 0; i < guardSimState.length; i++){
        let nextGuard = guardSimState[i];
        let sight = nextGuard.sight;
        nextGuard.update();

        if(
            Math.abs(nextGuard.x - objToUpdate.status.posX) < 100 &&
            Math.abs(nextGuard.y - objToUpdate.status.posY) < 100
        ){
            // Check both guard and sight collision
            if( checkCollide(objToUpdate, oldCoord, null, nextGuard) || checkCollide(objToUpdate, oldCoord, null, sight)){
                finalSimState[3].set('MISSION FAILED! Restarting...');
                nextGuard.trigger(true);
                nextGuard.emit('spymaster');
                endSim();

                setTimeout(()=>{
                    console.log('executing game restart');

                    playerTracker[socketHolder2.id].status.clickHistory = [];
                    playerTracker[socketHolder2.id].status.posX = charStartPos[0];
                    playerTracker[socketHolder2.id].status.posY = charStartPos[1];

                    startSim();
                }, 3000)
            }
            spySimState[1].push(nextGuard);
        }

        handlerSimState[1].push(nextGuard);
    }

    for(let i = 0; i < finalSimState[2].length; i++){
        let nextObject = finalSimState[2][i];

        let x = nextObject.dx ? nextObject.dx : nextObject.x;
        let y = nextObject.dy ? nextObject.dy : nextObject.y;

        if(nextObject.type === 'camera'){
            nextObject.update();

            if( checkCollide(objToUpdate, oldCoord, null, nextObject) ){

                // console.log('Camera detected agent');

                finalSimState[3].set('MISSION FAILED! Restarting...');
                nextObject.trigger(true);
                nextObject.emit('spymaster');
                nextObject.emit('spy');
                endSim();

                setTimeout(()=>{
                    playerTracker[socketHolder2.id].status.clickHistory = [];
                    playerTracker[socketHolder2.id].status.posX = charStartPos[0];
                    playerTracker[socketHolder2.id].status.posY = charStartPos[1];

                    startSim();
                }, 3000)
            }

            handlerSimState[2].push(nextObject);
        }
        else if(nextObject.type === 'pulse'){
            spySimState[2].push(nextObject);
            handlerSimState[2].push(nextObject);
        }
    }

    // Add Mission Status Overlay
    spySimState.push(finalSimState[3]);
    handlerSimState.push(finalSimState[3]);

    // Loop through all objects and update as needed
    // Currently only actively moving object is camera
    // If collision with camera is found, trigger reset & word display
    // Otherwise, load object into spy or spymaster state as needed
    for(let i = 4; i < finalSimState.length; i++){
        let nextObject = finalSimState[i];

        let x = nextObject.dx ? nextObject.dx : nextObject.x;
        let y = nextObject.dy ? nextObject.dy : nextObject.y;

        if(nextObject.type === 'camera'){
            nextObject.update();

            if( checkCollide(objToUpdate, oldCoord, null, nextObject) ){
                //Rebecca added for spymaster UI
                // console.log('Camera detected agent');

                finalSimState[finalSimState.length-1].set('MISSION FAILED! Restarting...');
                nextObject.trigger(true);

                endSim();

                setTimeout(()=>{
                    playerTracker[socketHolder2.id].status.clickHistory = [];
                    playerTracker[socketHolder2.id].status.posX = 0;
                    playerTracker[socketHolder2.id].status.posY = 350;

                    startSim();
                }, 3000)
            }
        }

        // Handle objects to be shown on spy screen
        // Only push in objects near the spy
        // Do not show camera type objects to spy
        if(
            Math.abs(x - objToUpdate.status.posX) < 100 &&
            Math.abs(y - objToUpdate.status.posY) < 100
        ){
            if(nextObject.type !== 'camera'){
                spySimState.push(finalSimState[i]);
            }
        }
        else if(nextObject.type === 'pulse'){
            spySimState.push(finalSimState[i]);
        };

        // Handle objects to be shown on handler screen

        handlerInterpreter(nextObject);
    }

    // If spy is not at the last click history position, keep checking if he can move
    // Calculate hypotenuse & angle from current position to last click history position
    // Player speed is currently hard coded to 5 units per frame
    //
    // checkCollide currently inherently handles solid collisions by directly modifying
    // player position if detected. Should be changed later to be strictly functional
    // without any impact on player status

    if (objToUpdate.status.clickHistory.length > 0 && ( (newCoord.x-25 !== oldCoord.x)||(newCoord.y-25 !== oldCoord.y) ) ) {

        if(newCoord.x !== oldCoord.x || newCoord.y !== oldCoord.y){

            // Compute remaining distance here
            let xDirection = newCoord.x - oldCoord.x - 25;
            let yDirection = newCoord.y - oldCoord.y - 25;

            let hypo = Math.sqrt(Math.pow(xDirection, 2)+ Math.pow(yDirection, 2) );

            // Make sure to subtract 25 from newCoord
            var thetaRadians = get.radCalc({x:newCoord.x-25,y:newCoord.y-25}, oldCoord);

            // Update player degrees here to determine face angle direction
            objToUpdate.status.degrees = thetaRadians * 180/Math.PI;

            // If total distance to final click location is less than the player unit speed
            // Set next position to the next coordinate
            if(hypo < 5){
                    objToUpdate.status.posX = newCoord.x-25;
                    objToUpdate.status.posY = newCoord.y-25;
            }
            else {
                // Set velocity here for the frame calculation
                // Multiplied by 5 as a hard coded unit speed
                let velX = Math.cos(thetaRadians) * 5;
                let velY = Math.sin(thetaRadians) * 5;

                // if(hasCollided.x){
                //     velX = 0;
                // }
                //
                // if(hasCollided.y){
                //     velY = 0;
                // }

                // Set up next coordinate for collision checking
                let nextX = objToUpdate.status.posX + velX;
                let nextY = objToUpdate.status.posY + velY;

                let nextCoord = {nextX: nextX, nextY: nextY};

                // Reset object collision array
                collidingObjects = [];

                // Loop through all known objects
                // First checks if object is within sight range of player (currently 150 pixels)
                // Then checks collision with object
                // If positive, check type of object
                // Call a trigger function on the object to change the state of another object
                for(let i = 3; i < finalSimState.length; i++){
                    let nextObject = finalSimState[i];

                    if(
                        Math.abs(nextObject.x - objToUpdate.status.posX-25) < 100 &&
                        Math.abs(nextObject.y - objToUpdate.status.posY-25) < 100
                    ){
                        if(checkCollide(objToUpdate, oldCoord, nextCoord, nextObject)){

                            if(nextObject.solid){
                                if(nextObject.type === 'door'){
                                    if(nextObject.lockState === false){
                                        nextObject.emit('spymaster');
                                        nextObject.emit('spy');
                                        nextObject.animate = true;
                                        nextObject.solid = false;
                                    }
                                }
                                continue;
                            }

                            if(nextObject.type === 'button'){

                                // Currently a button named 'treasure' is the exit trigger
                                // Must define a treasure gameObject later
                                if(nextObject.name !== 'treasure'){

                                    if(nextObject.linkedObj.lockState !== undefined && nextObject.linkedObj.lockState){
                                        nextObject.emit('spymaster');
                                        nextObject.emit('spy');
                                        nextObject.trigger(false);
                                    }

                                }else{
                                    nextObject.display = false;
                                    nextObject.trigger(true);
                                }
                            }

                            if(nextObject.type === 'exit'){
                                if(nextObject.display === true){
                                    finalSimState[3].set('MISSION COMPLETE!');
                                    nextObject.trigger(true);
                                    nextObject.emit('spymaster');
                                    nextObject.emit('spy');
                                    // console.log('Lets end it here');
                                    // setTimeout(endProcess, 1000);
                                    endProcess();
                                }
                            }
                        }
                    }
                    else{
                            continue;
                    }
                }

                // console.log(`collided objects: `, collidingObjects);

                // let lastColCoord = {x: null, y:null};

                // Loop through all detected collisions and update velocity
                for(let colIndex = 0; colIndex < collidingObjects.length; colIndex++){
                    let nextCheck = collidingObjects[colIndex].object;
                    let direction = collidingObjects[colIndex].direction;

                    let baseAngle = Math.atan((nextCheck.height/2) / (nextCheck.width/2))*180/Math.PI;

                    // console.log(`object height: ${nextCheck.height}, width: ${nextCheck.width}`);

                    // switch(collidingObjects[colIndex].direction){
                    //     case 'left':
                    //     case 'right':
                    //         break;
                    //     case 'top':
                    //
                    //     case 'bottom':
                    //         break;
                    // }

                    let angleCheck = get.radCalc(
                        {
                            x: (hasCollided.xVal === null ? oldCoord.x : hasCollided.xVal)+20,
                            y: (hasCollided.yVal === null ? oldCoord.y : hasCollided.yVal)+20
                        },
                        {x:nextCheck.x+25, y:nextCheck.y+25}) * 180/Math.PI;

                    // if(nextCheck.type === 'door'){
                    //     console.log(`height: ${nextCheck.height}, width: ${nextCheck.width}`);
                    // }

                    // console.log(`>>>>>>>>>>>>> ${colIndex} <<<<<<<<<<<<<<<`);
                    // console.log(`^^^^^^^^^^^^before velX: ${velX}, velY: ${velY}`);
                    // console.log(`angle is: ${angleCheck}, direction is: ${collidingObjects[colIndex].direction}`);
                    // console.log(`collide obj origin: (${nextCheck.x}, ${nextCheck.y})`);
                    // console.log(`oldCoord origin: (${oldCoord.x}, ${oldCoord.y})`);
                    // console.log(`nextCoord: (${nextCoord.nextX}, ${nextCoord.nextY})`);
                    // console.log(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`);
                    // console.log('collision!');

                    let northwest =  180+baseAngle;
                    let northeast = 360-baseAngle;
                    let southwest = 180-baseAngle;
                    let southeast = baseAngle;

                    // console.log(`base angle: ${baseAngle}`);
                    // console.log(`NW: ${northwest}, NE: ${northeast}, SW: ${southwest}, SE: ${southeast}`);

                    if(
                        (angleCheck > southeast && angleCheck < southwest) ||
                        (angleCheck > northwest && angleCheck < northeast)){
                        velY = 0;
                        hasCollided.y = true;
                        hasCollided.yVal = direction === 'top' ? nextCheck.y-40 : nextCheck.y+nextCheck.height;

                        // lastColCoord.y = nextCheck.y;

                    }
                    else if(
                        (angleCheck >= 0 && angleCheck < southeast) ||
                        (angleCheck > northeast && angleCheck <= 360) ||
                        (angleCheck > southwest && angleCheck < northwest)){
                        velX = 0;
                        hasCollided.x = true;
                        hasCollided.xVal = direction === 'right' ? nextCheck.x+nextCheck.width: nextCheck.x-40 ;

                        // lastColCoord.x = nextCheck.x;
                    }
                    else{
                        // console.log('at some intermediate degree angle!');
                        switch(collidingObjects[colIndex].direction){
                            case 'left':
                            case 'right':
                                if(collidingObjects.length === 1){
                                    velX = 0;
                                    hasCollided.x = true;
                                    hasCollided.xVal = direction === 'right' ? nextCheck.x+nextCheck.width: nextCheck.x-40 ;
                                }
                                break;
                            case 'top':
                            case 'bottom':
                                if(collidingObjects.length === 1) {
                                    velY = 0;
                                    hasCollided.y = true;
                                    hasCollided.yVal = direction === 'top' ? nextCheck.y - 40 : nextCheck.y + nextCheck.height;
                                }
                                break;
                        }
                    }

                    // if(nextCoord.nextX+50 >  nextCheck.x || nextCoord.nextX < nextCheck.x+50){
                    //     console.log('stopping x!');
                    //     velX = 0;
                    // }
                    //
                    // if(nextCoord.nextY+50 >  nextCheck.y || nextCoord.nextY < nextCheck.y+50){
                    //     console.log('>>>>>>>>>>>>>stopping y!');
                    //     velY = 0;
                    // }

                }

                // console.log(`<><><><><><><><><><> hasCollided: xVal:${hasCollided.xVal}, yVal: ${hasCollided.yVal}`);
                //
                // console.log(`------------------------ velX: ${velX}, velY: ${velY}`);

                if(collidingObjects.length < 2){
                    hasCollided.x = false;
                    hasCollided.y = false;
                    hasCollided.xVal = null;
                    hasCollided.yVal = null;
                }

                // If no collision, continue moving
                objToUpdate.status.posX += velX;
                objToUpdate.status.posY += velY;
            }
        }
    }
    else {
        return null;
    }
}

// Returns true if there is a collision
// Returns false if no collision
// Checks first for circles & arcs
// Then defaults to checks for rectangle type boundaries
function checkCollide(objToUpdate, oldCoord, nextCoord, comparedObject ){
    let solid = comparedObject.solid;

    if(comparedObject.type === 'circle' || comparedObject.type === 'guard'){
        let collide = get.circleCalc(objToUpdate, oldCoord, nextCoord, comparedObject);

        if(solid && collide){
            // console.log('circle collided!');
            nextObject.emit('spymaster');
            nextObject.emit('spy');
            // console.log('Guard detected agent');
            objToUpdate.status.clickHistory.push({x: objToUpdate.status.posX, y: objToUpdate.status.posY});
            return true;
        }
        else{
            return get.circleCalc(objToUpdate, oldCoord, nextCoord, comparedObject);
        }
    }

    // Arc detection first checks if objToUpdate is within the whole circle radius
    // Then it checks if any angle from the objToUpdate's corners to the arc origin
    // is within the current angle range of the arc.
    if(comparedObject.type === 'arc' || comparedObject.type === 'camera'){
        if(get.circleCalc(objToUpdate, oldCoord, nextCoord, comparedObject)){
            // Get arc origin point and current start/end angles in degrees
            let arcOrigin = {x: comparedObject.x, y: comparedObject.y};
            let arcAngles = {start: comparedObject.start * (180/Math.PI), end: comparedObject.end * (180/Math.PI) };

            if(arcAngles.start < 0){
                arcAngles.start += 360;
            }

            if(arcAngles.end < 0){
                arcAngles.end += 360;
            }

            // Get width/height of objToUpdate
            let width = objToUpdate.status.width;
            let height = objToUpdate.status.height;

            // Get coordinates of all 4 objToUpdate corners
            let origin = {x: oldCoord.x, y: oldCoord.y};
            let topRight = {x: origin.x+width, y: origin.y};
            let botRight = {x: origin.x+width, y: origin.y+height};
            let botLeft = {x: origin.x, y: origin.y+height};

            let coordArray = [
                origin,
                topRight,
                botRight,
                botLeft
            ];

            // Get angles of all 4 objToUpdate corners compared to arcOrigin
            let originAngle = get.radCalc(origin, arcOrigin) * (180/Math.PI);
            let trAngle = get.radCalc(topRight, arcOrigin) * (180/Math.PI);
            let brAngle = get.radCalc(botRight, arcOrigin) * (180/Math.PI);
            let blAngle = get.radCalc(botLeft, arcOrigin) * (180/Math.PI);

            // Put all angles in array
            let angleArray = [];
            angleArray[0] = originAngle;
            angleArray[1] = trAngle;
            angleArray[2] = brAngle;
            angleArray[3] = blAngle;

            // if(comparedObject.name = 'cam1'){
            //     console.log(`>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>`);
            //     console.log(`>>>> arcOrigin: (${arcOrigin.x}, ${arcOrigin.y})`);
            //     console.log(`>>>> arcAngles: start - ${arcAngles.start}, end - ${arcAngles.end}`);
            //     console.log(`>>>> origin: (${origin.x}, ${origin.y}), topRight: (${topRight.x}, ${topRight.y})`);
            //     console.log(`>>>> origin angle: (${originAngle}), topRight angle: (${trAngle})`);
            //     console.log(`>>>> botLeft: (${botLeft.x}, ${botLeft.y}), botRight: (${botRight.x}, ${botRight.y})`);
            //     console.log(`>>>> botLeft angle: (${blAngle}), botRight angle: (${brAngle})`);
            // }

            // Loop through all angles and check if any of them are within the arc start/end range.
            // First if statement assumes angles are lower than 360
            // Second if statement checks for an end angle > 360
            // Third if statement checks for both end and start angles > 360
            for(let i = 0; i < angleArray.length; i++){
                if(angleArray[i] > arcAngles.start && angleArray[i] < arcAngles.end){
                    let xDist = Math.abs(coordArray[i].x - arcOrigin.x);
                    let yDist = Math.abs(coordArray[i].y - arcOrigin.y);
                    let cornerDist = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));

                    if(cornerDist <= comparedObject.r){
                        // console.log(`ith: ${i}, cornerDist: ${cornerDist}, compObj.r: ${comparedObject.r}`);
                        return true;
                    }
                }
                else if(arcAngles.end > 360 && angleArray[i] < arcAngles.end-360 && angleArray[i] >=0){
                    let xDist = Math.abs(coordArray[i].x - arcOrigin.x);
                    let yDist = Math.abs(coordArray[i].y - arcOrigin.y);
                    let cornerDist = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));

                    if(cornerDist <= comparedObject.r){
                        // console.log(`ith: ${i}, cornerDist: ${cornerDist}, compObj.r: ${comparedObject.r}`);
                        return true;
                    }
                }
                else if(arcAngles.end > 360 && arcAngles.end > 360){

                    if(angleArray[i] > arcAngles.start-360 && angleArray[i] < arcAngles.end-360) {

                        let xDist = Math.abs(coordArray[i].x - arcOrigin.x);
                        let yDist = Math.abs(coordArray[i].y - arcOrigin.y);
                        let cornerDist = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));

                        if(cornerDist <= comparedObject.r){
                            // console.log(`ith: ${i}, cornerDist: ${cornerDist}, compObj.r: ${comparedObject.r}`);
                            return true;
                        }

                    }

                }

            }
            return false;
        }
    }

    if (nextCoord === null){
        return false;
    }

    // Standard variables for box objects
    let minX = comparedObject.x - objToUpdate.status.width;
    let minY = comparedObject.y - objToUpdate.status.height;

    let maxX = comparedObject.x + comparedObject.width;
    let maxY = comparedObject.y + comparedObject.height;

    let nextX = nextCoord.nextX;
    let nextY = nextCoord.nextY;

    // let solid = comparedObject.solid;

    // Currently has glitch for perpendicular walls
    // It is possible to push through one wall using repeat clicks
    // If on the edge of the 2 wall intersection
    if(oldCoord.x <= minX && nextX > minX && nextY > minY && nextY < maxY){

        if(solid){
            collidingObjects.push({object:comparedObject, direction: 'left'});
            // console.log('colliding left side!');
            // objToUpdate.status.clickHistory.push({x: minX, y: nextY});
            //
            // objToUpdate.status.posX = minX;
            // objToUpdate.status.posY = nextY;
        }
        return true;
    }

    if(oldCoord.x >= maxX && nextX < maxX && nextY > minY && nextY < maxY){

        if(solid){
            collidingObjects.push({object: comparedObject, direction: 'right'});
            // console.log('colliding right side!');
            // objToUpdate.status.clickHistory.push({x: maxX, y: nextY});
            //
            // objToUpdate.status.posX = maxX;
            // objToUpdate.status.posY = nextY;
        }

        return true;
    }

    if(oldCoord.y <= minY && nextY > minY && nextX > minX && nextX < maxX){

        if(solid){
            collidingObjects.push({object: comparedObject, direction: 'top'});
            // console.log('colliding top side!');
            // objToUpdate.status.clickHistory.push({x: nextX, y: minY});
            //
            // objToUpdate.status.posX = nextX;
            // objToUpdate.status.posY = minY;
        }

        return true;
    }

    if(oldCoord.y >= maxY && nextY < maxY && nextX > minX && nextX < maxX){

        if(solid){
            collidingObjects.push({object: comparedObject, direction: 'bottom'});
            // console.log('colliding bottom side!');
            // objToUpdate.status.clickHistory.push({x: nextX, y: maxY});
            //
            // objToUpdate.status.posX = nextX;
            // objToUpdate.status.posY = maxY;
        }

        return true;
    }

    if(oldCoord.x > minX && oldCoord.x < maxX && oldCoord.y > minY && oldCoord.y < maxY){
        return true;
    }

    return false;
}

function Simulation(){

}

// http.listen(port, function(){
//     console.log('listening on *: ', port);
// });

