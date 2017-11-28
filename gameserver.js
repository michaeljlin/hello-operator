var gameObject = require('./helper/gameObject');
const get = require("./helper/calcFunctions");
const db = require("./be/getMapCode");
const mapTileDict = require('./helper/mapTileDict');

var mapCode;
var linkCode;

function retrieveMapData() {
    db.queryDBforMapCode.then(function (fromPromise) {
        //Extract MapCode from promise
        mapCode = fromPromise.data[0].MapCode;
        mapCode = JSON.parse(mapCode);
        linkCode = fromPromise.data[0].EventLinking;
        linkCode = JSON.parse(linkCode);
    }, function (fromRejection) {
        console.log(fromRejection);
    })
}
retrieveMapData();

function harryInitMap() {
    let tileSize = 50;

    //Build the Flooring
    if(mapCode.floor.type === 'composite') {
        let flooring = mapCode.floor.content;
        flooring.forEach((item)=>{
            let tile = mapTileDict[item.tile];
            if(item.locStart !== item.locEnd){
                for(let y = item.locStart[1]; y <= item.locEnd[1]; y++){
                    for(let x = item.locStart[0]; x <= item.locEnd[0]; x++) {
                        finalSimState.push(new gameObject[tile](x*tileSize,y*tileSize));
                    }
                }
            }
        });
    } else {
        let tile = mapTileDict[mapCode.floor.content.tile];
        for(let y = 0; y <= 16; y++) {
            for (let x = 0; x <= 23; x++) {
                finalSimState.push(new gameObject[tile](x * tileSize, y * tileSize));
            }
        }
    }

    // Build physical objects (not guards or cameras)
    mapCode.objects.forEach((physObj)=>{
        let {tile, loc:pos} = physObj;
        tile = mapTileDict[tile];
        finalSimState.push(new gameObject[tile](pos[0]*tileSize,pos[1]*tileSize));
    });

    // Build walls
    mapCode.walls.forEach((wallTile)=>{
        let {tile, locStart: [stX, stY], locEnd: [endX, endY] } = wallTile;
        tile = mapTileDict[tile];
        if(stX !== endX || stY !== endY){
            for(let y = stY; y <= endY; y++){
                for(let x = stX; x <= endX; x++) {
                    finalSimState.push(new gameObject[tile](x*tileSize,y*tileSize));
                }
            }
        } else {
            finalSimState.push(new gameObject[tile](stX*tileSize,stY*tileSize));
        }
    });

    // Build utility objects (triggers, guards, cameras).
    mapCode.mapUtil.forEach((utilObj) => {
        let paramArray = [];
        let constructor;
        for(let key in utilObj) {
            switch(key) {
                case 'id':
                    break;
                case 'type':
                    constructor = utilObj[key];
                    break;
                case 'start':
                case 'end':
                    paramArray.push(eval(utilObj[key]));
                    break;
                case 'x':
                case 'y':
                    paramArray.push(utilObj[key]*tileSize);
                    break;
                default:
                    paramArray.push(utilObj[key]);
            }
        }
        let newUtilObj = new gameObject[constructor](...paramArray);
        switch(constructor) {
            case 'Camera':
                activeObjectSimState.push(newUtilObj);
                break;
            case 'Guard':
                guardSimState.push(newUtilObj);
                break;
            case 'Word':
                finalSimState.splice(3,0,newUtilObj);
                break;
            case 'Button':
                newUtilObj.display = false;
            default:
                finalSimState.push(newUtilObj);
        }

    });

    // Link Objects
    for (let eventToLink in linkCode) {
        let [obj,link] = linkCode[eventToLink];

        //Link guards and cams
        if(eventToLink === 'guard' || eventToLink === 'camera') {
            let [guardOrCam, gOcPos] = obj;
            finalSimState[guardOrCam][gOcPos].trigger(finalSimState[link]);
        //Link Other Objs(buttons, doors);
        } else {
            let objIndx = finalSimState.length + obj;
            let linkIndx = finalSimState.length + link;
            finalSimState[objIndx].trigger(finalSimState[linkIndx]);
        }
    }
}




var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const port = 8000;

var eventMessage = "";

// *****Global variables listed below should be transferred to Simulation object at a later time*****
var randColor = ['blue', 'yellow', 'red', 'green', 'grey', 'purple'];
var randColor1 = ['blue', 'red', 'green'];
var randColor2 = ['yellow', 'black', 'purple'];

var nameAdj = ['magnificent', 'vicious', 'friendly', 'cheerful', 'sad', 'happy', 'confused', 'lazy', 'jolly', 'effervescent', 'noble', 'cowardly', 'silly', 'thunderous', 'insightful', 'foolish', 'panicked', 'determined', 'awesome', 'sleepy', 'energetic', 'joyful', 'superior', 'alpha', 'courageous', 'far-sighted', 'limping', 'bumbling', 'serious', 'playful', 'cantankerous', 'stubborn', 'relaxed', 'laughing', 'coughing', 'blind', 'sublime', 'naked', 'ascended', 'swift', 'supreme', 'mad', 'silver', 'crimson', 'golden', 'silent', 'brash', 'crying'];
var nameAnimal = ['octopus', 'tiger', 'chihuahua', 'shark', 'whale', 'hawk', 'eagle', 'leopard', 'cheetah', 'elephant', 'horse', 'beagle', 'piranha', 'platypus', 'ostrich', 'kakapo', 'parrot', 'wolf', 'snake', 'lizard', 'butterfly', 'frog', 'chameleon', 'fox', 'coyote', 'hummingbird', 'buffalo', 'chicken', 'hyena', 'lion', 'llama', 'alpaca', 'dove', 'mantis', 'owl', 'ox', 'squid', 'bat', 'capybara', 'bison', 'mammoth', 'chimp', 'hornet', 'squirrel', 'hamster', 'tortoise', 'raven', 'crow', 'dragon', 'unicorn', 'antelope', 'gazelle', 'giraffe', 'mongoose', 'weasel', 'badger'];

var simulationReference = null;

var finalSimState = [];
var spySimState = [];
var handlerSimState = [];
var guardSimState = [];
var activeObjectSimState = [];

// Length is used to determine remaining players in sim
// Count is used for ID of players
var playerTracker = {
    length: 0,
    count: 0,
    playerIDs: [],
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
    console.log(playerTracker);
    if(playerTracker.length === 1){
        startSim();
        socketHolder = socket;
        socket.join('spymaster');
        // var role = 'spymaster';
    }
    else if(playerTracker.length > 1){
        socketHolder2 = socket;
        socket.join('spy');
        // var role = 'spy'
    }

    // socket.to('spymaster').emit('spymaster');
    // socket.to('spy').emit('spy');

    var playerInfo = {
        profilePic: './assets/images/test_fb_1.jpg',
        userName:  'superawesomusername007',
        agentName: 'coughing chameleon',
        sprite: 'test_sprite_1.jpg',
        // role: role,
    };

    socket.emit('updatePlayer', playerInfo);

    socket.on('login_submit', (inputValues, id) => {
        console.log(inputValues, 'player id', id);
    });

    // Click event takes in coordinates and calculates the needed vectors to reach it
    // based on the player's current position.
    socket.on('click', (event)=>{
        console.log('click event from '+ socket.id +' received: ', event);
        // console.log('attempting to push into: ', playerTracker[socket.id].status);
        // console.log(playerTracker[socket.id].status.name+"'s click history: ", playerTracker[socket.id].status.clickHistory);


        playerTracker[socket.id].status.clickHistory.push(event);
        // playerTracker[socket.id].update();
    });

    socket.on('keydown', (event)=>{
        console.log('key down event from '+ socket.id +' received: ', event);
        playerTracker[socket.id].status.keys[event] = true;

    });

    socket.on('keyup', (event)=>{
        console.log('key up event from '+ socket.id +' received: ', event);
        playerTracker[socket.id].status.keys[event] = false;

        if(event === '`'){
            console.log("resetting!");
            initializeMap();
        }
    });

    socket.on('disconnect', () =>{
        console.log('client has disconnected');
        playerTracker.length--;
        console.log("results: ",playerTracker);

        if(playerTracker.length === 0){
            endSim();
        }
    });

    //Rebecca added for UI input
    socket.on('com_button_press', () =>{
        console.log('com button pressed');
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
        console.log('com check clicked');
        //Display time elapsed
    });


    // socket.emit('player event', eventMessage);
});

app.use(express.static("public"));

function PlayerObject(number, id, name, color, profilePic){
    this.number = number;
    this.id = id;

    this.status = {
        name: name,
        posX: 0,
        posY: 350,
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
    initializeMap();

    simulationReference = setInterval(simulation, pollRate);

}

function endSim(){

    clearInterval(simulationReference);

    console.log("Simulation has ended!");
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

        let nextID = playerTracker.playerIDs[playerTracker.playerIDs.length-1];

        simUpdate(playerTracker[nextID]);

        // playerTracker[nextID].status.degrees +=1;
        //
        // if(playerTracker[nextID].status.degrees === 360){
        //     playerTracker[nextID].status.degrees = 0;
        // }

        newSimState.x = playerTracker[nextID].status.posX;
        newSimState.y = playerTracker[nextID].status.posY;
        newSimState.degrees = playerTracker[nextID].status.degrees;

        // Temporary update for camera
        finalSimState[2][0].update();

        // Temporary update for door object
        finalSimState[finalSimState.length-2].update();

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

    // let newGuard = new gameObject.Guard(650, 150, 'vertical', [150, 400], 1.5);
    // guardSimState.push(newGuard);
    //
    // let lowerCamera = new gameObject.Camera(550, 600, 150, (1.35*Math.PI), (1.65*Math.PI),[180,359], .25, 'yellow', 'cam2');
    // activeObjectSimState.push(lowerCamera);
    //
    // let missionStatus = new gameObject.Word(400, 400, 'MISSION START!', 'red', '50px Arial', true, false, true);



    harryInitMap();

    // for(let i = 0; i < width/tileWidth; i++ ){
    //
    //     for(let j = 0; j < height/tileHeight; j++){
    //
    //         let nextTile = null;
    //
    //         if(i < 2){
    //             nextTile = new gameObject.Cobble1(50 * i, 50 * j);
    //         }
    //         else if( i < 4) {
    //             nextTile = new gameObject.Wood1(50 * i, 50 * j);
    //         }
    //         else if(i < 6){
    //             nextTile = new gameObject.Grass1(50 * i, 50 * j);
    //         }
    //         else if(i < 8){
    //             nextTile = new gameObject.Dirt1(50 * i, 50 * j);
    //         }
    //         else if(i < 10){
    //             nextTile = new gameObject.Wood3(50 * i, 50 * j);
    //         }
    //         else if(i < 12){
    //             nextTile = new gameObject.GreyTile(50 * i, 50 * j);
    //         }
    //         else if(i < 14){
    //             nextTile = new gameObject.WhiteTile(50 * i, 50 * j);
    //         }
    //         else{
    //             nextTile = new gameObject.WaterTile(50 * i, 50 * j);
    //         }
    //         finalSimState.push(nextTile);
    //
    //     }
    //
    // }


    // nextTile = new gameObject.OrangeMatNW(50*8, 50*5);
    // finalSimState.push(nextTile);
    // nextTile = new gameObject.OrangeMatN(50*9, 50*5);
    // finalSimState.push(nextTile);
    // nextTile = new gameObject.OrangeMatNE(50*10, 50*5);
    // finalSimState.push(nextTile);
    //
    // nextTile = new gameObject.OrangeMatW(50*8, 50*6);
    // finalSimState.push(nextTile);
    // nextTile = new gameObject.OrangeMatC(50*9, 50*6);
    // finalSimState.push(nextTile);
    // nextTile = new gameObject.OrangeMatE(50*10, 50*6);
    // finalSimState.push(nextTile);
    //
    // nextTile = new gameObject.OrangeMatSW(50*8, 50*7);
    // finalSimState.push(nextTile);
    // nextTile = new gameObject.OrangeMatS(50*9, 50*7);
    // finalSimState.push(nextTile);
    // nextTile = new gameObject.OrangeMatSE(50*10, 50*7);
    // finalSimState.push(nextTile);
    //
    // nextTile = new gameObject.WideScreenLeft(50*4, 50*3);
    // finalSimState.push(nextTile);
    // nextTile = new gameObject.WideScreenRight(50*5, 50*3);
    // finalSimState.push(nextTile);
    // nextTile = new gameObject.Monitor(50*7, 50*3);
    // finalSimState.push(nextTile);
    //
    //
    // nextTile = new gameObject.BlackCouchLeft(50*4, 50*5);
    // finalSimState.push(nextTile);
    // nextTile = new gameObject.BlackCouchMiddle(50*5, 50*5);
    // finalSimState.push(nextTile);
    // nextTile = new gameObject.BlackCouchRight(50*6, 50*5);
    // finalSimState.push(nextTile);
    //
    // nextTile = new gameObject.GreenCouchLeft(50*4, 50*8);
    // finalSimState.push(nextTile);
    // nextTile = new gameObject.GreenCouchMiddle(50*5, 50*8);
    // finalSimState.push(nextTile);
    // nextTile = new gameObject.GreenCouchRight(50*6, 50*8);
    // finalSimState.push(nextTile);
    //
    // nextTile = new gameObject.WoodWallVertical(150,750);
    // finalSimState.push(nextTile);
    //
    // nextTile = new gameObject.WoodWallVertical(150,700);
    // finalSimState.push(nextTile);
    //
    // nextTile = new gameObject.WoodWallVertical(150,650);
    // finalSimState.push(nextTile);
    //
    // nextTile = new gameObject.WoodWallCornerNW(150,600);
    // finalSimState.push(nextTile);
    //
    // nextTile = new gameObject.WoodWallHorizontal(200,600);
    // finalSimState.push(nextTile);
    //
    // nextTile = new gameObject.WoodWallHorizontal(250,600);
    // finalSimState.push(nextTile);
    //
    // nextTile = new gameObject.WoodWallHorizontal(300,600);
    // finalSimState.push(nextTile);
    //
    // nextTile = new gameObject.WoodWallEastEnd(350,600);
    // finalSimState.push(nextTile);
    //
    // nextTile = new gameObject.WoodWallWestEnd(500,600);
    // finalSimState.push(nextTile);
    //
    // nextTile = new gameObject.WoodWallHorizontal(550,600);
    // finalSimState.push(nextTile);
    //
    // nextTile = new gameObject.WoodWallHorizontal(600,600);
    // finalSimState.push(nextTile);
    //
    // nextTile = new gameObject.WoodWallCornerNE(650,600);
    // finalSimState.push(nextTile);
    //
    // nextTile = new gameObject.WoodWallVertical(650,650);
    // finalSimState.push(nextTile);
    //
    // nextTile = new gameObject.WoodWallVertical(650,700);
    // finalSimState.push(nextTile);
    //
    // nextTile = new gameObject.WoodWallVertical(650,750);
    // finalSimState.push(nextTile);

    // nextTile = new gameObject.Door(400,600,100,25,'blue', true, false);
    // finalSimState.push(nextTile);

    // nextTile = new gameObject.Button(600, 200, 200, 200, 'blue');
    // nextTile.display = false;
    // nextTile.trigger(finalSimState[finalSimState.length-1]);   // Button trigger Door
    // finalSimState.push(nextTile);

    // let missionStatus = new gameObject.Word(400, 400, 'MISSION START!', 'red', '50px Arial', true, false, true);
    // finalSimState.push(missionStatus);

    // let lowerCamera = new gameObject.Camera(550, 600, 150, (1.35*Math.PI), (1.65*Math.PI),[180,359], .25, 'yellow', 'cam2');
    // lowerCamera.trigger(finalSimState[finalSimState.length-1]);          // Camera.trigger(missionStatus)
    // finalSimState.push(lowerCamera);

    // finalSimState[1][0].trigger(finalSimState[3]);
    // finalSimState[2][0].trigger(finalSimState[3]);
    // finalSimState[finalSimState.length-1].trigger(finalSimState[finalSimState.length-2])

    // finalSimState[finalSimState.length-4].trigger(finalSimState[finalSimState.length-3]);
    //
    // finalSimState[finalSimState.length-2].trigger(finalSimState[finalSimState.length-1]);

    // let test = new gameObject.Circle(400,600,60,0,2*Math.PI, 'black', false, true, true);
    // finalSimState.push(test);

    spySimState.push(finalSimState[0]);

    // Add all guards near player
    for(let i = 0; i < finalSimState[1].length; i++){
        if (
            Math.abs(finalSimState[1][i].x - 0 - 25) < 150 &&
            Math.abs(finalSimState[1][i].y - 350 - 25) < 150
        ) {
            spySimState[1].push(finalSimState[i]);
        }
    }

    spySimState.push([]);

    spySimState.push(finalSimState[3]);

    // Add all objects near player
    for(let i = 3; i < finalSimState.length; i++) {

        if (
            Math.abs(finalSimState[i].x - 0 - 25) < 150 &&
            Math.abs(finalSimState[i].y - 350 - 25) < 150
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
}

function handlerInterpreter(nextObject){

    // console.log('pushing to handler!');

    let type = nextObject.type;

    switch(type){
        case 'button':
            handlerSimState.push(new gameObject.Scroll(
                nextObject.x, nextObject.y,
                nextObject.width, nextObject.height
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

// Currently only updates player object types
// Will be changed to update all object types later
function simUpdate(objToUpdate) {

    var newCoord = objToUpdate.status.clickHistory[objToUpdate.status.clickHistory.length - 1];
    var oldCoord = {x: objToUpdate.status.posX, y: objToUpdate.status.posY};

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

        // if(
        //     Math.abs(nextGuard.x - objToUpdate.status.posX) < 150 &&
        //     Math.abs(nextGuard.y - objToUpdate.status.posY) < 150
        // ){
            // Check both guard and sight collision
            if( checkCollide(objToUpdate, oldCoord, null, nextGuard) || checkCollide(objToUpdate, oldCoord, null, sight)){
                finalSimState[3].set('MISSION FAILED! Restarting...');
                nextGuard.trigger(true);

                endSim();

                setTimeout(()=>{
                    playerTracker[socketHolder2.id].status.clickHistory = [];
                    playerTracker[socketHolder2.id].status.posX = 0;
                    playerTracker[socketHolder2.id].status.posY = 350;

                    startSim();
                }, 3000)
            }
            spySimState[1].push(nextGuard);
        // }
        handlerSimState[1].push(nextGuard);
    }

    for(let i = 0; i < finalSimState[2].length; i++){
        let nextObject = finalSimState[2][i];

        let x = nextObject.dx ? nextObject.dx : nextObject.x;
        let y = nextObject.dy ? nextObject.dy : nextObject.y;

        if(nextObject.type === 'camera'){
            nextObject.update();

            if( checkCollide(objToUpdate, oldCoord, null, nextObject) ){
                //Rebecca added for spymaster UI
                io.to('spymaster').emit('player_event', 'Camera detected agent');
                console.log('Camera detected agent');

                finalSimState[3].set('MISSION FAILED! Restarting...');
                nextObject.trigger(true);

                endSim();

                setTimeout(()=>{
                    playerTracker[socketHolder2.id].status.clickHistory = [];
                    playerTracker[socketHolder2.id].status.posX = 0;
                    playerTracker[socketHolder2.id].status.posY = 350;

                    startSim();
                }, 3000)
            }

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

        // if(nextObject.type === 'camera'){
        //     nextObject.update();
        //
        //     if( checkCollide(objToUpdate, oldCoord, null, nextObject) ){
        //         //Rebecca added for spymaster UI
        //         io.to('spymaster').emit('player_event', 'Camera detected agent');
        //         console.log('Camera detected agent');
        //
        //         finalSimState[finalSimState.length-1].set('MISSION FAILED! Restarting...');
        //         nextObject.trigger(true);
        //
        //         endSim();
        //
        //         setTimeout(()=>{
        //             playerTracker[socketHolder2.id].status.clickHistory = [];
        //             playerTracker[socketHolder2.id].status.posX = 0;
        //             playerTracker[socketHolder2.id].status.posY = 350;
        //
        //             startSim();
        //         }, 3000)
        //     }
        // }

        // Handle objects to be shown on spy screen
        // Only push in objects near the spy
        // Do not show camera type objects to spy
        if(
            Math.abs(x - objToUpdate.status.posX) < 150 &&
            Math.abs(y - objToUpdate.status.posY) < 150
        ){
            if(nextObject.type !== 'camera'){
                spySimState.push(finalSimState[i]);
            }
        }

        // Handle objects to be shown on handler screen

        handlerInterpreter(nextObject);
    }

    // If spy is not at the last click history position, keep checking if he can move
    // Calculate hypotenuse & angle from current position to last click history position
    // Move in increments of 1/30th of calculated hypotenuse until close to last click history position
    //
    // checkCollide currently inherently handles solid collisions by directly modifying
    // player position if detected. Should be changed later to be strictly functional
    // without any impact on player status
    //
    if (objToUpdate.status.clickHistory.length > 0 && ( (newCoord.x-25 !== oldCoord.x)||(newCoord.y-25 !== oldCoord.y) ) ) {

        if(newCoord.x !== oldCoord.x || newCoord.y !== oldCoord.y){

            let xDirection = newCoord.x - oldCoord.x - 25;
            let yDirection = newCoord.y - oldCoord.y - 25;

            let hypo = Math.sqrt(Math.pow(xDirection, 2)+ Math.pow(yDirection, 2) );

            // Make sure to subtract 25 from newCoord
            var thetaRadians = get.radCalc({x:newCoord.x-25,y:newCoord.y-25}, oldCoord);

            objToUpdate.status.degrees = thetaRadians * 180/Math.PI;

            let partHypo = hypo / 30;

            // If very close to click point, set current location to click point
            // Reduces computation needs
            if(partHypo < 0.02){
                objToUpdate.status.posX = newCoord.x-25;
                objToUpdate.status.posY = newCoord.y-25;
            }else{

                let velX = Math.cos(thetaRadians)*partHypo;
                let velY = Math.sin(thetaRadians)*partHypo;

                let nextX = objToUpdate.status.posX + velX;
                let nextY = objToUpdate.status.posY + velY;

                let nextCoord = {nextX: nextX, nextY: nextY};

                // Loop through all known objects
                // First checks if object is within sight range of player (currently 150 pixels)
                // Then checks collision with object
                // If positive, check type of object
                // Call a trigger function on the object to change the state of another object
                for(let i = 3; i < finalSimState.length; i++){
                    let nextObject = finalSimState[i];

                    if(
                        Math.abs(nextObject.x - objToUpdate.status.posX-25) < 150 &&
                        Math.abs(nextObject.y - objToUpdate.status.posY-25) < 150
                    ){
                        if(checkCollide(objToUpdate, oldCoord, nextCoord, nextObject)){

                            if(nextObject.solid){
                                if(nextObject.type === 'door'){
                                    if(nextObject.lockState === false){
                                        nextObject.animate = true;
                                        nextObject.solid = false;
                                    }
                                }
                                return;
                            }

                            if(nextObject.type === 'button'){

                                // Currently a button named 'treasure' is the exit trigger
                                // Must define a treasure gameObject later
                                if(nextObject.name !== 'treasure'){
                                    nextObject.trigger(false);
                                }else{
                                    nextObject.display = false;
                                    nextObject.trigger(true);
                                }
                            }

                            if(nextObject.type === 'exit'){
                                if(nextObject.display === true){
                                    finalSimState[3].set('MISSION COMPLETE!');
                                    nextObject.trigger(true);
                                }
                            }
                        }
                    }
                    else{
                            continue;
                    }
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
            console.log('circle collided!');
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

            // Loop through all angles and check if any of them are within the arc
            // start/end range. Does not currently account for 360/0 degree ranges
            // AKA right facing horizontal camera angles
            for(let i = 0; i < angleArray.length; i++){
                if(angleArray[i] > arcAngles.start && angleArray[i] < arcAngles.end){
                    let xDist = Math.abs(coordArray[i].x - arcOrigin.x);
                    let yDist = Math.abs(coordArray[i].y - arcOrigin.y);
                    let cornerDist = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));

                    if(cornerDist <= comparedObject.r){
                        console.log(`ith: ${i}, cornerDist: ${cornerDist}, compObj.r: ${comparedObject.r}`);
                        return true;
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
            objToUpdate.status.clickHistory.push({x: minX, y: nextY});

            objToUpdate.status.posX = minX;
            objToUpdate.status.posY = nextY;
        }
        return true;
    }

    if(oldCoord.x >= maxX && nextX < maxX && nextY > minY && nextY < maxY){

        if(solid){
            objToUpdate.status.clickHistory.push({x: maxX, y: nextY});

            objToUpdate.status.posX = maxX;
            objToUpdate.status.posY = nextY;
        }

        return true;
    }

    if(oldCoord.y <= minY && nextY > minY && nextX > minX && nextX < maxX){

        if(solid){
            objToUpdate.status.clickHistory.push({x: nextX, y: minY});

            objToUpdate.status.posX = nextX;
            objToUpdate.status.posY = minY;
        }

        return true;
    }

    if(oldCoord.y >= maxY && nextY < maxY && nextX > minX && nextX < maxX){

        if(solid){
            objToUpdate.status.clickHistory.push({x: nextX, y: maxY});

            objToUpdate.status.posX = nextX;
            objToUpdate.status.posY = maxY;
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

http.listen(port, function(){
    console.log('listening on *: ', port);
});

