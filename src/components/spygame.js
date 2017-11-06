import React, { Component } from 'react';
import Served from './served';
// import { sendClick } from "../api";

class Spygame extends Component{
    constructor(props){
        super(props);

        this.state = {
            gameStyle: {
                border: '1px solid black',
                width: '800px',
                height: '800px',
                margin: 'auto'
            },
            context: null,
            color: this.props.server,
            conn: props.conn,
            objectsToRender: [],
            requestFrameID: null
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

    objectInterpreter(object){
        let context = this.state.context;

        context.fillStyle = object.color;

        switch(object.type){
            case 'arc':
            case 'circle':
                context.beginPath();
                context.arc(object.x, object.y, object.r, object.start, object.end);
                context.lineTo(object.x, object.y);
                context.closePath();
                context.fill();
                break;
            case 'box':
                context.fillRect(object.x, object.y, object.width, object.height);
                break;
            case 'word':
                context.font = "30px Arial";
                context.textAlign = "center";
                context.fillText(object.text, object.x, object.y);
                break;
            case 'custom':
                break;
            default:
                context.fillRect(object.x, object.y, object.width, object.height);
        }
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
        context.clearRect(0,0, 800, 800);
        context.fillStyle = this.state.color;
        context.fillRect(0,0,800,800);

        if(this.state.objectsToRender[0] !== undefined){
            // let x = this.state.objectsToRender[0].x;
            // let y = this.state.objectsToRender[0].y;
            //
            // console.log('need to render object!');
            // context.fillStyle = 'black';
            // context.fillRect(x, y, 50, 50);


            // Loop for all non UI objects
            for(let i = 1; i < this.state.objectsToRender.length; i++){

                if(!this.state.objectsToRender[i].ui){
                    this.objectInterpreter(this.state.objectsToRender[i]);
                }
            }

            // let box = this.state.objectsToRender[1];
            // context.fillStyle = box.color;
            // context.fillRect(box.x, box.y, box.width, box.height);

            let x = this.state.objectsToRender[0].x;
            let y = this.state.objectsToRender[0].y;

            console.log('need to render object!');
            context.fillStyle = 'black';
            context.fillRect(x, y, 50, 50);


            // Gradient is used to create shadow/FOV effect around player
            let gradient = context.createRadialGradient(x+25,y+25,0,x+25,y+25, 100);
            // gradient.addColorStop(0, 'rgba(200,200,200,0)');
            gradient.addColorStop(0, 'rgba(255,255,255,0)');
            gradient.addColorStop(1, 'black');
            context.fillStyle = gradient;
            context.fillRect(0, 0, 800, 800);

            // console.log("Alert display: ",this.state.objectsToRender[3].display);

            // Loop for all UI objects
            for(let i = 1; i < this.state.objectsToRender.length; i++){
                if(this.state.objectsToRender[i].ui){
                    // console.log('*******Showing UI!*******');
                    // console.log('*******Showing UI!*******');
                    // console.log('*******Showing UI!*******');
                    if(this.state.objectsToRender[i].display){

                        // console.log('*******Displaying alert*******');
                        // console.log('*******Displaying alert*******');
                        // console.log('*******Displaying alert*******');

                        this.objectInterpreter(this.state.objectsToRender[i]);
                    }
                }
            }
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
                <canvas id="main" ref="canvas" width={this.state.gameStyle.width} height={this.state.gameStyle.height} style={this.state.gameStyle} />
            </div>
        )
    }
}

export default Spygame;