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
        //Hard coded (instead of 0 as before) to force the spy to spawn at start of hallway//
        posY: 280,
        velX: 0,
        velY: 0,
        width: 50,
        height: 50,
        color: color || 'black',
        keys: [],
        clickHistory: [],
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
    console.log("Sim is running!");

    if(playerTracker.length === 1){
        console.log('Waiting for second player!');
        io.emit('timer', 'green');
    }
    else{
        // var color1 = randColor1[Math.floor(Math.random()*(randColor1.length))];
        // var color2 = randColor2[Math.floor(Math.random()*(randColor2.length))];

        // console.log("multiple players detected, sending colors: "+color1 + " "+ color2 );
        console.log("multiple players detected");
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

        finalSimState[0] = newSimState;

        io.to('spy').emit('update', finalSimState);

        console.log('alert state: '+finalSimState[3].display);
    }
}

var finalSimState = [
    {},
    //Top wall on the left
    {type: 'box', x:0, y: 180, width: 330, height: 10, color: 'green', ui:false, solid: true, display: true},
    //Top wall on the right
    {type: 'box', x:410, y: 180, width: 1365, height: 10, color: 'green', ui:false, solid: true, display: true},
    //Bottom wall on the left
    {type: 'box', x:0, y: 380, width: 890, height: 10, color: 'green', ui: false, solid: true, display: true},
    //Bottom wall on the right
    {type: 'box', x:970, y: 380, width: 1365, height: 10, color: 'green', ui: false, solid: true, display: true},
    //Top door
    {type: 'box-door', x:330, y: 178, width: 80, height: 14, color: 'red', ui: false, solid: true, display: true},
    //Bottom door
    {type: 'box-door', x:890, y: 378, width: 80, height: 14, color: 'red', ui: false, solid: true, display: true},
    //Hallway switch
    {type: 'box', x:1330, y: 190, width: 20, height: 8, color: 'yellow', ui: false, solid: true, display: true},
    //The safe
    {type: 'box', x:0, y: 0, width: 60, height: 55, color: 'orange', ui: false, solid: true, display: true},
    // {type: 'word', text: 'ALERT!', x: 400, y: 200, color: 'red', ui: true, display: false}
];

// Currently only updates player object types
// Will be changed to update all object types later
function simUpdate(objToUpdate) {

    var newCoord = objToUpdate.status.clickHistory[objToUpdate.status.clickHistory.length - 1];
    var oldCoord = {x: objToUpdate.status.posX, y: objToUpdate.status.posY};

    if (objToUpdate.status.clickHistory.length > 0 && ( (newCoord.x-25 !== oldCoord.x)||(newCoord.y-25 !== oldCoord.y) ) ) {

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

            console.log('degrees: ', thetaRadians / (Math.PI / 180));

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

                // if(oldCoord.x <= 250 && nextX > 250 && nextY > 300-50 && nextY < 400){
                //     objToUpdate.status.clickHistory.push({x: 300-50, y: nextY});
                //
                //     objToUpdate.status.posX = 250;
                //     objToUpdate.status.posY = nextY;
                //     return;
                // }
                //
                // if(oldCoord.x >= 400 && nextX < 400 && nextY > 300-50 && nextY < 400){
                //     objToUpdate.status.clickHistory.push({x: 400, y: nextY});
                //
                //     objToUpdate.status.posX = 400;
                //     objToUpdate.status.posY = nextY;
                //     return;
                // }
                //
                // if(oldCoord.y <= 250 && nextY > 250 && nextX > 300-50 && nextX < 400){
                //     objToUpdate.status.clickHistory.push({x: nextX, y: 250});
                //
                //     objToUpdate.status.posX = nextX;
                //     objToUpdate.status.posY = 250;
                //     return;
                // }
                //
                // if(oldCoord.y >= 400 && nextY < 400 && nextX > 300-50 && nextX < 400){
                //     objToUpdate.status.clickHistory.push({x: nextX, y: 400});
                //
                //     objToUpdate.status.posX = nextX;
                //     objToUpdate.status.posY = 400;
                //     return;
                // }

                //Rebecca changed number to reflect current switch order
                if(checkCollide(objToUpdate, oldCoord, nextCoord, finalSimState[7])) {
                    console.log('**************Button triggered!****************');

                    finalSimState[3].display = true;
                }
                else{
                    finalSimState[3].display = false;
                }

                if(checkCollide(objToUpdate, oldCoord, nextCoord, finalSimState[1])){
                    console.log('**************Collision found!****************');
                    return;
                }

                //Rebecca added for new objects
                if(checkCollide(objToUpdate, oldCoord, nextCoord, finalSimState[2])){
                    console.log('**************Collision found!****************');
                    return;
                }
                if(checkCollide(objToUpdate, oldCoord, nextCoord, finalSimState[3])){
                    console.log('**************Collision found!****************');
                    return;
                }
                if(checkCollide(objToUpdate, oldCoord, nextCoord, finalSimState[4])){
                    console.log('**************Collision found!****************');
                    return;
                }
                if(checkCollide(objToUpdate, oldCoord, nextCoord, finalSimState[5])){
                    console.log('**************Door collision found!****************');

                    return;
                }
                if(checkCollide(objToUpdate, oldCoord, nextCoord, finalSimState[6])){
                    console.log('**************Door collision found!****************');
                    return;
                }
                if(checkCollide(objToUpdate, oldCoord, nextCoord, finalSimState[8])){
                    console.log('**************Safe collision found!****************');
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

// Only works for box type objects currently
// Returns true if there is a collision
// Returns false if no collision
function checkCollide(objToUpdate, oldCoord, nextCoord, comparedObject ){
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