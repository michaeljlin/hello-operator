var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const port = 8000;

// *****Global variables listed below should be transferred to Simulation object at a later time*****
var randColor = ['blue', 'yellow', 'red', 'green', 'black', 'purple'];
var randColor1 = ['blue', 'red', 'green'];
var randColor2 = ['yellow', 'black', 'purple'];

var nameAdj = ['magnificent', 'vicious', 'friendly', 'cheerful', 'sad', 'happy', 'confused', 'lazy', 'jolly', 'effervescent', 'noble', 'cowardly', 'silly', 'thunderous', 'insightful', 'foolish', 'panicked', 'determined', 'awesome', 'sleepy', 'energetic', 'joyful', 'superior', 'alpha', 'courageous', 'far-sighted', 'limping', 'bumbling', 'serious', 'playful', 'cantankerous', 'stubborn', 'relaxed', 'laughing', 'coughing', 'blind', 'sublime'];
var nameAnimal = ['octopus', 'tiger', 'chihuahua', 'shark', 'whale', 'hawk', 'eagle', 'leopard', 'cheetah', 'elephant', 'horse', 'beagle', 'piranha', 'platypus', 'ostrich', 'kakapo', 'parrot', 'wolf', 'snake', 'lizard', 'butterfly', 'frog', 'chameleon', 'fox', 'coyote', 'hummingbird', 'buffalo', 'chicken', 'hyena', 'lion', 'llama', 'alpaca', 'dove', 'mantis', 'owl', 'ox', 'squid', 'bat', 'capybara'];

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
        console.log(playerTracker[socket.id].status.name+"'s click history: ", playerTracker[socket.id].status.clickHistory);

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
    var newColor = randColor[Math.floor(Math.random()*(randColor.length))];
    console.log("Sim is running: ", newColor);

    if(playerTracker.length === 1){
        io.emit('timer', 'green');
    }
    else{
        var color1 = randColor1[Math.floor(Math.random()*(randColor1.length))];
        var color2 = randColor2[Math.floor(Math.random()*(randColor2.length))];

        console.log("multiple players detected, sending colors: "+color1 + " "+ color2 );
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

        io.to('spy').emit('update', newSimState);
    }
}

// Currently only updates player object types
// Will be changed to update all object types later
function simUpdate(objToUpdate) {

    if (objToUpdate.status.clickHistory.length > 0) {

        // objToUpdate.status.posX += objToUpdate.status.velX;
        // objToUpdate.status.posY += objToUpdate.status.velY;

        var newCoord = objToUpdate.status.clickHistory[objToUpdate.status.clickHistory.length - 1];
        var oldCoord = {x: objToUpdate.status.posX, y: objToUpdate.status.posY};

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

            console.log('degrees: ', thetaRadians / (Math.PI / 180));

            let partHypo = hypo / 30;
            let velX = Math.cos(thetaRadians)*partHypo;
            let velY = Math.sin(thetaRadians)*partHypo;

            // let xRatio = (xDirection / xDirection);
            // let yRatio = (yDirection / xDirection);

            // console.log("Object's new coords: ",newCoordinates);
            // objToUpdate.status.posX = oldCoord.x + xRatio;
            // objToUpdate.status.posY = oldCoord.y + yRatio;

            objToUpdate.status.posX += velX;
            objToUpdate.status.posY += velY;
        }

        // let xDirection = newCoord.x - oldCoord.x;
        // let yDirection = newCoord.y - oldCoord.y;
        //
        // let thetaRadians = Math.atan(yDirection / xDirection);
        //
        // let xRatio = (xDirection / xDirection) * 10;
        // let yRatio = (yDirection / xDirection) * 10;
        //
        // // console.log("Object's new coords: ",newCoordinates);
        // objToUpdate.status.posX = oldCoord.x + xRatio;
        // objToUpdate.status.posY = oldCoord.y + yRatio;
    }
    else {
        return null;
    }
}

function Simulation(){

}

// io.listen(port);
// console.log('listening on port ', port);

http.listen(port, function(){
    console.log('listening on *: ', port);
});