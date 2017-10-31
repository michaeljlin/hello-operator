import React, { Component } from 'react';
import Served from './served';
// import { sendClick } from "../api";

class Spygame extends Component{
    constructor(props){
        super(props);

        this.state = {
            gameStyle: {
                border: '1px solid black',
                width: '600px',
                height: '600px',
                margin: 'auto'
            },
            context: null,
            color: this.props.server,
            conn: props.conn,
            objectsToRender: []
        };

        // Can't use onClick={this.handleClick} in Canvas element
        // React event pooling must be synchronous
        // Since all events are tied into SyntheticEvent
        // See: https://reactjs.org/docs/events.html#event-pooling
        // this.handleClick = this.handleClick.bind(this);

        // Use addEventListener instead in componentDidMount
    }

    componentDidMount(){

        console.log("component mounted!");

        // Must target canvas element directly instead of window
        // Old test code:
        // console.log(document.getElementById('main'));
        // window.addEventListener('click', this.handleClick.bind(this));
        // document.getElementsByClassName('canvas');
        document.getElementById('main').addEventListener('click', this.handleClick.bind(this));
        window.addEventListener('keydown', this.handleKeydown.bind(this));
        window.addEventListener('keyup', this.handleKeyup.bind(this));

        const context = this.refs.canvas.getContext('2d');
        this.setState({ context: context});
        requestAnimationFrame(()=>{this.canvasUpdater()});
    }

    // Main rendering function.
    // Is initiated in componentDidMount
    // Continues to run indefinitely via requestAnimationFrame in client
    canvasUpdater(){
        this.setState({
            color: this.props.server,
            objectsToRender: this.props.newObjects
        });

        console.log('canvas updater running: ', this.state.color);
        console.log('received objects are: ', this.state.objectsToRender);
        const context = this.state.context;
        context.clearRect(0,0, 600, 600);
        context.fillStyle = this.state.color;
        context.fillRect(0,0,600,600);

        if(this.state.objectsToRender[0] !== undefined){
            console.log('need to render object!');
            context.fillStyle = 'black';
            context.fillRect(this.state.objectsToRender[0].x, this.state.objectsToRender[0].y, 50, 50);
        }
        requestAnimationFrame(()=>{this.canvasUpdater()});
    }

    handleClick(event){
        console.log('Click detected: ',event);
        this.state.conn.emit('click', {x: event.x, y: event.y});
    }

    handleKeydown(event){
        console.log('Key down detected: ', event);
        this.state.conn.emit('keydown', event.key);
    }

    handleKeyup(event){
        console.log('Key up detected: ', event);
        this.state.conn.emit('keyup', event.key);
    }

    render(){

        return(
            <div>
                {/*/!*<Served />*!/*/}
                <canvas id="main" ref="canvas" width="600px" height="600px" style={this.state.gameStyle} />
            </div>
        )
    }
}

export default Spygame;