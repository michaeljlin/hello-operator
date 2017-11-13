import React, { Component } from 'react';

// BasicObject assumes a square/rectangle shape
// drawObj can be overridden for different shapes as needed
// Contains no interaction/collision methods

class BasicObject extends Component{
    constructor(props){
        super(props);

        this.drawObj = this.drawObj.bind(this);

        this.state = {
            pos:{x: props.x, y: props.y},
            width: props.width,
            height: props.height,
            color: props.color || 'black'
        }
    }

    drawObj(context){
        context.fillStyle = this.state.color;
        context.fillRect(this.state.pos.x, this.state.pos.y, this.state.width, this.state.height);
    }


}

export default BasicObject;