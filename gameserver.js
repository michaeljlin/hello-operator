var gameObject = require('./helper/gameObject');
const get = require("./helper/calcFunctions");

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const port = 8000;

// *****Global variables listed below should be transferred to Simulation object at a later time*****
var randColor = ['blue', 'yellow', 'red', 'green', 'black', 'purple'];
var randColor1 = ['blue', 'red', 'green'];
var randColor2 = ['yellow', 'black', 'purple'];

var nameAdj = ['magnificent', 'vicious', 'friendly', 'cheerful', 'sad', 'happy', 'confused', 'lazy', 'jolly', 'effervescent', 'noble', 'cowardly', 'silly', 'thunderous', 'insightful', 'foolish', 'panicked', 'determined', 'awesome', 'sleepy', 'energetic', 'joyful', 'superior', 'alpha', 'courageous', 'far-sighted', 'limping', 'bumbling', 'serious', 'playful', 'cantankerous', 'stubborn', 'relaxed', 'laughing', 'coughing', 'blind', 'sublime', 'naked', 'ascended', 'swift', 'supreme', 'mad', 'silver', 'crimson', 'golden', 'silent', 'brash', 'crying'];
var nameAnimal = ['octopus', 'tiger', 'chihuahua', 'shark', 'whale', 'hawk', 'eagle', 'leopard', 'cheetah', 'elephant', 'horse', 'beagle', 'piranha', 'platypus', 'ostrich', 'kakapo', 'parrot', 'wolf', 'snake', 'lizard', 'butterfly', 'frog', 'chameleon', 'fox', 'coyote', 'hummingbird', 'buffalo', 'chicken', 'hyena', 'lion', 'llama', 'alpaca', 'dove', 'mantis', 'owl', 'ox', 'squid', 'bat', 'capybara', 'bison', 'mammoth', 'chimp', 'hornet', 'squirrel', 'hampster', 'tortoise', 'raven', 'crow', 'dragon', 'unicorn', 'antelope', 'gazelle', 'giraffe', 'mongoose', 'weasel', 'badger'];

var simulationReference = null;

// Length is used to determine remaining players in sim
// Count is used for ID of players
var playerTracker = {
    length: 0,
    count: 0,
    playerIDs: []
};

var socketHolder = null;
var socketHolder2 = null;

var pollRate = 1000/60;
// 1000/60 for actual rendering

io.on('connection', function(socket){

    // playerTracker.push(new PlayerObject(playerTracker.length+1, socket.id));
    playerTracker.length++;
    playerTracker.count++;
    let randName = nameAdj[Math.floor(Math.random()*nameAdj.length)]+" "+nameAnimal[Math.floor(Math.random()*nameAnimal.length)];
    let newPlayer = new PlayerObject(playerTracker.count, socket.id, randName);
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

    // Click event takes in coordinates and calculates the needed vectors to reach it
    // based on the player's current position.
    socket.on('click', (event)=>{
        console.log('click event from '+ socket.id +' received: ', event);
        // console.log('attempting to push into: ', playerTracker[socket.id].status);
        // console.log(playerTracker[socket.id].status.name+"'s click history: ", playerTracker[socket.id].status.clickHistory);


        // if(playerTracker.length > 1 && playerTracker[socket.id].status.clickHistory.length === 0){
        //     finalSimState[1].display = false;
        // }

        playerTracker[socket.id].status.clickHistory.push(event);
        // playerTracker[socket.id].update();
    });

    socket.on('keydown', (event)=>{
        console.log('key down event from '+ socket.id +' received: ', event);
        playerTracker[socket.id].status.keys[event] = true;

        // console.log('keys is now: ',playerTracker[socket.id].status.keys);
    });

    socket.on('keyup', (event)=>{
        console.log('key up event from '+ socket.id +' received: ', event);
        playerTracker[socket.id].status.keys[event] = false;

        // console.log('keys is now: ',playerTracker[socket.id].status.keys);
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
    })

});

app.use(express.static("public"));

function PlayerObject(number, id, name, color){
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
        keys: [],
        clickHistory: [],
        items: []
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

    simulationReference = setInterval(simulation, pollRate);

}

function endSim(){

    clearInterval(simulationReference);

    console.log("Simulation has ended!");
}

function simulation(){
    // console.log("Sim is running!");

    if(playerTracker.length === 1){
        // console.log('Waiting for second player!');
        io.emit('timer', 'green');
    }
    else{


        io.to('spymaster').emit('timer', 'green');

        // io.to('spy').emit('timer', color2);

        // Only tracks 1 player object currently
        // Will be updated later to contain all objects
        let newSimState = {
            x: null,
            y: null
        };

        // Starts at i = 1 because the 0th player is the spymaster by default
        for(let i = 1; i < playerTracker.playerIDs.length; i++){
            let nextID = playerTracker.playerIDs[i];

            simUpdate(playerTracker[nextID]);

            // console.log("new status is: ",playerTracker[nextID].status);
            newSimState.x = playerTracker[nextID].status.posX;
            newSimState.y = playerTracker[nextID].status.posY;
        }

        // finalSimState[4].update();
        // finalSimState[3].update();
        finalSimState[9].update();
        finalSimState[10].update();
        finalSimState[1].update();

        finalSimState[0] = newSimState;
        // io.to('spymaster').emit('update', finalSimState);
        io.to('spy').emit('update', finalSimState);

        // setTimeout(()=>{
        //     finalSimState[1].display = false;
        // },5000);

        // console.log('alert state: '+finalSimState[3].display);
        // console.log('camera state: '+finalSimState[6].display);
    }
}

// var testBox = new gameObject.Box(300,300,100,100,'green', false, true, true);
// var testButton = new gameObject.Button(325,275,50,25,'red');
// var testAlert = new gameObject.Word(400,200,'ALERT!','red',true,false,false);
// var testSpotlight = new gameObject.Circle(500, 100, 100, 0, 2*Math.PI, 'blue', false, false, false);
// var testCamera = new gameObject.Camera(200,100,100,(.30*Math.PI),(.70*Math.PI),[0,180],1, 'yellow');
// var testLightAlert = new gameObject.Word(600,100,'SPOTLIGHT!','lightblue',true,false,true);
// var testCameraAlert = new gameObject.Word(100,50,'CAMERA!','yellow',true,false,true);

// var testCustom = new gameObject.Custom(300,300,100,20,'blue',false,false,true);
var botDoor = new gameObject.Door(500,500,100,25,'blue', false, false);
var upperDoor = new gameObject.Door(200,250,100,25,'blue', true, false, true);

var upperWallLeft = new gameObject.Wall(0,250,200, 25, 'grey');
var lowerWallLeft = new gameObject.Wall(0,500,500, 25, 'grey');
var upperCamera = new gameObject.Camera(350, 275, 150, (.35*Math.PI), (.65*Math.PI),[0,180],1, 'yellow', 'cam1');

var upperWallRight = new gameObject.Wall(300,250,500, 25, 'grey');
var lowerWallRight = new gameObject.Wall(600,500,200, 25, 'grey');
var lowerCamera = new gameObject.Camera(650, 500, 150, (1.35*Math.PI), (1.65*Math.PI),[180,359],1, 'yellow', 'cam2');

var bottomButton = new gameObject.Button(0, 650, 25,25, 'cyan');
var goal = new gameObject.Button(700, 100, 50, 50, 'gold', 'treasure');

var exitArea = new gameObject.Exit(750,250,50,250,'green', false, false, false);

var missionStatus = new gameObject.Word(400, 400, 'MISSION START!', 'red', '50px Arial', true, false, true);

var finalSimState = [
    {},
    missionStatus,
    exitArea,
    upperWallLeft,
    lowerWallLeft,
    upperWallRight,
    lowerWallRight,
    upperCamera,
    lowerCamera,
    botDoor,
    upperDoor,
    bottomButton,
    goal
];

finalSimState[7].trigger(finalSimState[1]);
finalSimState[8].trigger(finalSimState[1]);
finalSimState[2].trigger(finalSimState[1]);
finalSimState[11].trigger(finalSimState[10]);
finalSimState[12].trigger(finalSimState[2]);

// var debugRoom = [
//     {},
//     testBox,
//     testButton,
//     testAlert,
//     testCamera,
//     testSpotlight,
//     testLightAlert,
//     testCameraAlert
// ];

// Event linking
// finalSimState[2].trigger(finalSimState[3]);
// finalSimState[4].trigger(finalSimState[7]);
// finalSimState[5].trigger(finalSimState[6]);

// Currently only updates player object types
// Will be changed to update all object types later
function simUpdate(objToUpdate) {

    // finalSimState[6].update();
    // finalSimState[7].update();

    // for(let i = 1; i < finalSimState.length; i++){
    //     if(finalSimState[i].type === 'camera'){
    //         finalSimState[i].update();
    //
    //         if( checkCollide(objToUpdate, oldCoord, null, finalSimState[i]) ){
    //             console.log("Camera triggered!");
    //         }
    //     }
    // }

    var newCoord = objToUpdate.status.clickHistory[objToUpdate.status.clickHistory.length - 1];
    var oldCoord = {x: objToUpdate.status.posX, y: objToUpdate.status.posY};

    // if(checkCollide(objToUpdate, oldCoord, null, finalSimState[5])){
    //     // console.log('**************SPOTLIGHT triggered!****************');
    //
    //     finalSimState[5].trigger(true);
    // }
    // else{
    //     finalSimState[5].trigger(false);
    // }

    // if(checkCollide(objToUpdate, oldCoord, null, finalSimState[4])){
    //     console.log('**************CAMERA triggered!****************');
    //
    //     finalSimState[4].trigger(true);
    // }
    // else{
    //     finalSimState[4].trigger(false);
    // }

    for(let i = 1; i < finalSimState.length; i++){
        if(finalSimState[i].type === 'camera'){
            finalSimState[i].update();

            if( checkCollide(objToUpdate, oldCoord, null, finalSimState[i]) ){
                // console.log("Camera triggered: "+ finalSimState[i].name );
                finalSimState[1].set('MISSION FAILED!');
                finalSimState[i].trigger(true);
            }
        }
    }

    if (objToUpdate.status.clickHistory.length > 0 && ( (newCoord.x-25 !== oldCoord.x)||(newCoord.y-25 !== oldCoord.y) ) ) {

        if(newCoord.x !== oldCoord.x || newCoord.y !== oldCoord.y){
            let xDirection = newCoord.x - oldCoord.x - 25;
            let yDirection = newCoord.y - oldCoord.y - 25;

            let hypo = Math.sqrt(Math.pow(xDirection, 2)+ Math.pow(yDirection, 2) );

            var thetaRadians = null;

            if(yDirection < 0 && xDirection < 0){
                thetaRadians = Math.atan(yDirection/xDirection);
            }
            else if(yDirection < 0 && xDirection > 0){
                thetaRadians = Math.atan(xDirection / Math.abs(yDirection));
            }
            else if(yDirection < 0 || xDirection < 0){
                thetaRadians = -Math.atan(xDirection / yDirection);
            }
            else {
                thetaRadians = Math.atan(yDirection / xDirection);
            }


            // Adjustments for different x & y pos/neg values
            if(xDirection < 0 && yDirection > 0){
                let newRadians = (thetaRadians / (Math.PI / 180) + 90) * (Math.PI / 180);
                thetaRadians = newRadians;
            }

            if(xDirection < 0 && yDirection < 0){
                let newRadians = (thetaRadians / (Math.PI / 180) + 180) * (Math.PI / 180);
                thetaRadians = newRadians;
            }

            if(xDirection > 0 && yDirection < 0){
                let newRadians = (thetaRadians / (Math.PI / 180) + 270) * (Math.PI / 180);
                thetaRadians = newRadians;
            }

            // console.log('degrees: ', thetaRadians / (Math.PI / 180));

            let partHypo = hypo / 30;

            // If very close to click point, set current location to click point
            // Reduces computation needs
            if(partHypo < 0.02){
                objToUpdate.status.posX = newCoord.x-25;
                objToUpdate.status.posY = newCoord.y-25;
            }else{
                let velX = Math.cos(thetaRadians)*partHypo;
                let velY = Math.sin(thetaRadians)*partHypo;

                // Hard coded box collision
                // Based on box at (300,300) and w: 100, h:100
                // Each if statement covers 1 side of box
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
                    if(checkCollide(objToUpdate, oldCoord, nextCoord, finalSimState[i])){

                        if(finalSimState[i].solid){

                            if(finalSimState[i].type === 'door'){

                                // console.log('Collision with door!');
                                // console.log(finalSimState[i]);
                                if(finalSimState[i].lockState === false){
                                    finalSimState[i].animate = true;
                                    finalSimState[i].solid = false;
                                }
                            }
                            return;
                        }

                        if(finalSimState[i].type === 'button'){
                            // console.log("Button pressed!");

                            if(finalSimState[i].name !== 'treasure'){
                                finalSimState[i].trigger(false);
                            }else{
                                finalSimState[i].display = false;
                                finalSimState[i].trigger(true);
                            }
                        }

                        if(finalSimState[i].type === 'exit'){
                            if(finalSimState[i].display === true){
                                // console.log('Mission success!');
                                finalSimState[1].set('MISSION COMPLETE!');
                                finalSimState[i].trigger(true);
                            }
                        }
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

function radCalc(newCoord, oldCoord){
    let xDirection = newCoord.x - oldCoord.x;
    let yDirection = newCoord.y - oldCoord.y;

    var thetaRadians = null;

    if(yDirection < 0 && xDirection < 0){
        thetaRadians = Math.atan(yDirection/xDirection);
    }
    else if(yDirection < 0 && xDirection > 0){
        thetaRadians = Math.atan(xDirection / Math.abs(yDirection));
    }
    else if(yDirection < 0 || xDirection < 0){
        thetaRadians = -Math.atan(xDirection / yDirection);
    }
    else {
        thetaRadians = Math.atan(yDirection / xDirection);
    }

    // Adjustments for different x & y pos/neg values
    if(xDirection < 0 && yDirection > 0){
        thetaRadians = (thetaRadians / (Math.PI / 180) + 90) * (Math.PI / 180);
    }

    if(xDirection < 0 && yDirection < 0){
        thetaRadians = (thetaRadians / (Math.PI / 180) + 180) * (Math.PI / 180);
    }

    if(xDirection > 0 && yDirection < 0){
        thetaRadians = (thetaRadians / (Math.PI / 180) + 270) * (Math.PI / 180);
    }

    return thetaRadians;
}

// Only works for box type objects currently
// Returns true if there is a collision
// Returns false if no collision
function checkCollide(objToUpdate, oldCoord, nextCoord, comparedObject ){

    if(comparedObject.type === 'circle'){
        return get.circleCalc(objToUpdate, oldCoord, nextCoord, comparedObject);
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

            // Get angles of all 4 objToUpdate corners comared to arcOrigin
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
                    return true;
                }
            }

            for(let i = 0; i < angleArray.length-1; i++){
                if(arcAngles.start > angleArray[i] && arcAngles.start < angleArray[i+1] ){
                    console.log('******Arc start between box corners!******');
                    console.log(`Valid angle between arcs: ${angleArray[i]} and ${angleArray[i+1]}`);
                    return true;
                }
            }

            for(let i = 0; i < angleArray.length-1; i++){
                if(arcAngles.end > angleArray[i] && arcAngles.end < angleArray[i+1] ){
                    console.log('******Arc end between box corners!******');
                    console.log(`Valid angle between arcs: ${angleArray[i]} and ${angleArray[i+1]}`);
                    return true;
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

    let solid = comparedObject.solid;

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