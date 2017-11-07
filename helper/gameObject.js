module.exports = {};

module.exports['Box'] = function(x, y, width, height, color, ui, solid, display, name){
    this.type = 'box';
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.ui = ui;
    this.solid = solid;
    this.display = display;

    this.name = name || this.type;

    this.trigger = function(link){
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

module.exports['Word'] = function(x, y, text, color, ui, solid, display, name){
    this.type = 'word';
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.ui = ui || true;
    this.solid = solid || false;
    this.display = display || false;

    this.name = name || this.type;

    this.on = function(){
        this.display = true;
    };

    this.off = function(){
        this.display = false;
    };
};

module.exports['Circle'] = function(x, y, radius, start, end, color, ui, solid, display, name){
    this.type = 'circle';
    this.x = x;
    this.y = y;
    this.r = radius;
    this.start = start || 0;
    this.end = end || (2*Math.PI);
    this.color = color;
    this.ui = ui;
    this.solid = solid;
    this.display = display;

    this.name = name || this.type;

    this.trigger = function(link){
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

module.exports['Arc'] = function(x, y, radius, start, end, range, direction, color, ui, solid, display, name){
    this.type = 'arc';
    this.x = x;
    this.y = y;
    this.r = radius || 100;
    this.start = start || (.30 * Math.PI);
    this.end = end || (.70 * Math.PI);
    this.range = range || [0,180];
    this.direction =  direction || 1;
    this.color = color || 'yellow';
    this.ui = ui;
    this.solid = solid;
    this.display = display;

    this.name = name || this.type;

    this.update = function(){
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

    this.trigger = function(link){
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