var gameObject = require('./helper/gameObject');

// var spawn = require('child_process').spawn;

var fork = require('child_process').fork;

const bodyParser = require('body-parser');
const path = require('path');
const uuidv1 = require('uuid/v1');

var bcrypt = require('bcrypt');
const credentials = require('./cred').cred;
const saltRounds = require('./cred').saltRounds;
const secret = require('./cred').secret;
const domain = require('./domain');

const mysql = require('mysql');
const connection = mysql.createConnection(credentials);

const session = require('express-session');

const passport = require('passport');
const Facebook = require('passport-facebook').Strategy;
const auth = require('./facebookauth');

const JWT = require('jsonwebtoken');
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

const tokenOptions = {
    expiresIn: "1h"
    };

const JWTOptions = {
    jwtFromRequest: ExtractJWT.fromAuthHeaderWithScheme('JWT'),
    secretOrKey: secret,
    algorithms: ["HS256"],
    jsonWebTokenOptions: tokenOptions
    };


passport.use(new JWTStrategy(JWTOptions, (jwt_payload, done)=>{
    // console.log('JWT payload received: ', jwt_payload);

    // let inputValues = jwt_payload;

    // connection.query(`select username , password from user_info where username='${inputValues.username}'`, function (error, rows, fields) {
    //
    // });

    return done(null, jwt_payload);

    // User.findOne({id:jwt_payload.sub}, (err, user)=>{
    //     if(err){
    //         return done(err, false);
    //     }
    //     if(user){
    //         return done(null, user);
    //     }
    //     else{
    //         return done(null, false);
    //     }
    // });
}));

var express = require('express');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use( bodyParser.json() );
app.use(express.static(path.resolve("client", "dist")));

app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: false // Revisit this later if issues with sessions
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    // console.log('serialize user executing: ', user);

    done(null, user.username);
});

passport.deserializeUser(function(obj, done) {

    // console.log('deserialize user executing: ', obj);

    connection.query(`SELECT username FROM user_info WHERE username='${obj}';`, function(err, rows, fields){
        // console.log('deserialize query result: ', rows[0].username);

        if(err){
            done(err, false);
        }
        else if(rows[0].username){
            done(null, obj)
        }
        else{
            done(null, false);
        }
    });

    // User.findById(id, function(err, user){
    //     done(err, user);
    // });
});

var http = require('http').Server(app);
var io = require('socket.io')(http);
const port = 8000;
var portCounter = 1;

// passport.serializeUser(function(user, done) {
//     done(null, user);
// });
//
// passport.deserializeUser(function(obj, done) {
//     done(null, obj);
// });

// app.use(passport.initialize());
// app.use(passport.session());

// app.get('/auth/facebook', passport.authenticate('facebook', {authType: 'reauthenticate'}));
//
// app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }),
//     function(req, res) {
//         res.redirect(domain+'3000/lobby');
//     }
// );

function GameRoom(userAccount){
    this.mission = placeAdj[Math.floor(Math.random() * placeAdj.length)] + " " + placeGeographic[Math.floor(Math.random() * placeGeographic.length)];
    this.gameID = uuidv1();
    this.port = port+portCounter;
    this.status = 'setup';
    this.joinButton = false;
    this.abortButton = true;
    this.thisPlayer = userAccount.userName;
    this.player1 = userAccount;
    this.player2 = "";
}

function PlayerInfo(socketId){
    this.profilePic = '';
    this.userName = '';
    this.agentName = nameAdj[Math.floor(Math.random() * nameAdj.length)] + " " + nameAnimal[Math.floor(Math.random() * nameAnimal.length)];
    this.connId = socketId;
    this.gameActiveStatus = false;
    this.readyState = false;
    this.startRequest = false;
    this.role = "Handler";
}

// Testing purpose only code
// Included as comment here because of possible Chrome Inspector Tool issues
// Uncomment only if needed to debug React code locally
//
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

// Required Parameters: JWT Token
// Auth api is a generic authentication request for any purpose

app.post('/api/auth', passport.authenticate('jwt', {session: true}),(req, res)=>{
    console.log('successful authentication');
    res.send({authStatus: true});
});

// Required Parameters: JWT Token
// Create api call expects a username in the request body token
// The username is used to find the corresponding account in the playerTracker
// The userAccount is then inserted into a new GameRoom which is added to the gameTracker

app.post('/api/game/create', passport.authenticate('jwt', {session: true}), (req, res)=>{
    console.log('create game request received');
    console.log('req body is: ', req.body);
    console.log('req token data is: ', JWT.verify(req.body.token, secret));

    let userTokenData = JWT.verify(req.body.token, secret, {algorithms: ["HS256"], maxAge: '2h'});

    let userAccount = playerTracker.find((player) => {
        return player.userName === userTokenData.username;
    });

    let newGame = new GameRoom(userAccount);
    portCounter++;

    userTokenData.gameRoom = newGame.gameID;

    console.log('new game created: ', newGame.gameID);
    let updatedToken = JWT.sign(userTokenData, JWTOptions.secretOrKey);

    gameTracker.push(newGame);
    io.emit('updateOpenGames', gameTracker);

    res.status(200).send({status: 'Okay create request', token: updatedToken});
});

// Required Parameters: JWT Token, game uuid
// Join api call expects a user's JWT token and a game uuid
// Finds the user account and game room
// Adds the user account to the game room in the player2 slot

app.post('/api/game/join', passport.authenticate('jwt', {session: true}), (req, res)=>{
    console.log('join game request received');

    // Find game using game uuid
    // Add PlayerInfo to player2 slot in GameRoom
    // Emit updated gameTracker to all connections

    let userTokenData = JWT.verify(req.body.token, secret, {algorithms: ["HS256"], maxAge: '2h'});

    let userAccount = playerTracker.find((player) => {
        return player.userName === userTokenData.username;
    });

    let gameRoom = gameTracker.find((game)=>{
        return game.gameID = req.body.gameID;
    });

    console.log(`found user account: ${userAccount.userName} for join request game id: ${gameRoom.game}`);

    // API call assumes that player2 is always empty
    // Add a conditional here if that is not always the case
    gameRoom.player2 = userAccount;

    userTokenData.gameRoom = gameRoom.gameID;
    let updatedToken = JWT.sign(userTokenData, JWTOptions.secretOrKey);

    io.emit('updateOpenGames', gameTracker);
    res.status(200).send({status: 'Okay join request', token: updatedToken});
});

// Required Parameters: JWT Token that contains the username and game uuid
// Request assumes that user in in a game

app.post('/api/game/abort', passport.authenticate('jwt', {session: true}), (req, res)=>{
    console.log('abort game request received');

    let userTokenData = JWT.verify(req.body.token, secret, {algorithms: ["HS256"], maxAge: '2h'});

    let userAccount = playerTracker.find((player) => {
        return player.userName === userTokenData.username;
    });

    userAccount.readyState = false;

    let gameRoom = gameTracker.find((game)=>{
        return game.gameID === userTokenData.gameRoom;
    });

    console.log('gameroom ID: ', gameRoom.gameID);
    console.log('gameRoom player 1: ', gameRoom.player1);
    console.log('gameRoom player 2: ', gameRoom.player2);
    console.log('userTokenData for abort', userTokenData);

    if(gameRoom.player2 === "" && gameRoom.player1.userName === userTokenData.username){
        console.log('removing game after abort mission request');
        handleExitProcess(userTokenData.gameRoom);
    }
    else if(gameRoom.player1.userName === userTokenData.username){
        gameRoom.player1 = gameRoom.player2;
        gameRoom.player2 = "";
    }
    else if(gameRoom.player2.userName === userTokenData.username){
        gameRoom.player2 = "";
    }

    delete userTokenData.gameRoom;
    let updatedToken = JWT.sign(userTokenData, JWTOptions.secretOrKey);

    // Emit updated gameTracker to all connections
    io.emit('updateOpenGames', gameTracker);
    res.status(200).send({status: 'Okay abort request', token: updatedToken});
});

// Required Parameters: JWT token that contains username and game uuid

app.post('/api/game/swap', passport.authenticate('jwt', {session: true}), (req, res)=>{
    console.log('role swap request received');

    let userTokenData = JWT.verify(req.body.token, secret, {algorithms: ["HS256"], maxAge: '2h'});

    let userAccount = playerTracker.find((player) => {
        return player.userName === userTokenData.username;
    });

    let gameRoom = gameTracker.find((game)=>{
        return game.gameID = userTokenData.gameRoom;
    });

    userAccount.role = userAccount.role === 'Handler' ? 'Agent' : 'Handler';

    if(['Handler', 'Agent'].includes(gameRoom.player1.role) && ['Handler', 'Agent'].includes(gameRoom.player2.role)){
        if(gameRoom.player1.role !== gameRoom.player2.role){
            gameRoom.player1.readyState = true;
            gameRoom.player2.readyState = true;
        }
        else{
            gameRoom.player1.readyState = false;
            gameRoom.player2.readyState = false;

            gameRoom.player1.startRequest = false;
            gameRoom.player2.startRequest = false;
        }
    }

    // Change player role in GameRoom
    // Emit updated gameTracker to all connections

    io.emit('updateOpenGames', gameTracker);
    res.status(200).send({status: 'Okay swap request'});
});

// Required Parameters: JWT token that contains username and game uuid

app.post('/api/game/start', passport.authenticate('jwt', {session: true}), (req, res)=>{
    console.log('start game request received');

    let userTokenData = JWT.verify(req.body.token, secret, {algorithms: ["HS256"], maxAge: '2h'});

    let userAccount = playerTracker.find((player) => {
        return player.userName === userTokenData.username;
    });
    console.log('start game userTokenData', userTokenData);
    let gameRoom = gameTracker.find((game)=>{
        console.log('userTokenData.gameRoom', userTokenData.gameRoom);
        console.log('game.gameID', game.gameID)
        return game.gameID === userTokenData.gameRoom;
    });

    userAccount.startRequest = !userAccount.startRequest;
    console.log('start game gameRoom', gameRoom);
    if(gameRoom.player1.startRequest && gameRoom.player2.startRequest){
        handleGameStartProcess(gameRoom);
    }

    io.emit('updateOpenGames', gameTracker);
    res.status(200).send({status: 'start'});
});

function handleGameStartProcess(gameRoom){

    console.log('start game initiated');

    let spy = null;
    let spymaster = null;

    if(gameRoom.player1.role === 'Agent'){
        spy = gameRoom.player1.connId;
        spymaster = gameRoom.player2.connId;
    }
    else{
        spy = gameRoom.player2.connId;
        spymaster = gameRoom.player1.connId;
    }

    const gameInstance = fork('gameserver.js');

    console.log('to send to child', {
        spymaster: spymaster,
        spy: spy,
    });

    gameRoom.player1.gameActiveStatus = true;
    gameRoom.player2.gameActiveStatus = true;

    gameRoom.status = 'running';
    io.emit('updateOpenGames', gameTracker);

    gameInstance.send({
        spymaster: spymaster,
        spy: spy,
        gameID: gameRoom.gameID,
        port: gameRoom.port
    });
   

    gameInstance.on('exit', ()=>{
        console.log("Processed exited (Lobby server notification)");

        if(gameRoom.player1 !== undefined && gameRoom.player1 !== null && gameRoom.player1 !== ''){
            gameRoom.player1.gameActiveStatus = false;
            gameRoom.player1.readyState = false;
            gameRoom.player1.startRequest = false;
        }

        if(gameRoom.player2 !== undefined && gameRoom.player2 !== null && gameRoom.player2 !== '') {
            gameRoom.player2.gameActiveStatus = false;
            gameRoom.player2.readyState = false;
            gameRoom.player2.startRequest = false;
        }

        io.to(gameRoom.player1.userName).emit('gameEnd', gameRoom.gameID);
        io.to(gameRoom.player2.userName).emit('gameEnd', gameRoom.gameID);

        io.emit('updatePlayerList', playerTracker);

        console.log('gameRoom.gameID', gameRoom.gameID);
        handleExitProcess(gameRoom.gameID);

        // io.emit('gameEnd', missionName);
    });

    gameInstance.on('message', (message)=>{
        console.log('game server custom message received: ', message);

        if(message.action === 'quit'){
            console.log('Player with socket id: '+message.payload+ ' has quit the game '+ gameRoom.gameID);

            // let exitGameIndex = gameTracker.findIndex((game) => {
            //     return (gameRoom.player1.connId === message.payload) || (gameRoom.player2.connId === message.payload)
            // });

            // console.log('exitGameIndex', exitGameIndex);
            console.log('game tracker before exit', gameTracker);

            console.log('playertracker before exit: ', playerTracker);

            let userAccount = playerTracker.find((player) => {
                return player.connId === message.payload;
            });

            userAccount.gameActiveStatus = false;
            userAccount.startRequest = false;
            userAccount.readyState = false;

            if(gameRoom.player1.connId === message.payload){
                gameRoom.player1 = "";
                //     {
                //     connId: '',
                //     userName: '',
                //     agentName: '',
                //     role: '',
                //     switchCheck: '',
                //     ready: '',
                // }
            }
            else if(gameRoom.player2.connId === message.payload){
                gameRoom.player2 = "";
                //     {
                //     connId: '',
                //     userName: '',
                //     agentName: '',
                //     role: '',
                //     switchCheck: '',
                //     ready: '',
                // }
            }
            // handleExitProcess(gameRoom.gameID);

            if(gameRoom.player1 === '' && gameRoom.player2 === ''){
                handleExitProcess(gameRoom.gameID);
            }

            console.log('game tracker after exit', gameTracker);
        }
    });

    gameInstance.on('error', ()=>{
        console.log('Failed to terminate');
    });
}

app.post('/logmein', function(req, res){
    console.log('logmein request received!');
    console.log('request body: ', req.body);

    let authStatus = 'false';
    let inputValues = req.body;

    connection.query(`select username , password from user_info where username='${inputValues.username}'`, function (error, rows, fields) {

        console.log('logmein input values: ', inputValues);
        console.log('query result', rows);

        // Check first for database errors
        // Then check if query result has requested username

        if (!!error) {
            console.log('logmein query error', error);
            console.log('logmein error in query');
            authStatus = 'false';
            res.status(500).send({authStatus: authStatus, error: 'query failure'});
        }
        else if (rows.length) {
            console.log('logmein successful query - username found\n');
            console.log('logmein query result: ',rows);

            let queryResult = rows[0];

            bcrypt.compare(inputValues.password, queryResult.password).then((compareResult)=>{
                console.log('logmein bcrypt compare result: ', compareResult);

                if(compareResult){
                    console.log('logmein password compare success!');
                    let payload = {username: inputValues.username};
                    let token = JWT.sign(payload, JWTOptions.secretOrKey);
                    res.json({authStatus: 'true', token: token});

                    // authStatus = 'true';
                    // res.send({authStatus: authStatus});
                }
                else{
                    console.log('logmein error: password compare failed');
                    authStatus = 'false';
                    res.status(400).send({authStatus: authStatus, error: 'password incorrect'});
                }

            });

        }
        else {
            console.log('logmein successful query - username not found');

            authStatus = 'false';
            res.status(400).send({authStatus: authStatus, error: 'username not found'});
        }
    });

});

app.post('/signmeup', function(req, res){
    console.log('signmeup request received!');
    console.log('request result: ', req.body);

    let inputValues = req.body;

    console.log('input values: ', inputValues);

    let emailCheck = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let usernameCheck = /(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
    let passwordCheck = /(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

    // Check for errors in received data
    // Add any error to errorType array
    // Return total set of errors to client

    // Errors 0-4 deal with inputValue verification

    // Error 5-6 will deal with users & emails already in the database

    let errorType = [];

    if(!inputValues.password.match(passwordCheck)){
        errorType[0] = ('Invalid password error');
    }

    if(inputValues.first_name === null || inputValues.first_name === "" || inputValues.first_name === undefined){
        errorType[1] = ('Invalid first name');
    }

    if (inputValues.last_name === null || inputValues.last_name === "" || inputValues.last_name === undefined) {
        errorType[2] = ('Invalid last name');
    }

    if (!usernameCheck.test(inputValues.username)) {
        errorType[3] = ('Invalid username');
    }

    if (!emailCheck.test(inputValues.email)) {
        errorType[4] = ('Invalid email');
    }

    if(errorType.length !== 0){
        console.log(`signmeup error: ${errorType}`);
        res.status(400).send({error: errorType});
        return;
    }

    connection.query(`SELECT username FROM user_info WHERE username='${inputValues.username}';`, function(error, rows, fields){

        if (!!error) {
            console.log('signmeup query error', error);
            console.log('signmeup error in query');
            authStatus = 'false';
            res.status(500).send({authStatus: authStatus, error: 'query failure'});
        }
        else if (rows.length) {
            console.log('signmeup successful query - username found\n');
            console.log('signmeup query result: ',rows);

            console.log('signmeup error: username already exists');
            authStatus = 'false';
            res.status(400).send({authStatus: authStatus, error: 'username already exists'});
        }
        else {
            console.log('logmein successful query - username not found');

            console.log('signmeup: no errors found in input');

            bcrypt.hash(inputValues.password, saltRounds).then((hash)=>{
                console.log('signmeup: hashing completed');

                let playerData = {
                    email: (inputValues.email),
                    firstName: inputValues.first_name,
                    lastName: inputValues.last_name,
                    password: hash,
                    userName: inputValues.username,
                };

                console.log('signmeup: uploading player data - ', playerData);

                connection.query(`insert into user_info set ?`, playerData, function (error, rows, fields) {
                    if (!!error) {
                        console.log('signmeup: error in query');
                    }
                    else {
                        console.log('signmeup: successful query\n');
                        console.log(rows);
                        authStatus = 'true';
                        res.send({authStatus: authStatus});
                    }
                });
            });

        }
    });
});

app.get('/Logout', function(req, res) {
    req.session.destroy(function(err){
        console.log("Session is destroyed");
        req.logout();
        res.clearCookie('connect.sid');
        res.redirect(domain+'3000/login')
    })
});

app.get('*', function(req, res) {
    res.sendFile(path.resolve("client", "dist", "index.html"));
});


var playerTracker = [];

var playerCounter = {
    length: 0,
    count: 0,
};

var socketTracker = [];

var playersStartStatus = {
    player1: '',
    player1Role: '',
    player2: '',
    player2Role: '',
};

var gameTracker = [];

var socketHolder = null;
var socketHolder2 = null;

var nameAdj = ['magnificent', 'vicious', 'friendly', 'cheerful', 'sad', 'happy', 'confused', 'lazy', 'jolly', 'effervescent', 'noble', 'cowardly', 'silly', 'thunderous', 'insightful', 'foolish', 'panicked', 'determined', 'awesome', 'sleepy', 'energetic', 'joyful', 'superior', 'alpha', 'courageous', 'far-sighted', 'limping', 'bumbling', 'serious', 'playful', 'cantankerous', 'stubborn', 'relaxed', 'laughing', 'coughing', 'blind', 'sublime', 'naked'];
var nameAnimal = ['octopus', 'tiger', 'chihuahua', 'shark', 'whale', 'hawk', 'eagle', 'leopard', 'cheetah', 'elephant', 'horse', 'beagle', 'piranha', 'platypus', 'ostrich', 'kakapo', 'parrot', 'wolf', 'snake', 'lizard', 'butterfly', 'frog', 'chameleon', 'fox', 'coyote', 'hummingbird', 'buffalo', 'chicken', 'hyena', 'lion', 'llama', 'alpaca', 'dove', 'mantis', 'owl', 'ox', 'squid', 'bat', 'capybara', 'bison', 'mammoth', 'chimp', 'hornet'];

var placeAdj = ['Incandescent','Bad','Lumpy','Brown','Hateful','Endurable','Scattered','Parallel','Strange','Striped','Heartbreaking','Uninterested','Inexpensive','Omniscient','Moaning','Wacky','Actually','Slimy','Aboard','Tense','Various','Hard','Enchanted','Exuberant','Utter','Wry','Sore','Belligerent','Aromatic','Flat','Curvy','Vivacious','Sincere','Stiff','Hissing','Long-term','Teeny-tiny','Nappy','Squeamish','Stimulating','Unsuitable','Majestic','Classy','Gratis','Alluring','Stupendous','Happy','Vagabond','Petite','Maniacal','Useless','Nutty','Quick','Resonant','Awesome','Hollow','Grouchy','Bouncy','Mighty','Plain','Vast','Quizzical','Four','Delightful','Tidy','Efficacious','Roomy','Boiling','Dreary','Malicious','Nauseating','Amused','Noisy','Melodic','Hospitable','Fretful','Uncovered','Broad','Ultra','Lush','Round','Strong','Economic','Violent','Wakeful','Dirty','Volatile','Alike','Safe','Glorious','Abaft','Wooden','Third','Obsequious','Six','Voracious','Cumbersome','Bright','Unaccountable','Jolly','Cuddly','Pushy','Erratic','Redundant','Unadvised','Creepy','Fanatical','Guarded','Enormous','Teeny','Aberrant','Parched','Eatable','Grey','Threatening','Kindly','Separate','Longing','Worthless','Historical','Watery','Axiomatic','Adorable','Rapid','Abhorrent','Charming','Scientific','Thick','Eager','Exultant','Dark','Wise','White','Clear','Filthy','Jaded','Equal','Insidious','Capricious','Gentle','Luxuriant','Violet','Psychedelic','Nippy','Entertaining','Boorish','Materialistic','Cooperative','Fumbling','Voiceless','Incredible','Ahead','Tight','First','Closed','Marked','Naughty','Impossible','Idiotic','Irate','Scintillating','Delicious','Undesirable','Silky','Material','Half','Poor','Lyrical','Faint','Disillusioned','Mountainous','Defiant','Boundless','Salty','Elastic','Ritzy','Foamy','Pointless','Modern','Brawny','Imminent','Bite-sized','Enthusiastic','Valuable','Overt','Sordid','Ruthless','Homely','Jumpy','Silly','Drunk','Bloody','Lackadaisical','Godly','Royal','Unwritten','Momentous','Craven','Wonderful','Sparkling'];
var placeGeographic = ['Abîme','Abyssal fan','Abyssal plain','Ait','Alluvial fan','Anabranch','Arch','Archipelago','Arête','Arroyo and (wash)','Atoll','Ayre','Badlands','Bar','Barchan','Barrier bar','Barrier island','Bay','Baymouth bar','Bayou','Beach','Beach cusps','Beach ridge','Bench','Bight','Blowhole','Blowout','Bluff','Bornhardt','Braided channel','Butte','Calanque','Caldera','Canyon','Cape','Carolina bay','Cave','Cenote','Channel','Cirque','Corrie or cwm','Cliff','Coast','Col','Complex crater','Complex volcano','Confluence','Continental shelf','Coral reef','Cove','Cove (mountain)','Crater lake','Crevasse splay','Crevasse','Cryovolcano','Cuesta','Cuspate foreland','Cut bank','Dale','Defile','Dell','Delta, River','Desert pavement','Diatreme','Dike','Dirt cone','Dissected plateau','Doab','Doline','Dome','Drainage basin','Drainage divide','Draw','Dreikanter','Drumlin','Drumlin field','Dry lake','Dune','Dune system','Ejecta blanket','Endorheic basin','Erg','Escarpment (scarp)','Esker','Estuary','Exhumed river channel','Faceted spur','Fault scarp','Firth','Fissure vent','Fjard','Fjord','Flat','Flatiron','Floodplain','Fluvial island','Fluvial terrace','Foibe','Geo','Geyser','Glacial horn','Glacier cave','Glacier foreland','Glacier','Parallel Roads of Glen Roy','Glen','Gorge','Graben','Gulf','Gully','Guyot','Hanging valley','Headland','Hill','Hogback','Homoclinal ridge','Hoodoo','Horst','Impact crater','Inlet','Interfluve','Inverted relief','Island','Islet','Isthmus','Kame delta','Kame','Karst','Karst fenster','Karst valley','Kettle','Kipuka','Knoll','Lacustrine plain','Lagoon','Lake','Lava dome','Lava flow','Lava lake','Lava plain','Lava spine','Lava tube','Lavaka','Levee, natural','Limestone pavement','Loess','Lacustrine terraces','Maar','Machair','Malpaís','Mamelon','Marine terrace','Marsh','Meander','Mesa','Mid-ocean ridge','Mogote','Monadnock','Moraine','Moulin','Mountain','Mountain pass','Mountain range','Mud volcano','Natural arch','Nunatak','Oasis','Oceanic basin','Oceanic plateau','Oceanic ridge','Oceanic trench','Outwash fan','Outwash plain','Oxbow lake','Pediment','Pediplain','Peneplain','Peninsula','Pingo','Pit crater','Plain','Plateau','Playa lake','Plunge pool','Point bar','Polje','Pond','Potrero','Proglacial lake','Pseudocrater','Pull-apart basin','Quarry','Raised beach','Rapid','Ravine','Ria','Ribbed moraines','Ridge','Riffle','Rift valley','River','River delta','River island','Roche moutonnée','Rock formations','Rock shelter','Rock-cut basin','Salt marsh','Salt pan (salt flat)','Sand volcano','Sandhill','Sandur','Scowle','Scree','Sea cave','Seamount','Shield volcano','Shoal','Shore','Shut-in','Side valley','Sinkhole','Sound','Spit','Spring','Stack and stump','Strait','Strandflat','Strath','Stratovolcano','Stream pool','Stream','Strike ridge','Structural bench','Structural terrace','Subglacial mound','Submarine canyon','Submarine volcano','Summit','Supervolcano','Surge channel','Swamp','Tea table','Tepui','Terrace','Terracettes','Tessellated pavement','Thalweg','Tidal marsh','Tide pool','Tombolo','Tor','Tower karst','Towhead','Trim line','Truncated spur','Tunnel valley','Turlough','Tuya','U-shaped valley','Uvala','Vale','Valley','Valley shoulder','Vale','Vent','Ventifact','Volcanic arc','Volcanic cone','Volcanic crater','Volcanic dam','Volcanic field','Volcanic group','Volcanic island','Volcanic plateau','Volcanic plug','Volcano','Wadi','Waterfall','Watershed','Wave cut platform','Yard'];

var authStatus = '';

var playerArray = [];

var openGames = [];

var handleExitProcess = function(gameID){
    console.log('handling exit of game: ', gameID);

    console.log('>>>>>>>>>gametracker before exit: ', gameTracker);

    let gameIndex = gameTracker.findIndex((game) => {
        return game.gameID === gameID;
    });

    console.log('>>>>>>>>>>>>>. found game is: ', gameTracker[gameIndex].gameID );

    // May have to change this later for asynchronous issues
    gameTracker.splice(gameIndex, 1);

    io.emit('updateOpenGames', gameTracker);
};

io.on('connection', function(socket) {

    socket.on('requestPlayerList',()=>{
        io.emit('updatePlayerList', playerTracker);
    });

    socket.on('moveToGame',(token)=>{
        console.log('moveToGame');
        let userTokenData = JWT.decode(token);

        let userAccount = playerTracker.find((player) => {
            return player.userName === userTokenData.username;
        });

        let gameRoom = gameTracker.find((game)=>{
            return game.gameID = userTokenData.gameRoom;
        });

        socket.once('clientReady', ()=>{
            console.log('received ready status from clients');
            socket.emit('initConn', gameRoom.port, userAccount.role);
            // socket.emit('role', userAccount.role);
        });

        socket.emit('redirectToGame');
    });

    var socketInfo = {
        socketConnId: socket.id,
        socket: socket,
    };

    socketTracker.push(socketInfo);

    var playerInfo = new PlayerInfo(socket.id);

    socket.once('setUsername', (username)=> {
        socket.join(username);
        playerInfo.userName = username;
        console.log('completing logmein playerInfo: ', playerInfo);

        socket.emit('updatePlayer', playerInfo);

        playerTracker.push(playerInfo);

        if (playerTracker[0] !== undefined) {
            io.emit('loadingLobby', playerTracker);
        }
        io.emit('loadingLobby', playerTracker);
        io.emit('updateOpenGames', gameTracker);

        io.emit('updatePlayerList', playerTracker);

    });

    playerCounter.length++;
    playerCounter.count++;

    console.log('client has connected: ', socket.id);
    console.log(playerCounter);

    passport.use(new Facebook(auth.facebookauth,
        function(accessToken, refreshToken, profile, done) {
            console.log("This is the profile information", profile);
            let facebookData ={
                facebookImage : profile.photos[0].value,
            };
            playerInfo.userName = profile.displayName;
            playerInfo.profilePic = profile.photos[0].value;

            playerTracker.push(playerInfo);

            console.log('player tracker after facebook login', playerTracker);
            console.log("player Pic", playerInfo.profilePic);
            console.log("playername",playerInfo.userName);
            connection.query(`insert into user_info set ?` ,facebookData, function(error,rows, fields){
                if (!!error) {
                    console.log('error in query');
                }
                else {
                    console.log('successful query\n');
                    console.log(rows);
                    socket.emit('updatePlayer', playerInfo);
                    console.log('Should be updating player with player Info', playerInfo);
                    authStatus = 'true';
                    socket.emit('facebook_login_status', authStatus);
                    console.log('facebook login auth status', authStatus);
                }

            });

            console.log('facebook profile', profile);

            return done(null, profile);
        }

    ));

    socket.emit('numberOfPlayers', playerTracker.length);

    socket.on('getGameTracker', () => {
        socket.emit('updateOpenGames', gameTracker);
    });

    socket.on('disconnect', ()=>{
        console.log('user has disconnected from lobby, socket.id: ', socket.id);

        let userAccountIndex = playerTracker.findIndex((account) => {
            return account.connId === socket.id;
        });

        let userAccount = playerTracker[userAccountIndex];

        let gameRoom = gameTracker.find((game)=>{
            return game.player1.userName === userAccount.userName || game.player2.userName === userAccount.userName;
        });

        if(gameRoom !== undefined){
            console.log('gameroom: ', gameRoom);
            console.log('gameroom ID: ', gameRoom.gameID);
            console.log('gameRoom player 1: ', gameRoom.player1);
            console.log('gameRoom player 2: ', gameRoom.player2);

            if(gameRoom.player2 === "" && gameRoom.player1.userName === userAccount.userName){
                console.log('removing game after abort mission request');
                handleExitProcess(gameRoom.gameID);
            }
            else if(gameRoom.player1.userName === userAccount.userName){
                gameRoom.player1 = gameRoom.player2;
                gameRoom.player2 = "";
            }
            else if(gameRoom.player2.userName === userAccount.userName){
                gameRoom.player2 = "";
            }
        }

        playerTracker.splice(userAccountIndex, 1);
        io.emit('updatePlayerList', playerTracker);
        io.emit('updateOpenGames', gameTracker);
    });
});

http.listen(port,function(){
    console.log('listening on*:', port);
});
