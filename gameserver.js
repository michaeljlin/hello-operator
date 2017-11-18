var gameObject = require('./helper/gameObject');
const get = require("./helper/calcFunctions");

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const port = 8000;

// *****Global variables listed below should be transferred to Simulation object at a later time*****
var randColor = ['blue', 'yellow', 'red', 'green', 'grey', 'purple'];
var randColor1 = ['blue', 'red', 'green'];
var randColor2 = ['yellow', 'black', 'purple'];

var nameAdj = ['magnificent', 'vicious', 'friendly', 'cheerful', 'sad', 'happy', 'confused', 'lazy', 'jolly', 'effervescent', 'noble', 'cowardly', 'silly', 'thunderous', 'insightful', 'foolish', 'panicked', 'determined', 'awesome', 'sleepy', 'energetic', 'joyful', 'superior', 'alpha', 'courageous', 'far-sighted', 'limping', 'bumbling', 'serious', 'playful', 'cantankerous', 'stubborn', 'relaxed', 'laughing', 'coughing', 'blind', 'sublime', 'naked', 'ascended', 'swift', 'supreme', 'mad', 'silver', 'crimson', 'golden', 'silent', 'brash', 'crying'];
var nameAnimal = ['octopus', 'tiger', 'chihuahua', 'shark', 'whale', 'hawk', 'eagle', 'leopard', 'cheetah', 'elephant', 'horse', 'beagle', 'piranha', 'platypus', 'ostrich', 'kakapo', 'parrot', 'wolf', 'snake', 'lizard', 'butterfly', 'frog', 'chameleon', 'fox', 'coyote', 'hummingbird', 'buffalo', 'chicken', 'hyena', 'lion', 'llama', 'alpaca', 'dove', 'mantis', 'owl', 'ox', 'squid', 'bat', 'capybara', 'bison', 'mammoth', 'chimp', 'hornet', 'squirrel', 'hamster', 'tortoise', 'raven', 'crow', 'dragon', 'unicorn', 'antelope', 'gazelle', 'giraffe', 'mongoose', 'weasel', 'badger'];

var simulationReference = null;

var finalSimState = [];
var spySimState = [];

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
    }
    else if(playerTracker.length > 1){
        socketHolder2 = socket;
        socket.join('spy');
    }


    var playerInfo = {
        profilePic: './assets/images/test_fb_1.jpg',
        userName:  'superawesomusername007',
        agentName: 'coughing chameleon',
        sprite: 'test_sprite_1.jpg',
    };

    socket.emit('updatePlayer', playerInfo);

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
        width: 50,
        height: 50,
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
    // console.log("Sim is running!");

    if(playerTracker.length === 1){
        io.emit('timer', 'green');
    }
    else{
        // io.to('spymaster').emit('timer', 'green');

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

        finalSimState[finalSimState.length-1].update();

        // finalSimState[9].update();
        // finalSimState[10].update();
        // finalSimState[1].update();

        finalSimState[0] = newSimState;
        spySimState[0] = newSimState;

        io.to('spymaster').emit('update', spySimState);
        io.to('spy').emit('update', spySimState);
        // io.to('spy').emit('player', "hi there!");

    }
}
function initializeMap(){

    let width = 800;
    let height = 800;

    let tileWidth = 50;
    let tileHeight = 50;

    finalSimState = [
        {},
        // []
    ];

    for(let i = 0; i < width/tileWidth; i++ ){

        for(let j = 0; j < height/tileHeight; j++){

            // let nextColor = randColor[Math.floor(Math.random()*(randColor.length))];

            // console.log(`i: ${i}, j: ${j}, color: ${nextColor}`);

            // let nextTile = new gameObject.Box(50*i, 50*j, tileWidth, tileHeight, nextColor, false, false, true);

            let nextTile = null;

            if(i < 2){
                nextTile = new gameObject.Cobble1(50 * i, 50 * j);
            }
            else if( i < 4) {
                nextTile = new gameObject.Wood1(50 * i, 50 * j);
            }
            else if(i < 6){
                nextTile = new gameObject.Grass1(50 * i, 50 * j);
            }
            else if(i < 8){
                nextTile = new gameObject.Dirt1(50 * i, 50 * j);
            }
            else if(i < 10){
                nextTile = new gameObject.Wood3(50 * i, 50 * j);
            }
            else if(i < 12){
                nextTile = new gameObject.GreyTile(50 * i, 50 * j);
            }
            else if(i < 14){
                nextTile = new gameObject.WhiteTile(50 * i, 50 * j);
            }
            else{
                nextTile = new gameObject.WaterTile(50 * i, 50 * j);
            }

            finalSimState.push(nextTile);


        }

    }

    nextTile = new gameObject.OrangeMatNW(50*8, 50*5);
    finalSimState.push(nextTile);
    nextTile = new gameObject.OrangeMatN(50*9, 50*5);
    finalSimState.push(nextTile);
    nextTile = new gameObject.OrangeMatNE(50*10, 50*5);
    finalSimState.push(nextTile);

    nextTile = new gameObject.OrangeMatW(50*8, 50*6);
    finalSimState.push(nextTile);
    nextTile = new gameObject.OrangeMatC(50*9, 50*6);
    finalSimState.push(nextTile);
    nextTile = new gameObject.OrangeMatE(50*10, 50*6);
    finalSimState.push(nextTile);

    nextTile = new gameObject.OrangeMatSW(50*8, 50*7);
    finalSimState.push(nextTile);
    nextTile = new gameObject.OrangeMatS(50*9, 50*7);
    finalSimState.push(nextTile);
    nextTile = new gameObject.OrangeMatSE(50*10, 50*7);
    finalSimState.push(nextTile);

    nextTile = new gameObject.BlackCouchLeft(50*4, 50*5);
    finalSimState.push(nextTile);
    nextTile = new gameObject.BlackCouchMiddle(50*5, 50*5);
    finalSimState.push(nextTile);
    nextTile = new gameObject.BlackCouchRight(50*6, 50*5);
    finalSimState.push(nextTile);

    nextTile = new gameObject.GreenCouchLeft(50*4, 50*8);
    finalSimState.push(nextTile);
    nextTile = new gameObject.GreenCouchMiddle(50*5, 50*8);
    finalSimState.push(nextTile);
    nextTile = new gameObject.GreenCouchRight(50*6, 50*8);
    finalSimState.push(nextTile);

    nextTile = new gameObject.WoodWallVertical(150,750);
    finalSimState.push(nextTile);

    nextTile = new gameObject.WoodWallVertical(150,700);
    finalSimState.push(nextTile);

    nextTile = new gameObject.WoodWallVertical(150,650);
    finalSimState.push(nextTile);

    nextTile = new gameObject.WoodWallCornerNW(150,600);
    finalSimState.push(nextTile);

    nextTile = new gameObject.WoodWallHorizontal(200,600);
    finalSimState.push(nextTile);

    nextTile = new gameObject.WoodWallHorizontal(250,600);
    finalSimState.push(nextTile);

    nextTile = new gameObject.WoodWallHorizontal(300,600);
    finalSimState.push(nextTile);

    nextTile = new gameObject.WoodWallEastEnd(350,600);
    finalSimState.push(nextTile);

    nextTile = new gameObject.WoodWallWestEnd(500,600);
    finalSimState.push(nextTile);

    nextTile = new gameObject.WoodWallHorizontal(550,600);
    finalSimState.push(nextTile);

    nextTile = new gameObject.WoodWallHorizontal(600,600);
    finalSimState.push(nextTile);

    nextTile = new gameObject.WoodWallCornerNE(650,600);
    finalSimState.push(nextTile);

    nextTile = new gameObject.WoodWallVertical(650,650);
    finalSimState.push(nextTile);

    nextTile = new gameObject.WoodWallVertical(650,700);
    finalSimState.push(nextTile);

    nextTile = new gameObject.WoodWallVertical(650,750);
    finalSimState.push(nextTile);

    nextTile = new gameObject.Door(400,600,100,25,'blue', false, false);
    finalSimState.push(nextTile);

    // let test = new gameObject.Circle(400,600,60,0,2*Math.PI, 'black', false, true, true);
    // finalSimState.push(test);

    // for(let i = 0; i < width/tileWidth; i++ ) {
    //
    //     for (let j = 0; j < height / tileHeight; j++) {
    //         if (i % 2 === 0 && j % 3 === 0) {
    //             nextTile = new gameObject.BlackCouchRight(50 * i, 50 * j);
    //             finalSimState.push(nextTile);
    //         }
    //
    //         // if (i % 3 === 0 && j % 3 === 0) {
    //         //     nextTile = new gameObject.BlackCouchMiddle(50 * i, 50 * j);
    //         //     finalSimState.push(nextTile);
    //         // }
    //     }
    // }

    for(let i = 1; i < finalSimState.length; i++) {

        if (
            Math.abs(finalSimState[i].x - 0 - 25) < 150 &&
            Math.abs(finalSimState[i].y - 350 - 25) < 150
        ) {
            spySimState.push(finalSimState[i]);
        }
    }

    console.log(finalSimState);

    // let botDoor = new gameObject.Door(500,500,100,25,'blue', false, false);
    // let upperDoor = new gameObject.Door(200,250,100,25,'blue', true, false, true);
    //
    // let upperWallLeft = new gameObject.Wall(0,250,200, 25, 'grey');
    // let lowerWallLeft = new gameObject.Wall(0,500,500, 25, 'grey');
    // let upperCamera = new gameObject.Camera(350, 275, 150, (.35*Math.PI), (.65*Math.PI),[0,180],1, 'yellow', 'cam1');
    //
    // let upperWallRight = new gameObject.Wall(300,250,500, 25, 'grey');
    // let lowerWallRight = new gameObject.Wall(600,500,200, 25, 'grey');
    // let lowerCamera = new gameObject.Camera(650, 500, 150, (1.35*Math.PI), (1.65*Math.PI),[180,359],1, 'yellow', 'cam2');
    //
    // let bottomButton = new gameObject.Button(0, 650, 25,25, 'cyan');
    // let goal = new gameObject.Button(700, 100, 50, 50, 'gold', 'treasure');
    //
    // let exitArea = new gameObject.Exit(750,250,50,250,'green', false, false, false);
    //
    // let missionStatus = new gameObject.Word(400, 400, 'MISSION START!', 'red', '50px Arial', true, false, true);

    // finalSimState = [
    //     {},
    //         missionStatus,
    //         exitArea,
    //         upperWallLeft,
    //         lowerWallLeft,
    //         upperWallRight,
    //         lowerWallRight,
    //         upperCamera,
    //         lowerCamera,
    //         botDoor,
    //         upperDoor,
    //         bottomButton,
    //         goal
    //     ];

    // finalSimState[7].trigger(finalSimState[1]);
    // finalSimState[8].trigger(finalSimState[1]);
    // finalSimState[2].trigger(finalSimState[1]);
    // finalSimState[11].trigger(finalSimState[10]);
    // finalSimState[12].trigger(finalSimState[2]);
}
// Currently only updates player object types
// Will be changed to update all object types later
function simUpdate(objToUpdate) {

    var newCoord = objToUpdate.status.clickHistory[objToUpdate.status.clickHistory.length - 1];
    var oldCoord = {x: objToUpdate.status.posX, y: objToUpdate.status.posY};

    // RESET SPY SIM STATE HERE TO REFRESH FOR NEXT INSTANCE
    spySimState = [
        {}
    ];

    for(let i = 1; i < finalSimState.length; i++){

        let x = finalSimState[i].dx ? finalSimState[i].dx : finalSimState[i].x;
        let y = finalSimState[i].dy ? finalSimState[i].dy : finalSimState[i].y;

        if(
            Math.abs(x - objToUpdate.status.posX) < 150 &&
            Math.abs(y - objToUpdate.status.posY) < 150
        ){
            spySimState.push(finalSimState[i]);

        }

        if(finalSimState[i].type === 'camera'){
            finalSimState[i].update();

            if( checkCollide(objToUpdate, oldCoord, null, finalSimState[i]) ){
                finalSimState[1].set('MISSION FAILED! Restarting...');
                finalSimState[i].trigger(true);

                endSim();

                setTimeout(()=>{
                    playerTracker[socketHolder2.id].status.clickHistory = [];
                    playerTracker[socketHolder2.id].status.posX = 0;
                    playerTracker[socketHolder2.id].status.posY = 350;

                    startSim();
                }, 3000)
            }
        }
    }

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

                // if(checkCollide(objToUpdate, oldCoord, nextCoord, finalSimState[2])) {
                //     console.log('**************Button triggered!****************');
                //
                //     finalSimState[2].trigger(true);
                // }
                // else{
                //     finalSimState[2].trigger(false);
                // }

                // Loop through all known objects
                for(let i = 1; i < finalSimState.length; i++){

                    if(
                        Math.abs(finalSimState[i].x - objToUpdate.status.posX-25) < 150 &&
                        Math.abs(finalSimState[i].y - objToUpdate.status.posY-25) < 150
                    ){
                        if(checkCollide(objToUpdate, oldCoord, nextCoord, finalSimState[i])){

                            if(finalSimState[i].solid){

                                if(finalSimState[i].type === 'door'){

                                    if(finalSimState[i].lockState === false){
                                        finalSimState[i].animate = true;
                                        finalSimState[i].solid = false;
                                    }
                                }
                                return;
                            }

                            if(finalSimState[i].type === 'button'){

                                if(finalSimState[i].name !== 'treasure'){
                                    finalSimState[i].trigger(false);
                                }else{
                                    finalSimState[i].display = false;
                                    finalSimState[i].trigger(true);
                                }
                            }

                            if(finalSimState[i].type === 'exit'){
                                if(finalSimState[i].display === true){
                                    finalSimState[1].set('MISSION COMPLETE!');
                                    finalSimState[i].trigger(true);
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
function checkCollide(objToUpdate, oldCoord, nextCoord, comparedObject ){
    let solid = comparedObject.solid;

    if(comparedObject.type === 'circle'){

        let collide = get.circleCalc(objToUpdate, oldCoord, nextCoord, comparedObject);

        if(solid && collide){
            console.log('circle collided!');
            objToUpdate.status.clickHistory.push({x: objToUpdate.status.posX, y: objToUpdate.status.posY});
            return true;
        }
        else{
            return get.circleCalc(objToUpdate, oldCoord, nextCoord, comparedObject);;
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

            // let distArray = [];
            // let smallest = 0;
            //
            // for(let i = 0; i < coordArray.length; i++){
            //     let xDist = Math.abs(coordArray[i].x - arcOrigin.x);
            //     let yDist = Math.abs(coordArray[i].y - arcOrigin.y);
            //     let cornerDist = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
            //
            //     distArray.push(cornerDist);
            //
            //     if(i > 0){
            //         if(distArray[smallest] > distArray[distArray.length-1]){
            //             smallest = i;
            //         }
            //     }
            // }

            // let smallestCorner = coordArray[smallest];

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


            // for(let i = 0; i < angleArray.length-1; i++){
            //     if(arcAngles.start > angleArray[i] && arcAngles.start < angleArray[i+1] ){
            //         console.log('******Arc start between box corners!******');
            //         console.log(`Valid angle between arcs: ${angleArray[i]} and ${angleArray[i+1]}`);
            //
            //         if(distArray[0] < comparedObject.r || distArray[1] < comparedObject.r || distArray[2] < comparedObject.r || distArray[3] < comparedObject.r){
            //             console.log(`dist1: ${distArray[0]}, dist2: ${distArray[1]}`);
            //             console.log(`dist3: ${distArray[2]}, dist4: ${distArray[3]}`);
            //
            //             if(Math.abs(distArray[smallest].x -arcOrigin.x-Math.sin(180-arcAngles.end)*150) < 5){
            //                 return true;
            //             }
            //             else if(Math.abs(distArray[smallest].y -arcOrigin.y-Math.cos(180-arcAngles.end)*150) < 5){
            //                 return true;
            //             }
            //         return true;
            //         }
            //     }
            // }
            //
            // for(let i = 0; i < angleArray.length-1; i++){
            //     if(arcAngles.end > angleArray[i] && arcAngles.end < angleArray[i+1] ){
            //         console.log('******Arc end between box corners!******');
            //         console.log(`Valid angle between arcs: ${angleArray[i]} and ${angleArray[i+1]}`);
            //         if(distArray[0] < comparedObject.r || distArray[1] < comparedObject.r || distArray[2] < comparedObject.r || distArray[3] < comparedObject.r){
            //             console.log(`arc end angle: ${arcAngles.end}`);
            //             console.log(`arc coord y: ${arcOrigin.y-Math.sin(180-arcAngles.end)*150}`);
            //             console.log(`change y: ${Math.sin(180-arcAngles.end)*150}`);
            //             console.log(`arc coord x: ${arcOrigin.x+Math.cos(180-arcAngles.end)*150}`);
            //             console.log(`change x: ${Math.cos(180-arcAngles.end)*150}`);
            //             console.log('********');
            //             console.log(`dist1: ${distArray[0]}, dist2: ${distArray[1]}`);
            //             console.log(`coord1:(${coordArray[0].x}, ${coordArray[0].y}) coord2: (${coordArray[1].x}, ${coordArray[1].y})`);
            //             console.log(`dist3: ${distArray[2]}, dist4: ${distArray[3]}`);
            //             console.log(`coord3:(${coordArray[2].x}, ${coordArray[2].y}) coord4: (${coordArray[3].x}, ${coordArray[3].y})`);
            //
            //             console.log('**********');
            //             console.log(`smallest: ${smallest}`);
            //             if(Math.abs(distArray[smallest].x -(arcOrigin.x+Math.cos(180-arcAngles.end)*150)) < 10){
            //                 return true;
            //             }
            //             else if(Math.abs(distArray[smallest].y -(arcOrigin.y-Math.sin(180-arcAngles.end)*150)) < 10){
            //                 return true;
            //             }
            //         }
            //     }
            // }

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