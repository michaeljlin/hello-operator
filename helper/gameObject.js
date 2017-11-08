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

module.exports['Wall'] = class Wall extends module.exports['Box']{
    constructor(x, y, width, height, color, name){
        super(x, y, width, height, color, false, true, true, name);
        this.type = 'wall';
        this.name = name || this.type;
    }
};

module.exports['Door'] = class Door extends module.exports['Box']{
    constructor(x, y, width, height, color, ui, solid, display, name, locked, opened){
        super(x, y, width, height, color, ui, solid, display, name);
        this.type = 'door';
        this.lockState = locked !== undefined ? locked : true;
        this.openState = opened !== undefined ? opened : false;

        this.update = this.update.bind(this);
        this.lock = this.lock();
        this.unlock = this.unlock();
    }

    update(){
        if(this.lockState){
            return;
        }
        else if(this.openState){
            console.log("Need to animate opening door here!");
        }
    }

    lock(){
        this.lockState = true;
    }

    unlock(){
        this.lockState = false;
    }
};

module.exports['Button'] = class Button extends module.exports['Box']{
    constructor(x, y, width, height, color, name){
        super(x, y, width, height, color, false, false, true, name);
        this.name = name || this.type;
    }
};

module.exports['Word'] = class Word extends module.exports['Basic_obj']{
    constructor(x, y, text, color, ui, solid, display, name){
        super(x, y, text, color, ui, solid, display, name);
        this.type = 'word';
        this.text = text;
        this.color = color;

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
        this.type = 'arc';
        this.name = name || this.type;

        this.range = range || [0,180];
        this.direction =  direction || 1;

        this.update = this.update.bind(this);
    }

    update(){
        let startDeg = this.start * (180/Math.PI);
        let range = this.range;

        if(startDeg >= range[1]-60){
            this.direction = -1;
        }
        else if(startDeg <= range[0]){
            this.direction = 1;
        }

        startDeg += this.direction;

        let endDeg = startDeg + 60;

        this.start = startDeg * (Math.PI/180);
        this.end = endDeg * (Math.PI/180);
    };
};