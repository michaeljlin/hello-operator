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

var placeAdj = ['Incandescent','Bad','Lumpy','Brown','Hateful','Endurable','Scattered','Parallel','Strange','Striped','Heartbreaking','Uninterested','Inexpensive','Omniscient','Moaning','Wacky','Actually','Slimy','Aboard','Tense','Various','Hard','Enchanted','Exuberant','Utter','Wry','Sore','Belligerent','Aromatic','Flat','Curvy','Vivacious','Sincere','Stiff','Hissing','Long-term','Teeny-tiny','Nappy','Squeamish','Stimulating','Unsuitable','Majestic','Classy','Gratis','Alluring','Stupendous','Happy','Vagabond','Petite','Maniacal','Useless','Nutty','Quick','Resonant','Awesome','Hollow','Grouchy','Bouncy','Mighty','Plain','Vast','Quizzical','Four','Delightful','Tidy','Efficacious','Roomy','Boiling','Dreary','Malicious','Nauseating','Amused','Noisy','Melodic','Hospitable','Fretful','Uncovered','Broad','Ultra','Lush','Round','Strong','Economic','Violent','Wakeful','Dirty','Volatile','Alike','Safe','Glorious','Abaft','Wooden','Third','Obsequious','Six','Voracious','Cumbersome','Bright','Unaccountable','Jolly','Cuddly','Pushy','Erratic','Redundant','Unadvised','Creepy','Fanatical','Guarded','Enormous','Teeny','Aberrant','Parched','Eatable','Grey','Threatening','Kindly','Separate','Longing','Worthless','Historical','Watery','Axiomatic','Adorable','Rapid','Abhorrent','Charming','Scientific','Thick','Eager','Exultant','Dark','Wise','White','Clear','Filthy','Jaded','Equal','Insidious','Capricious','Gentle','Luxuriant','Violet','Psychedelic','Nippy','Entertaining','Boorish','Materialistic','Cooperative','Fumbling','Voiceless','Incredible','Ahead','Tight','First','Closed','Marked','Naughty','Impossible','Idiotic','Irate','Scintillating','Delicious','Undesirable','Silky','Material','Half','Poor','Lyrical','Faint','Disillusioned','Mountainous','Defiant','Boundless','Salty','Elastic','Ritzy','Foamy','Pointless','Modern','Brawny','Imminent','Bite-sized','Enthusiastic','Valuable','Overt','Sordid','Ruthless','Homely','Jumpy','Silly','Drunk','Bloody','Lackadaisical','Godly','Royal','Unwritten','Momentous','Craven','Wonderful','Sparkling'];
var placeGeographic = ['Abîme','Abyssal fan','Abyssal plain','Ait','Alluvial fan','Anabranch','Arch','Archipelago','Arête','Arroyo and (wash)','Atoll','Ayre','Badlands','Bar','Barchan','Barrier bar','Barrier island','Bay','Baymouth bar','Bayou','Beach','Beach cusps','Beach ridge','Bench','Bight','Blowhole','Blowout','Bluff','Bornhardt','Braided channel','Butte','Calanque','Caldera','Canyon','Cape','Carolina bay','Cave','Cenote','Channel','Cirque','Corrie or cwm','Cliff','Coast','Col','Complex crater','Complex volcano','Confluence','Continental shelf','Coral reef','Cove','Cove (mountain)','Crater lake','Crevasse splay','Crevasse','Cryovolcano','Cuesta','Cuspate foreland','Cut bank','Dale','Defile','Dell','Delta, River','Desert pavement','Diatreme','Dike','Dirt cone','Dissected plateau','Doab','Doline','Dome','Drainage basin','Drainage divide','Draw','Dreikanter','Drumlin','Drumlin field','Dry lake','Dune','Dune system','Ejecta blanket','Endorheic basin','Erg','Escarpment (scarp)','Esker','Estuary','Exhumed river channel','Faceted spur','Fault scarp','Firth','Fissure vent','Fjard','Fjord','Flat','Flatiron','Floodplain','Fluvial island','Fluvial terrace','Foibe','Geo','Geyser','Glacial horn','Glacier cave','Glacier foreland','Glacier','Parallel Roads of Glen Roy','Glen','Gorge','Graben','Gulf','Gully','Guyot','Hanging valley','Headland','Hill','Hogback','Homoclinal ridge','Hoodoo','Horst','Impact crater','Inlet','Interfluve','Inverted relief','Island','Islet','Isthmus','Kame delta','Kame','Karst','Karst fenster','Karst valley','Kettle','Kipuka','Knoll','Lacustrine plain','Lagoon','Lake','Lava dome','Lava flow','Lava lake','Lava plain','Lava spine','Lava tube','Lavaka','Levee, natural','Limestone pavement','Loess','Lacustrine terraces','Maar','Machair','Malpaís','Mamelon','Marine terrace','Marsh','Meander','Mesa','Mid-ocean ridge','Mogote','Monadnock','Moraine','Moulin','Mountain','Mountain pass','Mountain range','Mud volcano','Natural arch','Nunatak','Oasis','Oceanic basin','Oceanic plateau','Oceanic ridge','Oceanic trench','Outwash fan','Outwash plain','Oxbow lake','Pediment','Pediplain','Peneplain','Peninsula','Pingo','Pit crater','Plain','Plateau','Playa lake','Plunge pool','Point bar','Polje','Pond','Potrero','Proglacial lake','Pseudocrater','Pull-apart basin','Quarry','Raised beach','Rapid','Ravine','Ria','Ribbed moraines','Ridge','Riffle','Rift valley','River','River delta','River island','Roche moutonnée','Rock formations','Rock shelter','Rock-cut basin','Salt marsh','Salt pan (salt flat)','Sand volcano','Sandhill','Sandur','Scowle','Scree','Sea cave','Seamount','Shield volcano','Shoal','Shore','Shut-in','Side valley','Sinkhole','Sound','Spit','Spring','Stack and stump','Strait','Strandflat','Strath','Stratovolcano','Stream pool','Stream','Strike ridge','Structural bench','Structural terrace','Subglacial mound','Submarine canyon','Submarine volcano','Summit','Supervolcano','Surge channel','Swamp','Tea table','Tepui','Terrace','Terracettes','Tessellated pavement','Thalweg','Tidal marsh','Tide pool','Tombolo','Tor','Tower karst','Towhead','Trim line','Truncated spur','Tunnel valley','Turlough','Tuya','U-shaped valley','Uvala','Vale','Valley','Valley shoulder','Vale','Vent','Ventifact','Volcanic arc','Volcanic cone','Volcanic crater','Volcanic dam','Volcanic field','Volcanic group','Volcanic island','Volcanic plateau','Volcanic plug','Volcano','Wadi','Waterfall','Watershed','Wave cut platform','Yard'];

io.on('connection', function(socket){
    playerTracker.length++;
    playerTracker.count++;
    let randName = nameAdj[Math.floor(Math.random()*nameAdj.length)]+" "+nameAnimal[Math.floor(Math.random()*nameAnimal.length)];
    let newPlayer = new PlayerObject(playerTracker.count, socket.id, randName);
    playerTracker[socket.id] = newPlayer;
    playerTracker.playerIDs.push(socket.id);

    let randPlace = placeAdj[Math.floor(Math.random()*placeAdj.length)]+" "+placeGeographic[Math.floor(Math.random()*placeGeographic.length)];

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
        var gameInfo = {
            place: randPlace,
            placeId: randPlace + playerId
        };
        socket.emit('updateOpenGames', gameInfo)
    });

    socket.on('join_button_pressed', (eventId, playerId) =>{
        console.log(eventId, playerId);
    });

    socket.on('login_submit', (inputValues, id) => {
        console.log(inputValues, 'player id', id);
        var playerInfo = {
            profilePic: './assets/images/test_fb_1.jpg',
            userName:  inputValues.username,
            agentName: randName,
            sprite: 'test_sprite_1.jpg',
            id: id,
            playerNumber: playerTracker.count
            // role: role
        };

        socket.emit('updatePlayer', playerInfo);
    });

});

http.listen(port,function(){
    console.log('listening on*:', port);
});