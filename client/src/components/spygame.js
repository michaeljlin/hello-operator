import React, { Component } from 'react';
import {connect} from 'react-redux';
import {setConn, reconnectOn} from "../actions";

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
            color: 'white',
            conn: this.props.socketConnection,
            objectsToRender: [],
            requestFrameID: null
        };

        this.props.socketConnection.io._reconnection = true;

        this.props.socketConnection.on('update', newState => {
            // console.log(`got: `, newState);
            this.setState({objectsToRender: newState});
        });


        // Can't use onClick={this.handleClick} in Canvas element
        // React event pooling must be synchronous
        // Since all events are tied into SyntheticEvent
        // See: https://reactjs.org/docs/events.html#event-pooling
        // this.handleClick = this.handleClick.bind(this);

        // Use addEventListener instead in componentDidMount
    }

    componentWillMount(){
        this.props.socketConnection.io._reconnection = true;
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

    componentWillUnmount(){
        console.log("goodbye!");
        this.props.socketConnection.io._reconnection = false;
    }

    objectInterpreter(object){

        let context = this.state.context;

        context.fillStyle = object.color;

        switch(object.type){
            case 'arc':
            case 'circle':
            case 'camera':
                context.beginPath();
                context.arc(object.x, object.y, object.r, object.start, object.end);
                context.lineTo(object.x, object.y);
                context.closePath();
                context.fill();
                break;
            case 'box':
            case 'button':
            case 'exit':
            case 'wall':
                context.fillRect(object.x, object.y, object.width, object.height);
                break;
            case 'word':
                context.globalAlpha = object.alpha;
                context.font = object.font;
                context.textAlign = "center";
                context.fillText(object.text, object.x, object.y);
                context.globalAlpha = 1;
                break;
            case 'door':
            case 'custom':
                context.save();
                context.beginPath();
                context.translate(object.x, object.y + object.height/2);
                context.rotate(object.degrees* Math.PI/180);
                context.rect(0, -object.height/2, object.width, object.height);
                context.fillStyle = "blue";
                context.fill();
                context.restore();
                break;
            default:
                context.fillRect(object.x, object.y, object.width, object.height);
        }
    }

    // Main rendering function.
    // Is initiated in componentDidMount
    // Continues to run indefinitely via requestAnimationFrame in client
    canvasUpdater(){
        // this.setState({
        //     color: this.props.server,
        //     objectsToRender: this.props.newObjects
        // });

        // console.log('canvas updater running: ', this.state.color);
        // console.log('received objects are: ', this.state.objectsToRender);
        const context = this.state.context;
        context.clearRect(0,0, 800, 800);
        context.fillStyle = this.state.color;
        context.fillRect(0,0,800,800);

        if(this.state.objectsToRender[0] !== undefined){
            // Loop for all non UI objects
            for(let i = 1; i < this.state.objectsToRender.length; i++){

                if(!this.state.objectsToRender[i].ui){
                    if(this.state.objectsToRender[i].display) {
                        this.objectInterpreter(this.state.objectsToRender[i]);
                    }
                }
            }

            let x = this.state.objectsToRender[0].x;
            let y = this.state.objectsToRender[0].y;

            // console.log('need to render object!');
            context.fillStyle = 'black';
            context.fillRect(x, y, 50, 50);


            // Gradient is used to create shadow/FOV effect around player
            let gradient = context.createRadialGradient(x+25,y+25,0,x+25,y+25, 125);
            gradient.addColorStop(0, 'rgba(255,255,255,0)');
            gradient.addColorStop(1, 'black');
            context.fillStyle = gradient;
            context.fillRect(0, 0, 800, 800);

            // Loop for all UI objects
            for(let i = 1; i < this.state.objectsToRender.length; i++){
                if(this.state.objectsToRender[i].ui){
                    if(this.state.objectsToRender[i].display){
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
                <canvas id="main" ref="canvas" width={this.state.gameStyle.width} height={this.state.gameStyle.height} style={this.state.gameStyle} />
            </div>
        )
    }
}

function mapStateToProps(state){
    console.log(state);

    // let setConnect = state.socketConnection.setConn;
    // setConnect._reconnection = true;
    return{
        socketConnection: state.socketConnection.setConn
    }
}

export default connect(mapStateToProps, {setConn, reconnectOn})(Spygame);
