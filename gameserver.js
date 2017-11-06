var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const port = 8000;

// *****Global variables listed below should be transferred to Simulation object at a later time*****
var randColor = ['blue', 'yellow', 'red', 'green', 'black', 'purple'];
var randColor1 = ['blue', 'red', 'green'];
var randColor2 = ['yellow', 'black', 'purple'];

var nameAdj = ['magnificent', 'vicious', 'friendly', 'cheerful', 'sad', 'happy', 'confused', 'lazy', 'jolly', 'effervescent', 'noble', 'cowardly', 'silly', 'thunderous', 'insightful', 'foolish', 'panicked', 'determined', 'awesome', 'sleepy', 'energetic', 'joyful', 'superior', 'alpha', 'courageous', 'far-sighted', 'limping', 'bumbling', 'serious', 'playful', 'cantankerous', 'stubborn', 'relaxed', 'laughing', 'coughing', 'blind', 'sublime', 'naked'];
var nameAnimal = ['octopus', 'tiger', 'chihuahua', 'shark', 'whale', 'hawk', 'eagle', 'leopard', 'cheetah', 'elephant', 'horse', 'beagle', 'piranha', 'platypus', 'ostrich', 'kakapo', 'parrot', 'wolf', 'snake', 'lizard', 'butterfly', 'frog', 'chameleon', 'fox', 'coyote', 'hummingbird', 'buffalo', 'chicken', 'hyena', 'lion', 'llama', 'alpaca', 'dove', 'mantis', 'owl', 'ox', 'squid', 'bat', 'capybara', 'bison', 'mammoth', 'chimp', 'hornet'];

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

});

app.use(express.static("public"));

function PlayerObject(number, id, name, color){
    this.number = number;
    this.id = id;

    this.status = {
        name: name,
        posX: 0,
        posY: 0,
        velX: 0,
        velY: 0,
        width: 50,
        height: 50,
        color: color || 'black',
        keys: [],
        clickHistory: []
    };

    this.update = function(newState){
        // this.status.velX = newState.velX;
        // this.status.velY = newState.velY;

        var newCoord = this.status.clickHistory[this.status.clickHistory.length - 1];
        var oldCoord = {x: this.status.posX, y: this.status.posY};

        if(newCoord.x !== oldCoord.x || newCoord.y !== oldCoord.y) {
            let xDirection = newCoord.x - oldCoord.x;
            let yDirection = newCoord.y - oldCoord.y;

            let hypo = Math.sqrt(Math.pow(xDirection, 2) + Math.pow(yDirection, 2));
            let thetaRadians = Math.atan(yDirection / xDirection);

            let partHypo = hypo / 30;
            this.status.velX = Math.cos(thetaRadians) * partHypo;
            this.status.velY = Math.sin(thetaRadians) * partHypo;
        }

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
    // var newColor = randColor[Math.floor(Math.random()*(randColor.length))];
    // console.log("Sim is running: ", newColor);
    // console.log("Sim is running!");

    if(playerTracker.length === 1){
        // console.log('Waiting for second player!');
        io.emit('timer', 'green');
    }
    else{
        // var color1 = randColor1[Math.floor(Math.random()*(randColor1.length))];
        // var color2 = randColor2[Math.floor(Math.random()*(randColor2.length))];

        // console.log("multiple players detected, sending colors: "+color1 + " "+ color2 );
        // console.log("multiple players detected");
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

        // let newObject = new basicObject(300,300, 100, 100, 'green');


        // Hard coded camera movement calculations
        let startDeg = finalSimState[4].start * (180/Math.PI);
        let range = finalSimState[4].range;

        if(startDeg >= range[1]-60){
            finalSimState[4].direction = -1;
        }
        else if(startDeg <= range[0]){
            finalSimState[4].direction = 1;
        }

        startDeg += finalSimState[4].direction;

        let endDeg = startDeg + 60;

        finalSimState[4].start = startDeg * (Math.PI/180);
        finalSimState[4].end = endDeg * (Math.PI/180);

        finalSimState[0] = newSimState;

        io.to('spy').emit('update', finalSimState);

        // console.log('alert state: '+finalSimState[3].display);
        // console.log('camera state: '+finalSimState[6].display);
    }
}

var finalSimState = [
    {},
    {type: 'box', x: 300, y:300, width: 100, height: 100, color: 'green', ui:false, solid: true, display: true},
    {type: 'box', x:325, y: 275, width: 50, height: 25, color: 'red', ui: false, solid: false, display: true},
    {type: 'word', text: 'ALERT!', x: 400, y: 200, color: 'red', ui: true, display: false},
    {type: 'arc', x: 200, y: 100, r: 100, start: (.30 * Math.PI), end: (.70 * Math.PI), color: 'yellow', range:[0,180], direction: 1, solid: false, display: true, ui: false},
    {type: 'circle', x: 500, y: 100, r: 100, start: 0, end: 2* Math.PI, color: 'blue', solid: false, display: true, ui: false},
    {type: 'word', text: 'SPOTLIGHT!', x: 600, y: 100, color: 'lightblue', ui: true, display: false},
    {type: 'word', text: 'CAMERA!', x: 100, y: 50, color: 'yellow', ui: true, display: false}
];

// Currently only updates player object types
// Will be changed to update all object types later
function simUpdate(objToUpdate) {

    var newCoord = objToUpdate.status.clickHistory[objToUpdate.status.clickHistory.length - 1];
    var oldCoord = {x: objToUpdate.status.posX, y: objToUpdate.status.posY};

    if(checkCollide(objToUpdate, oldCoord, null, finalSimState[5])){
        console.log('**************SPOTLIGHT triggered!****************');

        finalSimState[6].display = true;
    }
    else{
        finalSimState[6].display = false;
    }

    if(checkCollide(objToUpdate, oldCoord, null, finalSimState[4])){
        console.log('**************CAMERA triggered!****************');

        finalSimState[7].display = true;
    }
    else{
        finalSimState[7].display = false;
    }

    if (objToUpdate.status.clickHistory.length > 0 && ( (newCoord.x-25 !== oldCoord.x)||(newCoord.y-25 !== oldCoord.y) ) ) {

        // let origin = {x: oldCoord.x, y: oldCoord.y};
        // let topRight = {x: origin.x+50, y: origin.y};
        // let botRight = {x: origin.x+50, y: origin.y+50};
        // let botLeft = {x: origin.x, y: origin.y+50};
        //
        // console.log(`newCoord: (${newCoord.x}, ${newCoord.y}), origin: (${origin.x}, ${origin.y}), topRight: (${topRight.x}, ${topRight.y}), botRight: (${botRight.x}, ${botRight.y}), botLeft: (${botLeft.x}, ${botLeft.y}) `);

        // var newCoord = objToUpdate.status.clickHistory[objToUpdate.status.clickHistory.length - 1];
        // var oldCoord = {x: objToUpdate.status.posX, y: objToUpdate.status.posY};

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
            if(partHypo < 0.01){
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

                if(checkCollide(objToUpdate, oldCoord, nextCoord, finalSimState[2])) {
                    console.log('**************Button triggered!****************');

                    finalSimState[3].display = true;
                }
                else{
                    finalSimState[3].display = false;
                }

                // if(checkCollide(objToUpdate, oldCoord, nextCoord, finalSimState[5])){
                //     console.log('**************SPOTLIGHT triggered!****************');
                //
                //     finalSimState[6].display = true;
                // }
                // else{
                //     finalSimState[6].display = false;
                // }
                //
                // if(checkCollide(objToUpdate, oldCoord, nextCoord, finalSimState[4])){
                //     console.log('**************CAMERA triggered!****************');
                //
                //     finalSimState[7].display = true;
                // }
                // else{
                //     finalSimState[7].display = false;
                // }

                if(checkCollide(objToUpdate, oldCoord, nextCoord, finalSimState[1])){
                    console.log('**************Collision found!****************');
                    return;
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
        return circleCalc(objToUpdate, oldCoord, nextCoord, comparedObject);
    }

    if(comparedObject.type === 'arc'){
        if(circleCalc(objToUpdate, oldCoord, nextCoord, comparedObject)){
            let arcOrigin = {x: comparedObject.x, y: comparedObject.y};
            let arcAngles = {start: comparedObject.start * (180/Math.PI), end: comparedObject.end * (180/Math.PI) };

            let width = objToUpdate.status.width;
            let height = objToUpdate.status.height;

            let origin = {x: oldCoord.x, y: oldCoord.y};
            let topRight = {x: origin.x+width, y: origin.y};
            let botRight = {x: origin.x+width, y: origin.y+height};
            let botLeft = {x: origin.x, y: origin.y+height};

            // console.log(`origin: (${origin.x}, ${origin.y})`);

            // console.log(`origin: (${origin.x}, ${origin.y}), topRight: (${topRight.x}, ${topRight.y}), botRight: (${botRight.x}, ${botRight.y}), botLeft: (${botLeft.x}, ${botLeft.y}) `);

            let originAngle = radCalc(origin, arcOrigin) * (180/Math.PI);
            let trAngle = radCalc(topRight, arcOrigin) * (180/Math.PI);
            let brAngle = radCalc(botRight, arcOrigin) * (180/Math.PI);
            let blAngle = radCalc(botLeft, arcOrigin) * (180/Math.PI);

            let angleArray = [];
            angleArray[0] = originAngle;
            angleArray[1] = trAngle;
            angleArray[2] = brAngle;
            angleArray[3] = blAngle;

            for(let i = 0; i < angleArray.length; i++){
                // console.log('*********************');
                // console.log(`origin: (${origin.x}, ${origin.y}), topRight: (${topRight.x}, ${topRight.y}), botRight: (${botRight.x}, ${botRight.y}), botLeft: (${botLeft.x}, ${botLeft.y})`);

                if(angleArray[i] > arcAngles.start && angleArray[i] < arcAngles.end){
                    console.log('******Between arc angles!******');
                    console.log(`origin: (${origin.x}, ${origin.y})`);
                    console.log(`arcOrigin: (${arcOrigin.x}, ${arcOrigin.y})`);
                    console.log(`current i: ${i}`);
                    console.log(`origin angle: ${angleArray[0]}, topRight angle: ${angleArray[1]}`);
                    console.log(`origin point: (${origin.x}, ${origin.y}), tR point:(${topRight.x}, ${topRight.y})`);
                    console.log(`botRight angle: ${angleArray[2]}, botLeft angle: ${angleArray[3]}`);
                    console.log(`bR point: (${botRight.x}, ${botRight.y}), bL point:(${botLeft.x}, ${botLeft.y})`);
                    console.log(`Valid angle between arcs: start: ${arcAngles.start} and end: ${arcAngles.end}`);
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

function circleCalc(objToUpdate, oldCoord, nextCoord, comparedObject){
    let distX = Math.abs(comparedObject.x - oldCoord.x-objToUpdate.status.width/2);
    let distY = Math.abs(comparedObject.y - oldCoord.y-objToUpdate.status.height/2);

    if(distX > (objToUpdate.status.width/2 + comparedObject.r)){

        // console.log("distX: "+distX+" , objW/2: "+objToUpdate.status.width/2+" comp.r: "+comparedObject.r);
        // console.log('DistX failed!');
        return false;
    }
    if(distY > (objToUpdate.status.height/2 + comparedObject.r)){
        // console.log("distX: "+distY+" , objW/2: "+objToUpdate.status.height/2+" comp.r: "+comparedObject.r);
        // console.log('DistY failed!');
        return false;
    }

    if(distX <= (objToUpdate.width / 2)){
        // console.log('*******************DistX succeeded!*******************');
        return true;
    }
    if(distY <= (objToUpdate.height / 2)){
        // console.log('*******************DistY succeeded!*******************');
        return true;
    }

    let dx = distX - objToUpdate.status.width/2;
    let dy = distY - objToUpdate.status.height/2;

    // console.log("dx: "+dx+ " dy: "+dy+" obj.r: "+comparedObject.r);

    return ( dx*dx+dy*dy <= (comparedObject.r*comparedObject.r) );
}

function basicObject(posX, posY, width, height, color){
    this.type = 'basic';
    this.status = {
        posX: posX,
        posY: posY,
        width: width || 100,
        height: height || 100,
        color: color || 'black'
    };
    this.draw = function(context){
        context.fillRect(posX, posY, width, height);
    }
}

function Simulation(){

}

// io.listen(port);
// console.log('listening on port ', port);

http.listen(port, function(){
    console.log('listening on *: ', port);
});