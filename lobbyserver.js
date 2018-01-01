var gameObject = require('./helper/gameObject');

var spawn = require('child_process').spawn;

const bodyParser = require('body-parser');
const path = require('path');


var bcrypt = require('bcrypt');
const credentials = require('./cred').cred;
const saltRounds = require('./cred').saltRounds;
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

// var playerInfo = {
//     profilePic: '',
//     userName: '',
//     agentName: '',
//     socketId: '',
// };

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
        res.redirect('localhost:3000/lobby');
    }
);

app.get('/Logout', function(req, res) {
    req.session.destroy(function(err){
        console.log("Session is destroyed");
        req.logout();
        res.clearCookie('connect.sid');
        res.redirect('localhost:3000/login')
    })
});

app.get('*', function(req, res) {
    res.sendFile(path.resolve("client", "dist", "index.html"));
});


var playerTracker = [

    // playerIDs: [],
    // playerUsernames: [],
    // playerProfilePics: [],
    // playerAgentNames: [],
];

var playerCounter = {
    length: 0,
    count: 0,
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

io.on('connection', function(socket) {

    var playerInfo = {
        profilePic: '',
        userName: '',
        agentName: '',
        socketId: '',
    };

    playerCounter.length++;
    playerCounter.count++;
    let randName = nameAdj[Math.floor(Math.random() * nameAdj.length)] + " " + nameAnimal[Math.floor(Math.random() * nameAnimal.length)];
    // let newPlayer = new PlayerObject(playerTracker.count, socket.id, randName);
    // playerTracker[socket.id] = newPlayer;
    // playerTracker.playerIDs.push(socket.id);
    // playerTracker.playerAgentNames.push(randName);

    playerInfo.socketId = socket.id;
    playerInfo.agentName = randName;

    // let randPlace = placeAdj[Math.floor(Math.random() * placeAdj.length)] + " " + placeGeographic[Math.floor(Math.random() * placeGeographic.length)];

    console.log('client has connected: ', socket.id);
    console.log(playerCounter);

    if (playerCounter.length === 1) {
        socketHolder = socket;
        socket.join('spymaster');
        // var role = 'spymaster';
    }
    else if (playerCounter.length > 1) {
        socketHolder2 = socket;
        socket.join('spy');
        // var role = 'spy'
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

            // playerTracker.playerUsernames.push(profile.displayName);
            // playerTracker.playerProfilePics.push(profile.photos[0].value);
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

        // var gameInfo = {
        //     missionName: "",
        //     playerUserNames: [],
        //     playerAgentNames: [],
        //     playerConnIds: [],
        // };
        let gameInfo = {
            mission:  placeAdj[Math.floor(Math.random() * placeAdj.length)] + " " + placeGeographic[Math.floor(Math.random() * placeGeographic.length)],
            joinButton: false,
            thisPlayer: playerAgentName,
            player1: {
                connId: playerId,
                userName: playerUsername,
                agentName: playerAgentName,
                role: 'Handler',
                switchCheck: false,
                ready: false,
            },
            player2: {
                connId: '',
                userName: '',
                agentName: '',
                role: '',
                switchCheck: '',
                ready: '',
            },
        };
            console.log('game info after create button pressed', gameInfo);
            gameTracker.push(gameInfo);
            console.log('game tracker after create button pressed', gameTracker);
            io.emit('updateOpenGames', gameTracker);

    });




    socket.on('join_button_pressed', (eventId, gameId, playerIds) => {
        console.log("Event Id:", eventId, "Game Id", gameId, "Player Id", playerIds);
    });
    socket.on('signup_submit', (inputValues, id) => {
        console.log(inputValues, 'player id', id);

        var playerData = {
            // agentName: randName,
            email: (inputValues.email),
            firstName: inputValues.first_name,
            lastName: inputValues.last_name,
            password: bcrypt.hashSync(inputValues.password, saltRounds),
            // profilePic: './assets/images/test_fb_1.jpg',
            userName: inputValues.username,
            // "confirmPassword" : inputValues.confirm_password
        };

        // let testAuthStatus = 'true';
        // socket.emit('signup_submit_status', testAuthStatus);

        // socket.emit('signup_submit_status', authStatus);

        // console.log('user auth status', authStatus);
        //
        // socket.emit('updatePlayer', playerData);

        console.log(playerData);

        // let confirmPassword = inputValues.confirm_password;
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        let confirmed = true;

        if (playerData.firstName === null || playerData.firstName === "" || playerData.firstName === undefined) {
            console.log("Enter a firstName");
            confirmed = false;
        }

        if (playerData.lastName === null || playerData.lastName === "" || playerData.lastName === undefined) {
            console.log("Enter a lastName");
            confirmed = false;
        }

        if (!playerData.userName.match(/(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)) {
            console.log('userName problem');
            confirmed = false;
        }

        if (!re.test(playerData.email)) {
            console.log('please enter a valid email address');
            confirmed = false;
        }


        //
        // if (playerInfo.password !== playerInfo.confirmPassword && playerInfo.password !== null && playerInfo.password !== undefined ){
        //     console.log("two passwords are not matched");
        //     confirmed = false;
        // }


        if (confirmed === true) {
            connection.connect((err) => {
                if (err) {
                    console.log('error imn connection', err)
                }
                else {
                    connection.query(`insert into user_info set ?`, playerData, function (error, rows, fields) {
                        if (!!error) {
                            console.log('error in query');
                        }
                        else {
                            console.log('successful query\n');
                            console.log(rows);
                            authStatus = 'true';
                            socket.emit('signup_submit_status', authStatus);
                            // socket.emit('updatePlayer', playerData);
                        }
                    });
                }
            });
        }
    });

    socket.on('facebook_login_submit', (inputValues, id) => {
        console.log(inputValues, 'player id', id);
        //Set to dummy value for now, need to change to reflect whether sign in was successful or not
        // authStatus = 'false';
        // socket.emit('facebook_login_status', authStatus);
        console.log('user auth status', authStatus);
    });


    socket.emit('login_status', authStatus);

    socket.on('startGame', () => {
        const gameInstance = spawn('node', ['gameserver'], {
            stdio: 'inherit'
        });

        gameInstance.on('close', ()=>{
            console.log("Processed Closed");
        })
    });


    socket.on('log_out', () => {
        authStatus = 'false';
        console.log('log out', authStatus)
    });


    socket.on('hello_operator_login_submit', (inputValues, id) => {
        connection.query(`select username , password from user_info where username='${inputValues.username}'`, function (error, rows, fields) {
            // let found = false;

            console.log('inputValues.username', inputValues.username);

            console.log('query result', rows);

            if (!!error) {
                console.log('query error', error);
                console.log('error in query');
                authStatus = 'false';
                socket.emit('hello_operator_login_status', authStatus);
            }
            else if (rows.length) {
                console.log('successful query\n');
                console.log(rows);
                // console.log(`select username from user_info1 where username='${inputValues.username}' and password=PASSWORD('${req.body.password}')`);
                let counter = 0;

                while (counter < rows.length) {
                    console.log(bcrypt.compareSync(inputValues.password, rows[counter].password));
                    if (rows[counter].username === inputValues.username && bcrypt.compareSync(inputValues.password, rows[counter].password)) {
                        console.log('confirmed');
                        console.log(inputValues.username);
                        authStatus = 'true';

                        //Completing the playerInfo object that holds all information for each individual player
                        playerInfo.userName = rows[counter].username;
                        // playerInfo.agentName = randName;


                        playerTracker.push(playerInfo);

                        console.log("playerusername",playerInfo.userName);
                        console.log('player info from database', playerInfo);
                        console.log('player tracker after hello operator login', playerTracker);
                        break;
                    }

                    counter++;
                }
                // authStatus = 'true';
                console.log('Just set hello operator login authStatus', authStatus);
                console.log('update player', playerInfo);
                // socket.emit('updatePlayer', playerInfo);
                // io.to(id).emit('updatePlayer', playerInfo);
                authStatus = 'true';
                socket.emit('hello_operator_login_status', authStatus);
                // let playerArray = [];
                // for(let i=0; i<playerTracker.playerUsernames.length; i++){
                //     let last = playerTracker.length-1;
                //
                //     playerArray.push({
                //         username: playerTracker.playerUsernames[last],
                //         picture: playerTracker.playerProfilePics[last],
                //         agentname: playerTracker.playerAgentNames[last],
                //     });
                // }

                socket.emit('updatePlayer', playerInfo);
                if(playerTracker[0] !== undefined){
                    io.emit('loadingLobby', playerTracker);
                }
                // io.emit('loadingLobby', playerTracker);
                io.emit('updateOpenGames', gameTracker);
            }
            else {
                authStatus = 'false';
                socket.emit('hello_operator_login_status', authStatus);
                console.log("no username");
                console.log(`select username from user_info where username='${inputValues.username}' and password=PASSWORD('${inputValues.password}')`);
            }
            console.log('Emit is asking for authStatus', authStatus);
            // socket.emit('hello_operator_login_status', authStatus);


        });

        console.log(inputValues, 'player id', id);
        socket.emit('hello_operator_login_status', authStatus);
    });
        // socket.emit('hello_operator_login_status', authStatus);
        // socket.emit('updatePlayer', playerInfo);

    socket.emit('numberOfPlayers', playerTracker.length);

    // socket.emit('loadingLobby', playerTracker);



    // console.log('array of players', playerArray);

    // socket.emit('loadingLobby', playerArray);

    // for(let i=0; i<playerTracker.playerIDs.length; i++){
    //     let socketId = playerTracker.playerIDs[i];
    //     io.emit('loadingLobby', playerArray);
    //     console.log('emitted playerArray to ', playerTracker.playerIDs[i])
    // }

    // io.emit('loadingLobby', playerArray);

    socket.on('playerJoinedGame', (joiningPlayer, gameIndex) => {
        io.emit('whichPlayerJoined', joiningPlayer, gameIndex)
    });

    socket.on('playerChoseRole', (playerAndRole, gameClickedOnId, gameIndex) => {
        switch(playerAndRole){
            case 'player1_agent':
                io.emit('whichPlayerRole', 'player1_agent', gameClickedOnId, gameIndex);
                break;
            case 'player1_handler':
                io.emit('whichPlayerRole', 'player1_handler', gameClickedOnId, gameIndex);
                break;
            case 'player2_agent':
                io.emit('whichPlayerRole', 'player2_agent', gameClickedOnId, gameIndex);
                break;
            case 'player2_handler':
                io.emit('whichPlayerRole', 'player2_handler', gameClickedOnId, gameIndex);
                break;
        }
    });

    socket.on('playerReady', (readyPlayer, gameClickedOnId, gameIndex) => {
        switch(readyPlayer){
            case 'player1':
                io.emit('whichPlayerIsReady', 'player1', gameClickedOnId, gameIndex);
                break;
            case 'player2':
                io.emit('whichPlayerIsReady', 'player2', gameClickedOnId, gameIndex);
                break;
        }
    });

    socket.emit('loadOpenGameInfo', (openGames));

    //Updates the game tracker information being stored so that the lobby can display current info to all players
    socket.on('updateGameTracker', (updatedInformationAndAction) => {

        let updatedInformation = updatedInformationAndAction.updatedInformation;
        let action = updatedInformationAndAction.action;

        console.log('game tracker before update', gameTracker);

        // let joinedPlayerIndex = playerTracker.findIndex((player) => {
        //     return player.agentName === joinedPlayer
        // });

        let gameInfo = '';

        //Creates different info to update the game tracker with depending on what action triggered this update
        switch(action){
            case 'join':

                gameInfo = {
                    mission: updatedInformation.mission,
                    joinButton: true,
                    thisPlayer: updatedInformation.thisPlayer,
                    player1: {
                        connId: updatedInformation.player1.connId,
                        userName: updatedInformation.player1.userName,
                        agentName: updatedInformation.player1.agentName,
                        role: 'Handler',
                        switchCheck: false,
                        ready: false,
                    },
                    player2: {
                        // connId: playerTracker[joinedPlayerIndex].socketId,
                        // userName: playerTracker[joinedPlayerIndex].userName,
                        connId: updatedInformation.player2.connId,
                        userName: updatedInformation.player2.userName,
                        agentName:  updatedInformation.player2.agentName,
                        role: 'Handler',
                        switchCheck: false,
                        ready: false,
                    },
                };

            break;

            case 'player1_role':

                //Player 1's role can change regardless of player 2's info, so we need to find this game's player2 info and make sure that this game info includes whatever is already present for player 2 (cannot change player 2 info)
                let thisGameIndex = gameTracker.findIndex((game) => {
                    return game.mission === updatedInformation.mission
                });

                let thisGamePlayer2 = gameTracker[thisGameIndex].player2;

                gameInfo = {
                    mission: updatedInformation.mission,
                    joinButton: true,
                    thisPlayer: updatedInformation.thisPlayer,
                    player1: {
                        connId: updatedInformation.player1.connId,
                        userName: updatedInformation.player1.userName,
                        agentName: updatedInformation.player1.agentName,
                        role: updatedInformation.player1.role,
                        switchCheck: updatedInformation.player1.switchCheck,
                        ready: updatedInformation.player1.ready,
                    },
                    player2: {
                        connId: thisGamePlayer2.connId,
                        userName: thisGamePlayer2.userName,
                        agentName:  thisGamePlayer2.agentName,
                        role: thisGamePlayer2.role,
                        switchCheck: thisGamePlayer2.switchCheck,
                        ready: thisGamePlayer2.ready,
                    },
                };
                break;
        }



        let gameInfoToUpdateIndex = gameTracker.findIndex((game) => {
            return game.mission === gameInfo.mission
        });

       gameTracker.splice(gameInfoToUpdateIndex, 1);

       gameTracker.splice(gameInfoToUpdateIndex,0,gameInfo);

       console.log('game tracker after update', gameTracker);

        io.emit('updateOpenGames', gameTracker);
    });


});

// io.emit('loadingLobby', playerArray);


http.listen(port,function(){
    console.log('listening on*:', port);
});
