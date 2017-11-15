var gameObject = require('./helper/gameObject');
// const get = require("./helper/calcFunctions");

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const port = 8000;

var playerTracker = {
    length: 0,
    count: 0,
    playerIDs: []
};

function PlayerObject(number, id, name, color) {
    this.number = number;
    this.id = id;

    this.status = {
        name: name,
    }
}

var socketHolder = null;
var socketHolder2 = null;

var nameAdj = ['magnificent', 'vicious', 'friendly', 'cheerful', 'sad', 'happy', 'confused', 'lazy', 'jolly', 'effervescent', 'noble', 'cowardly', 'silly', 'thunderous', 'insightful', 'foolish', 'panicked', 'determined', 'awesome', 'sleepy', 'energetic', 'joyful', 'superior', 'alpha', 'courageous', 'far-sighted', 'limping', 'bumbling', 'serious', 'playful', 'cantankerous', 'stubborn', 'relaxed', 'laughing', 'coughing', 'blind', 'sublime', 'naked'];
var nameAnimal = ['octopus', 'tiger', 'chihuahua', 'shark', 'whale', 'hawk', 'eagle', 'leopard', 'cheetah', 'elephant', 'horse', 'beagle', 'piranha', 'platypus', 'ostrich', 'kakapo', 'parrot', 'wolf', 'snake', 'lizard', 'butterfly', 'frog', 'chameleon', 'fox', 'coyote', 'hummingbird', 'buffalo', 'chicken', 'hyena', 'lion', 'llama', 'alpaca', 'dove', 'mantis', 'owl', 'ox', 'squid', 'bat', 'capybara', 'bison', 'mammoth', 'chimp', 'hornet'];

io.on('connection', function(socket){
    playerTracker.length++;
    playerTracker.count++;
    let randName = nameAdj[Math.floor(Math.random()*nameAdj.length)]+" "+nameAnimal[Math.floor(Math.random()*nameAnimal.length)];
    let newPlayer = new PlayerObject(playerTracker.count, socket.id, randName);
    playerTracker[socket.id] = newPlayer;
    playerTracker.playerIDs.push(socket.id);

    console.log('client has connected: ', socket.id);
    console.log(playerTracker);

    var playerInfo = {
        profilePic: './assets/images/test_fb_1.jpg',
        userName:  'superawesomusername007',
        agentName: 'coughing chameleon',
        sprite: 'test_sprite_1.jpg',
    };

    socket.emit('updatePlayer', playerInfo);

    socket.on('create_button_pressed', (eventId, playerId) =>{
        console.log(eventId, playerId);
    });

    socket.on('join_button_pressed', (eventId, playerId) =>{
        console.log(eventId, playerId);
    });

    socket.on('login_submit', (inputValues, id) => {
        console.log(inputValues, 'player id', id);
    });

});

http.listen(port,function(){
    console.log('listening on*:', port);
});