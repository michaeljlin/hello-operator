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

        this.on = this.on.bind(this);
        this.off = this.off.bind(this);
        this.set = this.set.bind(this);
    }

    set(newString){
        this.text = newString;
    }

    on(){
        this.display = true;
    };

    off(){
        this.display = false;
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