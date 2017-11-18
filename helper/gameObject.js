module.exports = {};

// Baseline class for all objects
// Should NOT be used by itself
// Use any other object that extends Basic_obj
module.exports['Basic_obj'] = class Basic_obj{
    constructor(x, y, color, ui, solid, display, name){
        this.type = 'basic';
        this.x = x;
        this.y = y;
        this.color = color;
        this.ui = ui;
        this.solid = solid;
        this.display = display;

        this.name = name || this.type;

        this.trigger = this.trigger.bind(this);
    }

    trigger(link){
        console.log(this.name +' linked to: '+link.type);
        this.trigger = function(state){
            if(state){
                link.on();
            }
            else{
                link.off();
            }
        }
    }
};

module.exports['Box'] = class Box extends module.exports['Basic_obj']{
    constructor(x, y, width, height, color, ui, solid, display, name){
        super(x, y, color, ui, solid, display, name);
        this.type = 'box';
        this.width = width;
        this.height = height;
        this.name = name || this.type;
    }
};

module.exports['Wood1'] = class Wood1 extends module.exports['Box']{
    constructor(x, y, name) {
        super(x, y, 50, 50, 'black', false, false, true, name);
        this.type = 'wood1';

        this.sx = 1047;
        this.sy = 85;
        this.sWidth = 63;
        this.sHeight = 63;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['Wood2'] = class Wood2 extends module.exports['Box']{
    constructor(x, y, name) {
        super(x, y, 50, 50, 'black', false, false, true, name);
        this.type = 'wood2';

        this.sx = 1120;
        this.sy = 84;
        this.sWidth = 64;
        this.sHeight = 64;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['Wood3'] = class Wood3 extends module.exports['Box']{
    constructor(x, y, name) {
        super(x, y, 50, 50, 'black', false, false, true, name);
        this.type = 'wood3';

        this.sx = 1194;
        this.sy = 84;
        this.sWidth = 64;
        this.sHeight = 64;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['Wood4'] = class Wood4 extends module.exports['Box']{
    constructor(x, y, name) {
        super(x, y, 50, 50, 'black', false, false, true, name);
        this.type = 'wood4';

        this.sx = 1268;
        this.sy = 84;
        this.sWidth = 64;
        this.sHeight = 64;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['Cobble1'] = class Cobble1 extends module.exports['Box']{
    constructor(x, y, name) {
        super(x, y, 50, 50, 'black', false, false, true, name);
        this.type = 'cobble1';

        this.sx = 602;
        this.sy = 10;
        this.sWidth = 64;
        this.sHeight = 64;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['GreyTile'] = class GreyTile extends module.exports['Box']{
    constructor(x, y, name) {
        super(x, y, 50, 50, 'black', false, false, true, name);
        this.type = 'cobble1';

        this.sx = 750;
        this.sy = 10;
        this.sWidth = 64;
        this.sHeight = 64;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['WhiteTile'] = class WhiteTile extends module.exports['Box']{
    constructor(x, y, name) {
        super(x, y, 50, 50, 'black', false, false, true, name);
        this.type = 'cobble1';

        this.sx = 824;
        this.sy = 10;
        this.sWidth = 64;
        this.sHeight = 64;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['WaterTile'] = class WaterTile extends module.exports['Box']{
    constructor(x, y, name) {
        super(x, y, 50, 50, 'black', false, false, true, name);
        this.type = 'cobble1';

        this.sx = 1342;
        this.sy = 10;
        this.sWidth = 64;
        this.sHeight = 64;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['Grass1'] = class Grass1 extends module.exports['Box']{
    constructor(x, y, name) {
        super(x, y, 50, 50, 'black', false, false, true, name);
        this.type = 'grass1';

        this.sx = 10;
        this.sy = 10;
        this.sWidth = 64;
        this.sHeight = 64;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['Dirt1'] = class Dirt1 extends module.exports['Box']{
    constructor(x, y, name) {
        super(x, y, 50, 50, 'black', false, false, true, name);
        this.type = 'dirt1';

        this.sx = 310;
        this.sy = 10;
        this.sWidth = 60;
        this.sHeight = 60;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['BlueMiniChair'] = class BlueMiniChair extends module.exports['Box']{
    constructor(x, y, name){
        super(x, y, 50, 50, 'black', false, false, true, name);
        this.type = 'orangeMatNW';

        this.dx = x;
        this.dy = y;

        this.sx = 1340;
        this.sy = 1195;
        this.sWidth = 60;
        this.sHeight = 60;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['OrangeMatNW'] = class OrangeMatNW extends module.exports['Box']{
    constructor(x, y, name){
        super(x, y, 50, 50, 'black', false, false, true, name);
        this.type = 'orangeMatNW';

        this.dx = x;
        this.dy = y;

        this.sx = 1344;
        this.sy = 975;
        this.sWidth = 60;
        this.sHeight = 60;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['OrangeMatN'] = class OrangeMatN extends module.exports['Box']{
    constructor(x, y, name){
        super(x, y, 50, 50, 'black', false, false, true, name);
        this.type = 'orangeMatN';

        this.dx = x;
        this.dy = y;

        this.sx = 1420;
        this.sy = 975;
        this.sWidth = 60;
        this.sHeight = 60;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['OrangeMatNE'] = class OrangeMatNE extends module.exports['Box']{
    constructor(x, y, name){
        super(x, y, 50, 50, 'black', false, false, true, name);
        this.type = 'orangeMatNE';

        this.dx = x;
        this.dy = y;

        this.sx = 1490;
        this.sy = 975;
        this.sWidth = 60;
        this.sHeight = 60;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['OrangeMatW'] = class OrangeMatW extends module.exports['Box']{
    constructor(x, y, name){
        super(x, y, 50, 50, 'black', false, false, true, name);
        this.type = 'orangeMatW';

        this.dx = x;
        this.dy = y;

        this.sx = 1344;
        this.sy = 1046;
        this.sWidth = 60;
        this.sHeight = 60;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['OrangeMatC'] = class OrangeMatC extends module.exports['Box']{
    constructor(x, y, name){
        super(x, y, 50, 50, 'black', false, false, true, name);
        this.type = 'orangeMatC';

        this.dx = x;
        this.dy = y;

        this.sx = 1416;
        this.sy = 1046;
        this.sWidth = 60;
        this.sHeight = 60;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['OrangeMatE'] = class OrangeMatE extends module.exports['Box']{
    constructor(x, y, name){
        super(x, y, 50, 50, 'black', false, false, true, name);
        this.type = 'OrangeMatE';

        this.dx = x;
        this.dy = y;

        this.sx = 1490;
        this.sy = 1046;
        this.sWidth = 60;
        this.sHeight = 60;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['OrangeMatSW'] = class OrangeMatSW extends module.exports['Box']{
    constructor(x, y, name){
        super(x, y, 50, 50, 'black', false, false, true, name);
        this.type = 'orangeMatSW';

        this.dx = x;
        this.dy = y;

        this.sx = 1344;
        this.sy = 1120;
        this.sWidth = 60;
        this.sHeight = 60;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['OrangeMatS'] = class OrangeMatS extends module.exports['Box']{
    constructor(x, y, name){
        super(x, y, 50, 50, 'black', false, false, true, name);
        this.type = 'orangeMatS';

        this.dx = x;
        this.dy = y;

        this.sx = 1416;
        this.sy = 1120;
        this.sWidth = 60;
        this.sHeight = 60;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['OrangeMatSE'] = class OrangeMatSE extends module.exports['Box']{
    constructor(x, y, name){
        super(x, y, 50, 50, 'black', false, false, true, name);
        this.type = 'orangeMatSE';

        this.dx = x;
        this.dy = y;

        this.sx = 1490;
        this.sy = 1120;
        this.sWidth = 60;
        this.sHeight = 60;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['Exit'] = class Exit extends module.exports['Box']{
    constructor(x, y, width, height, color, name){
        super(x, y, width, height, color, false, false, false, name);
        this.type = 'exit';
        this.name = name || this.type;

        this.on = this.on.bind(this);
        this.off = this.off.bind(this);
    }

    on(){
        this.display = true;
    };

    off(){
        this.display = false;
    };
};

// module.exports['Custom'] = class Custom extends module.exports['Box']{
//     constructor(x, y, width, height, color, ui, solid, display, name){
//         super(x, y, width, height, color, ui, solid, display, name);
//
//         this.type = 'custom';
//         this.name = name || this.type;
//         this.degrees = 0;
//     }
//
//     update(){
//         if(this.degrees < 360){
//             this.degrees+=1;
//         }
//         else{
//             this.degrees = 0;
//         }
//     }
// };

module.exports['Custom'] = class Custom extends module.exports['Box']{
    constructor(x, y, width, height, color, ui, solid, display, name){
        super(x, y, width, height, color, ui, solid, display, name);

        this.type = 'custom';
        this.name = name || this.type;
        this.degrees = 0;
        this.speed = 1;

        this.open = true;

        this.animate = true;
    }

    update(){

        if(this.animate){
            this.degrees+=this.speed;
        }

        if(this.degrees > 90 && this.open === true){
            this.speed = -1;
            this.degrees = 90;
            this.animate = false;
        }
        else if(this.degrees < 1 && this.open === false){
            this.speed = 1;
            this.degrees = 0;
            this.animate = false;
        }
    }
};

module.exports['Wall'] = class Wall extends module.exports['Box']{
    constructor(x, y, width, height, color, name){
        super(x, y, width, height, color, false, true, true, name);
        this.type = 'wall';
        this.name = name || this.type;
    }
};

module.exports['WoodWallHorizontal'] = class WoodWallHorizontal extends module.exports['Wall']{
    constructor(x, y, name){
        super(x, y, 50, 50, 'black', name);
        this.type = 'wall';
        this.name = name || this.type;

        this.sx = 824;
        this.sy = 306;
        this.sWidth = 64;
        this.sHeight = 64;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['WoodWallVertical'] = class WoodWallVertical extends module.exports['Wall']{
    constructor(x, y, name){
        super(x, y, 50, 50, 'black', name);
        this.type = 'wall';
        this.name = name || this.type;

        this.sx = 824;
        this.sy = 380;
        this.sWidth = 64;
        this.sHeight = 64;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['WoodWallNorthEnd'] = class WoodWallNorthEnd extends module.exports['Wall']{
    constructor(x, y, name){
        super(x, y, 50, 50, 'black', name);
        this.type = 'wall';
        this.name = name || this.type;

        this.sx = 1046;
        this.sy = 380;
        this.sWidth = 64;
        this.sHeight = 64;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['WoodWallEastEnd'] = class WoodWallEastEnd extends module.exports['Wall']{
    constructor(x, y, name){
        super(x, y, 50, 50, 'black', name);
        this.type = 'wall';
        this.name = name || this.type;

        this.sx = 1046;
        this.sy = 306;
        this.sWidth = 64;
        this.sHeight = 64;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['WoodWallSouthEnd'] = class WoodWallSouthEnd extends module.exports['Wall']{
    constructor(x, y, name){
        super(x, y, 50, 50, 'black', name);
        this.type = 'wall';
        this.name = name || this.type;

        this.sx = 1120;
        this.sy = 306;
        this.sWidth = 64;
        this.sHeight = 64;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['WoodWallWestEnd'] = class WoodWallWestEnd extends module.exports['Wall']{
    constructor(x, y, name){
        super(x, y, 50, 50, 'black', name);
        this.type = 'wall';
        this.name = name || this.type;

        this.sx = 1120;
        this.sy = 380;
        this.sWidth = 64;
        this.sHeight = 64;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['WoodWallCornerSW'] = class WoodWallCornerSW extends module.exports['Wall']{
    constructor(x, y, name){
        super(x, y, 50, 50, 'black', name);
        this.type = 'wall';
        this.name = name || this.type;

        this.sx = 676;
        this.sy = 380;
        this.sWidth = 64;
        this.sHeight = 64;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['WoodWallCornerNE'] = class WoodWallCornerNE extends module.exports['Wall']{
    constructor(x, y, name){
        super(x, y, 50, 50, 'black', name);
        this.type = 'wall';
        this.name = name || this.type;

        this.sx = 750;
        this.sy = 306;
        this.sWidth = 64;
        this.sHeight = 64;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['WoodWallCornerNW'] = class WoodWallCornerNW extends module.exports['Wall']{
    constructor(x, y, name){
        super(x, y, 50, 50, 'black', name);
        this.type = 'wall';
        this.name = name || this.type;

        this.sx = 676;
        this.sy = 306;
        this.sWidth = 64;
        this.sHeight = 64;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['WoodWallCornerSE'] = class WoodWallCornerSE extends module.exports['Wall']{
    constructor(x, y, name){
        super(x, y, 50, 50, 'black', name);
        this.type = 'wall';
        this.name = name || this.type;

        this.sx = 750;
        this.sy = 380;
        this.sWidth = 64;
        this.sHeight = 64;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['BossChair'] = class BossChair extends module.exports['Wall']{
    constructor(x, y, name){
        super(x+5, y+5, 40, 40, 'black', name);
        this.type = 'wall';
        this.name = name || this.type;

        this.dx = x;
        this.dy = y;

        this.sx = 1052;
        this.sy = 1427;
        this.sWidth = 52;
        this.sHeight = 43;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['OfficeChair'] = class OfficeChair extends module.exports['Wall']{
    constructor(x, y, name){
        super(x+8, y+8, 34, 34, 'black', name);
        this.type = 'wall';
        this.name = name || this.type;

        this.dx = x;
        this.dy = y;

        this.sx = 1278;
        this.sy = 1427;
        this.sWidth = 46;
        this.sHeight = 45;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['WideScreenLeft'] = class WideScreenLeft extends module.exports['Wall']{
    constructor(x, y, name){
        super(x+8, y+12, 34, 22, 'black', name);
        this.type = 'wall';
        this.name = name || this.type;

        this.dx = x;
        this.dy = y;

        this.sx = 1356;
        this.sy = 1427;
        this.sWidth = 46;
        this.sHeight = 45;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['WideScreenRight'] = class WideScreenRight extends module.exports['Wall']{
    constructor(x, y, name){
        super(x+8, y+12, 34, 22, 'black', name);
        this.type = 'wall';
        this.name = name || this.type;

        this.dx = x;
        this.dy = y;

        this.sx = 1420;
        this.sy = 1427;
        this.sWidth = 46;
        this.sHeight = 45;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['BlackCouchLeft'] = class BlackCouchLeft extends module.exports['Wall']{
    constructor(x, y, name){
        super(x+5, y+5, 40, 40, 'black', name);
        this.type = 'wall';
        this.name = name || this.type;

        this.dx = x;
        this.dy = y;

        this.sx = 1052;
        this.sy = 1352;
        this.sWidth = 52;
        this.sHeight = 45;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['BlackCouchMiddle'] = class BlackCouchMiddle extends module.exports['Wall']{
    constructor(x, y, name){
        super(x+5, y+5, 40, 40, 'black', name);
        this.type = 'wall';
        this.name = name || this.type;

        this.dx = x;
        this.dy = y;

        this.sx = 1121;
        this.sy = 1352;
        this.sWidth = 63;
        this.sHeight = 45;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['BlackCouchRight'] = class BlackCouchRight extends module.exports['Wall']{
    constructor(x, y, name){
        super(x+5, y+5, 40, 40, 'black', name);
        this.type = 'wall';
        this.name = name || this.type;

        this.dx = x;
        this.dy = y;

        this.sx = 1202;
        this.sy = 1352;
        this.sWidth = 50;
        this.sHeight = 45;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['GreenCouchLeft'] = class GreenCouchLeft extends module.exports['Wall']{
    constructor(x, y, name){
        super(x+5, y+5, 40, 40, 'black', name);
        this.type = 'wall';
        this.name = name || this.type;

        this.dx = x;
        this.dy = y;

        this.sx = 1054;
        this.sy = 1195;
        this.sWidth = 56;
        this.sHeight = 60;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['GreenCouchMiddle'] = class GreenCouchMiddle extends module.exports['Wall']{
    constructor(x, y, name){
        super(x+5, y+5, 40, 40, 'black', name);
        this.type = 'wall';
        this.name = name || this.type;

        this.dx = x;
        this.dy = y;

        this.sx = 1121;
        this.sy = 1195;
        this.sWidth = 56;
        this.sHeight = 60;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['GreenCouchRight'] = class GreenCouchRight extends module.exports['Wall']{
    constructor(x, y, name){
        super(x+5, y+5, 40, 40, 'black', name);
        this.type = 'wall';
        this.name = name || this.type;

        this.dx = x;
        this.dy = y;

        this.sx = 1194;
        this.sy = 1195;
        this.sWidth = 56;
        this.sHeight = 60;
        this.dWidth = 50;
        this.dHeight = 50;
    }
};

module.exports['Door'] = class Door extends module.exports['Box']{
    constructor(x, y, width, height, color, locked, opened, reversed, name){
        super(x, y, width, height, color, false, true, true, name);
        this.type = 'door';
        this.lockState = (locked !== undefined ? locked : true);
        this.openState = opened !== undefined ? opened : false;
        this.reversed = reversed;

        this.degrees = this.reversed ? 360 : 0;
        this.speed = this.reversed ? -1 : 1;
        this.maxDeg = this.reversed ? 360 : 90;
        this.minDeg = this.reversed ? 270 : 0;

        this.animate = false;

        this.sx = 676;
        this.sy = 1260;
        this.sWidth = 64;
        this.sHeight = 64;
        this.dWidth = 100;
        this.dHeight = 50;

        this.update = this.update.bind(this);
        this.on = this.on.bind(this);
        this.off = this.off.bind(this);
    }

    update(){
        if(this.lockState){
            return;
        }
        else if(!this.openState){
            // console.log("Need to animate opening door here!");

            if(this.animate){
                this.degrees+=this.speed;
            }

            if(this.degrees > this.maxDeg){
                this.speed = -1;
                this.degrees = this.maxDeg;
                this.animate = false;
            }
            else if(this.degrees < this.minDeg){
                this.speed = 1;
                this.degrees = this.minDeg;
                this.animate = false;
            }
        }
    }

    on(){
        this.lockState = true;
    }

    off(){
        this.lockState = false;
    }
};

module.exports['Button'] = class Button extends module.exports['Box']{
    constructor(x, y, width, height, color, name){
        super(x, y, width, height, color, false, false, true, name);
        this.type = 'button';
        this.name = name || this.type;
    }
};

module.exports['Word'] = class Word extends module.exports['Basic_obj']{
    constructor(x, y, text, color, font, ui, solid, display, name){
        super(x, y, color, ui, solid, display, name);
        this.type = 'word';
        this.text = text;
        this.font = font || '30px Arial';

        this.name = name || this.type;

        this.fadeOut = true;
        this.alpha = 1;
        this.alphaChange = 1/120;

        this.on = this.on.bind(this);
        this.off = this.off.bind(this);
        this.set = this.set.bind(this);
        this.update = this.update.bind(this);
    }

    update(){
        if(this.fadeOut){
            this.alpha -= this.alphaChange;

            if(this.alpha <= 0){
                this.fadeOut = false;
                this.display = false;
                this.alpha = 1;
            }
        }
    }

    set(newString){
        this.text = newString;
    }

    on(){
        this.display = true;
        this.fadeOut = true;
    };

    off(){
        this.display = false;
        this.fadeOut = false;
    };
};

module.exports['Circle'] = class Circle extends module.exports['Basic_obj']{
    constructor(x, y, radius, start, end, color, ui, solid, display, name){
        super(x, y, color, ui, solid, display, name);
        this.type = 'circle';
        this.name = name || this.type;

        this.r = radius;
        this.start = start || 0;
        this.end = end || (2*Math.PI);
    }
};

module.exports['Guard'] = class Guard extends module.exports['Circle']{
    constructor(x, y, name, movement, range){
        super(x, y, 50, 0, (2*Math.PI), 'red', false, true, true, name);
        this.type = 'guard';
        this.movement = movement;
        this.range = range;

        this.update = this.update.bind(this);
    }

    update(){
        console.log("Need to animate guard movement here!");
    }
};

module.exports['Camera'] = class Camera extends module.exports['Circle']{
    constructor(x, y, radius, start, end, range, direction, color, name){
        super(x, y, radius, start || (.30 * Math.PI), end || (.70 * Math.PI), color, false, false, true, name);
        this.type = 'camera';
        this.name = name || this.type;

        this.range = range || [0,180];
        this.direction =  direction || 1;

        this.update = this.update.bind(this);
    }

    update(){
        let startDeg = this.start * (180/Math.PI);
        let range = this.range;

        if(startDeg >= range[1]-60){
            this.direction = -.5;
        }
        else if(startDeg <= range[0]){
            this.direction = .5;
        }

        startDeg += this.direction;

        let endDeg = startDeg + 60;

        this.start = startDeg * (Math.PI/180);
        this.end = endDeg * (Math.PI/180);
    };
};