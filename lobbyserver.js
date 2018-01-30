var gameObject = require('./helper/gameObject');

// var spawn = require('child_process').spawn;

var fork = require('child_process').fork;

const bodyParser = require('body-parser');
const path = require('path');
const uuidv1 = require('uuid/v1');

var bcrypt = require('bcrypt');
const credentials = require('./cred').cred;
const saltRounds = require('./cred').saltRounds;
const domain = require('./domain');

const mysql = require('mysql');
const connection = mysql.createConnection(credentials);
const passport = require('passport');
const Facebook = require('passport-facebook').Strategy;
const session = require('express-session');
const auth = require('./facebookauth');


var express = require('express');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use( bodyParser.json() );
app.use(express.static(path.resolve("client", "dist")));


var http = require('http').Server(app);
var io = require('socket.io')(http);
const port = 8000;
var portCounter = 0;

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/facebook', passport.authenticate('facebook', {authType: 'reauthenticate'}));

app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect(domain+'3000/lobby');
    }
);

app.post('/logmein', function(req, res){
    console.log('logmein request received!');

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

                    authStatus = 'true';

                    res.send({authStatus: authStatus});
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

    let gameIndex = gameTracker.findIndex((game) => {
        return game.gameID === gameID;
    });

    // May have to change this later for asynchronous issues
    gameTracker.splice(gameIndex, 1);

    io.emit('updateOpenGames', gameTracker);
};

io.on('connection', function(socket) {

    var socketInfo = {
        socketConnId: socket.id,
        socket: socket,
    };

    socketTracker.push(socketInfo);

    let randName = nameAdj[Math.floor(Math.random() * nameAdj.length)] + " " + nameAnimal[Math.floor(Math.random() * nameAnimal.length)];

    var playerInfo = {
        profilePic: '',
        userName: '',
        agentName: randName,
        socketId: socket.id,
        gameActiveStatus: false
        // socket: socket,
    };

    socket.once('setUsername', (username)=> {
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

    if (playerCounter.length === 1) {
        socketHolder = socket;
        socket.join('spymaster');
    }
    else if (playerCounter.length > 1) {
        socketHolder2 = socket;
        socket.join('spy');
    }

    io.to('spymaster').emit('playerRole', 'spymaster');
    io.to('spy').emit('playerRole', 'spy');

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

    socket.on('create_button_pressed', (playerId, playerUsername, playerAgentName) => {
        portCounter++;

        let gameInfo = {
            mission:  placeAdj[Math.floor(Math.random() * placeAdj.length)] + " " + placeGeographic[Math.floor(Math.random() * placeGeographic.length)],
            gameID: uuidv1(),
            port: port+portCounter,
            status: 'setup',
            joinButton: false,
            abortButton: true,
            thisPlayer: playerAgentName,
            player1: {
                connId: playerId,
                userName: playerUsername,
                agentName: playerAgentName,
                role: 'Handler',
                switchCheck: false,
                ready: '',
                // socket: socket,
            },
            player2: {
                connId: '',
                userName: '',
                agentName: '',
                role: '',
                switchCheck: '',
                ready: '',
                // socket: '',
            },
        };
            console.log('game info after create button pressed', gameInfo);
            gameTracker.push(gameInfo);
            console.log('game tracker after create button pressed', gameTracker);
            io.emit('updateOpenGames', gameTracker);

    });


    socket.on('startGame', (playerConnId, thisGameID) => {

        console.log('start game initiated');

        var thisGameIndex = gameTracker.findIndex((game) => {
            return game.gameID === thisGameID;
        });

        var thisMission = gameTracker[thisGameIndex];
        var thisMissionPlayer1 = thisMission.player1.connId;
        var thisMissionPlayer2 = thisMission.player2.connId;

        console.log('thisMissionPlayer1', thisMissionPlayer1);
        console.log('thisMissionPlayer2', thisMissionPlayer2);


        var player1Role = thisMission.player1.role;
        var player2Role = thisMission.player2.role;

        var spymaster = '';
        var spy = '';

        if(player1Role === 'Agent') {
            player1Role = 'spy';
            spy = thisMissionPlayer1;
        }
        else if (player1Role === 'Handler') {
            player1Role = 'spymaster';
            spymaster = thisMissionPlayer1;
        }

        if(player2Role === 'Agent') {
            player2Role = 'spy';
            spy = thisMissionPlayer2;
        }
        else if (player2Role === 'Handler') {
            player2Role = 'spymaster';
            spymaster = thisMissionPlayer2;
        }

        console.log('player1Role', player1Role);
        console.log('player2Role', player2Role);

            if(thisMissionPlayer1 === playerConnId) {
                playersStartStatus.player1 = 'readyToStart';
            }
            else if (thisMissionPlayer2 === playerConnId) {
                playersStartStatus.player2 = 'readyToStart';
        }

        console.log('playerStartStatus', playersStartStatus);

        if(playersStartStatus.player1 === 'readyToStart' && playersStartStatus.player2 === 'readyToStart') {

            var socketIndexPlayer1 = socketTracker.findIndex((connection) => {
                return connection.socketConnId === thisMissionPlayer1
            });
            var socketPlayer1 = socketTracker[socketIndexPlayer1].socket;

            var socketIndexPlayer2 = socketTracker.findIndex((connection) => {
                return connection.socketConnId === thisMissionPlayer2
            });
            var socketPlayer2 = socketTracker[socketIndexPlayer2].socket;

            socketPlayer1.join(player1Role);

            socketPlayer2.join(player2Role);


            // const gameInstance = spawn('node', ['gameserver'], {
            //     stdio: 'inherit'
            // });

            const gameInstance = fork('gameserver.js');

            console.log('to send to child', {
                spymaster: spymaster,
                spy: spy,
            });

            let player1Index = playerTracker.findIndex((player) => {
                return player.socketId === thisMissionPlayer1;
            });

            let player2Index = playerTracker.findIndex((player) => {
                return player.socketId === thisMissionPlayer2;
            });

            playerTracker[player1Index].gameActiveStatus = true;
            playerTracker[player2Index].gameActiveStatus = true;

            socket.emit('updatePlayerList', playerTracker);

            gameInstance.send({
                spymaster: spymaster,
                spy: spy,
                gameID: thisGameID,
                port: gameTracker[thisGameIndex].port
            });

            socket.once('clientReady', ()=>{
                io.to(thisMissionPlayer1).emit('initConn', gameTracker[thisGameIndex].port);
                io.to(thisMissionPlayer2).emit('initConn', gameTracker[thisGameIndex].port);
            });

            gameInstance.on('exit', ()=>{
                console.log("Processed exited (Lobby server notification)");

                playerTracker[player1Index].gameActiveStatus = false;
                playerTracker[player2Index].gameActiveStatus = false;

                io.to(thisMissionPlayer1).emit('gameEnd', thisGameID);
                io.to(thisMissionPlayer2).emit('gameEnd', thisGameID);

                io.emit('updatePlayerList', playerTracker);

                handleExitProcess(thisGameID);

                // io.emit('gameEnd', missionName);
            });

            gameInstance.on('error', ()=>{
                console.log('Failed to terminate');
            });

            socketPlayer1.emit('redirectToGame');
            console.log('redirect emitted to player1');

            socketPlayer2.emit('redirectToGame');
            console.log('redirect emitted to player2');

            io.to(thisMissionPlayer1).emit('role', player1Role);
            io.to(thisMissionPlayer2).emit('role', player2Role);
        }
        else{
            console.log('game not yet ready');
        }

    });


    socket.on('log_out', (player) => {
        // authStatus = 'false';
        console.log('log out', authStatus);

        console.log('player tracker before logout', playerTracker);
        console.log('game tracker before logout', gameTracker);

        let gameInfo = {};

        //Find the index of the player that's logged out in the player tracker
        let thisPlayerIndex = playerTracker.findIndex((player) => {
            return player.agentName === player;
        });

        //Using the index of the player, delete their information from the player tracker
        playerTracker.splice(thisPlayerIndex, 1);

        //Find the game index of any games with the player's agent name
        let gameWithLoggedOutPlayer = gameTracker.findIndex((game) => {
            return game.player1.agentName === player || game.player2.agentName === player
        });

        //If the game had just the player being logged out (so just a player 1)
        if(gameTracker[gameWithLoggedOutPlayer] !== undefined){
            if(gameTracker[gameWithLoggedOutPlayer].player2.agentName === ""){
                //If the player was a player 1, delete the game
                if(gameTracker[gameWithLoggedOutPlayer].player1.agentName === player){

                    //Delete game from array
                    gameTracker.splice(gameWithLoggedOutPlayer, 1);

                    // io.emit('updateOpenGames', gameTracker);

                    //The create button is removed when a player creates or joins a game, but if no games are left, the button has to be added back so more games can be made
                    if(gameTracker.length === 0) {
                        //Using broadcast so that the page appears the same to the player as the page is redirecting back to the landing page
                        socket.broadcast.emit('addCreateButton')
                    }
                }
            }
        }


        //If the game has both players
       else {
            //If the player was a player 1, remove player 1 information from the game and make player 2 a player 1
            if(gameTracker[gameWithLoggedOutPlayer].player1.agentName === player && gameTracker[gameWithLoggedOutPlayer].player2.agentName !== ""){
                gameInfo = {
                    mission: gameTracker[gameWithLoggedOutPlayer].mission,
                    gameID: gameTracker[gameWithLoggedOutPlayer].gameID,
                    status: gameTracker[gameWithLoggedOutPlayer].status,
                    port: gameTracker[gameWithLoggedOutPlayer].port,
                    joinButton: gameTracker[gameWithLoggedOutPlayer].joinButton,
                    abortButton:gameTracker[gameWithLoggedOutPlayer].abortButton,
                    thisPlayer: gameTracker[gameWithLoggedOutPlayer].thisPlayer,
                    player1: {
                        connId: gameTracker[gameWithLoggedOutPlayer].player2.connId,
                        userName: gameTracker[gameWithLoggedOutPlayer].player2.userName,
                        agentName: gameTracker[gameWithLoggedOutPlayer].player2.agentName,
                        role:gameTracker[gameWithLoggedOutPlayer].player2.role,
                        switchCheck: gameTracker[gameWithLoggedOutPlayer].player2.switchCheck,
                        ready: gameTracker[gameWithLoggedOutPlayer].player2.ready,
                        // socket: gameTracker[gameWithLoggedOutPlayer].player2.socket,
                    },
                    player2: {
                        connId: '',
                        userName: '',
                        agentName: '',
                        role: '',
                        switchCheck: '',
                        ready: '',
                        // socket: '',
                    },
                };
            }

            //If the player was a player 2, remove their information from the game
            else if(gameTracker[gameWithLoggedOutPlayer].player2.agentName === player){
                gameInfo = {
                    mission: gameTracker[gameWithLoggedOutPlayer].mission,
                    gameID: gameTracker[gameWithLoggedOutPlayer].gameID,
                    status: gameTracker[gameWithLoggedOutPlayer].status,
                    port: gameTracker[gameWithLoggedOutPlayer].port,
                    joinButton: gameTracker[gameWithLoggedOutPlayer].joinButton,
                    abortButton:gameTracker[gameWithLoggedOutPlayer].abortButton,
                    thisPlayer: gameTracker[gameWithLoggedOutPlayer].thisPlayer,
                    player1: {
                        connId: gameTracker[gameWithLoggedOutPlayer].player1.connId,
                        userName: gameTracker[gameWithLoggedOutPlayer].player1.userName,
                        agentName: gameTracker[gameWithLoggedOutPlayer].player1.agentName,
                        role:gameTracker[gameWithLoggedOutPlayer].player1.role,
                        switchCheck: gameTracker[gameWithLoggedOutPlayer].player1.switchCheck,
                        ready: gameTracker[gameWithLoggedOutPlayer].player1.ready,
                        // socket: gameTracker[gameWithLoggedOutPlayer].player1.socket,
                    },
                    player2: {
                        connId: '',
                        userName: '',
                        agentName: '',
                        role: '',
                        switchCheck: '',
                        ready: '',
                        // socket: '',
                    },
                };
            }

            let gameInfoToUpdateIndex = gameTracker.findIndex((game) => {
                return game.mission === gameInfo.mission
            });

            //Delete game from array
            gameTracker.splice(gameInfoToUpdateIndex, 1);

            //Add game to that same spot with updated information
            gameTracker.splice(gameInfoToUpdateIndex,0,gameInfo);
        }

        //Using broadcast so that the page appears the same to the player as the page is redirecting back to the landing page
        socket.broadcast.emit('updatePlayerList', playerTracker);

        //Using broadcast so that the page appears the same to the player as the page is redirecting back to the landing page
        socket.broadcast.emit('updateOpenGames', gameTracker);

        console.log('playerTracker after update with logout', playerTracker);
        console.log('game tracker after update with logout', gameTracker);

    });

    socket.emit('numberOfPlayers', playerTracker.length);

    //Updates the game tracker information being stored so that the lobby can display current info to all players
    socket.on('updateGameTracker', (updatedInformationAndAction) => {

        let updatedInformation = updatedInformationAndAction.updatedInformation;
        let action = updatedInformationAndAction.action;

        console.log('game tracker before update', gameTracker);

        let gameInfo = '';

        //Creates different info to update the game tracker with depending on what action triggered this update
        switch(action){
            case 'join':

                let gameIndex = gameTracker.findIndex((game) => {
                    return game.gameID === updatedInformation.gameID;
                });

                updatedInformation.status = gameTracker[gameIndex].status;
                updatedInformation.port = gameTracker[gameIndex].port;

                //Information in the game that needs to be changed upon joining a game has already been added in updatedInformation, so the gameInfo used to update the game tracker is just what's being passed in
                gameInfo = updatedInformation;

                socket.emit('playerJoinedSoRemoveCreate');

            break;

            case 'player1_role':

                //Player 1's role can change regardless of player 2's info, so we need to find this game's player2 info and make sure that this game info includes whatever is already present for player 2 (cannot change player 2 info)
                let thisGameIndex = gameTracker.findIndex((game) => {
                    return game.mission === updatedInformation.mission
                });

                let thisGamePlayer2 = gameTracker[thisGameIndex].player2;

                gameInfo = {
                    mission: updatedInformation.mission,
                    gameID: gameTracker[thisGameIndex].gameID,
                    status: gameTracker[thisGameIndex].status,
                    port: gameTracker[thisGameIndex].port,
                    joinButton: gameTracker[thisGameIndex].joinButton,
                    abortButton: gameTracker[thisGameIndex].abortButton,
                    thisPlayer: updatedInformation.thisPlayer,
                    player1: {
                        connId: updatedInformation.player1.connId,
                        userName: updatedInformation.player1.userName,
                        agentName: updatedInformation.player1.agentName,
                        role: updatedInformation.player1.role,
                        switchCheck: updatedInformation.player1.switchCheck,
                        ready: updatedInformation.player1.ready,
                        // socket: updatedInformation.player1.socket,
                    },
                    player2: {
                        connId: thisGamePlayer2.connId,
                        userName: thisGamePlayer2.userName,
                        agentName:  thisGamePlayer2.agentName,
                        role: thisGamePlayer2.role,
                        switchCheck: thisGamePlayer2.switchCheck,
                        ready: thisGamePlayer2.ready,
                        // socket: thisGamePlayer2.socket,
                    },
                };
                break;

            case 'player2_role':

                //Player 2's role can change regardless of player 1's info, so we need to find this game's player 1 info and make sure that this game info includes whatever is already present for player 1 (cannot change player 1 info)
                let thisGameIndex2 = gameTracker.findIndex((game) => {
                    return game.mission === updatedInformation.mission
                });

                let thisGamePlayer1 = gameTracker[thisGameIndex2].player1;

                gameInfo = {
                    mission: updatedInformation.mission,
                    gameID: gameTracker[thisGameIndex2].gameID,
                    status: gameTracker[thisGameIndex2].status,
                    port: gameTracker[thisGameIndex2].port,
                    joinButton: gameTracker[thisGameIndex2].joinButton,
                    abortButton: gameTracker[thisGameIndex2].abortButton,
                    thisPlayer: updatedInformation.thisPlayer,
                    player1: {
                        connId: thisGamePlayer1.connId,
                        userName: thisGamePlayer1.userName,
                        agentName:  thisGamePlayer1.agentName,
                        role: thisGamePlayer1.role,
                        switchCheck: thisGamePlayer1.switchCheck,
                        ready: thisGamePlayer1.ready,
                        // socket: thisGamePlayer1.socket,
                    },

                    player2: {
                        connId: updatedInformation.player2.connId,
                        userName: updatedInformation.player2.userName,
                        agentName: updatedInformation.player2.agentName,
                        role: updatedInformation.player2.role,
                        switchCheck: updatedInformation.player2.switchCheck,
                        ready: updatedInformation.player2.ready,
                        // socket: updatedInformation.player2.socket,
                    },
                };

                break;

            case 'exit_game':
                //Information in the game that needs to be changed upon joining a game has already been added in updatedInformation, so the gameInfo used to update the game tracker is just what's being passed in
                gameInfo = updatedInformation;
                socket.emit('addCreateButton');
                break;
        }



        let gameInfoToUpdateIndex = gameTracker.findIndex((game) => {
            return game.mission === gameInfo.mission
        });

        //Delete game from array
        gameTracker.splice(gameInfoToUpdateIndex, 1);

        //Add game to that same spot with updated information
        gameTracker.splice(gameInfoToUpdateIndex,0,gameInfo);

        console.log('game tracker after update', gameTracker);

        io.emit('updateOpenGames', gameTracker);
    });

    socket.on('deleteGame', (missionName) => {

        let gameToDeleteIndex = gameTracker.findIndex((game) => {
            return game.mission === missionName;
        });

        //Delete game from array
        gameTracker.splice(gameToDeleteIndex, 1);

        io.emit('updateOpenGames', gameTracker);

        //The create button is removed when a player creates or joins a game, but if no games are left, the button has to be added back so more games can be made
        // if(gameTracker.length === 0) {
        //     io.emit('addCreateButton')
        // }

        socket.emit('addCreateButton')

    });

});
//
// io.emit('loadingLobby', playerArray);


http.listen(port,function(){
    console.log('listening on*:', port);
});
