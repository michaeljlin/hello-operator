var gameObject = require('./helper/gameObject');
const credentials = require('./cred');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const connection = mysql.createConnection(credentials);
// const get = require("./helper/calcFunctions");

var express = require('express');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use( bodyParser.json() );
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

    if(playerTracker.length === 1){
        socketHolder = socket;
        socket.join('spymaster');
        // var role = 'spymaster';
    }
    else if(playerTracker.length > 1){
        socketHolder2 = socket;
        socket.join('spy');
        // var role = 'spy'
    }

    // var playerInfo = {
    //     profilePic: './assets/images/test_fb_1.jpg',
    //     userName:  'superawesomusername007',
    //     agentName: 'coughing chameleon',
    //     sprite: 'test_sprite_1.jpg',
    //     // role: role
    // };

    // socket.emit('updatePlayer', playerInfo);

    socket.on('create_button_pressed', (eventId, playerId) =>{
        console.log(eventId, playerId);
    });

    socket.on('join_button_pressed', (eventId, playerId) =>{
        console.log(eventId, playerId);
    });

    socket.on('login_submit', (inputValues, id) => {
        console.log(inputValues, 'player id', id);
        var playerInfo = {
        //     profilePic: './assets/images/test_fb_1.jpg',
        //     userName:  inputValues.username,
        //     agentName: randName,
        //     sprite: 'test_sprite_1.jpg',
        //     id: id,
        //     playerNumber: playerTracker.count
        //     // role: role
        // };
            "firstName" : inputValues.first_name,
            "lastName" : inputValues.last_name,
            // "birthOfDate": req.body.birthOfDate,
            "email":inputValues.email,
            "username" : inputValues.username,
            "password" : inputValues.password,
            // "confirmPassword" : inputValues.confirm_password

        };

        console.log(playerInfo);

        // let confirmPassword = inputValues.confirm_password;
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        let confirmed = true;

        if (playerInfo.firstName === null || playerInfo.firstName === "" || playerInfo.firstName === undefined)
        {
            console.log("Enter a firstName");
            confirmed = false;
        }

        if (playerInfo.lastName === null || playerInfo.lastName === "" || playerInfo.lastName === undefined)
        {
            console.log("Enter a lastName");
            confirmed = false;
        }

        if (!playerInfo.username.match(/(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)){
            console.log('username problem');
            confirmed = false;
        }

        if (!re.test(playerInfo.email))
        {
            console.log('please enter a valid email address');
            confirmed = false;
        }


        //
        // if (playerInfo.password !== playerInfo.confirmPassword && playerInfo.password !== null && playerInfo.password !== undefined ){
        //     console.log("two passwords are not matched");
        //     confirmed = false;
        // }


        if (confirmed === true){
            connection.connect((err) => {
                if (err){console.log('error imn connection',err)}
                else {
                    connection.query(`insert into user_info set ?` , playerInfo, function(error,rows, fields)
                    {
                        if (!!error) {
                            console.log('error in query');
                        }
                        else {
                            console.log('successful query\n');
                            console.log(rows);
                        }
                    });

                }
            });



        }

        socket.emit('updatePlayer', playerInfo);
    });


});

http.listen(port,function(){
    console.log('listening on*:', port);
});