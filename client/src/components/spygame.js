import React, { Component } from 'react';
import {connect} from 'react-redux';
import { reconnectOn, playerInfo, setConn} from "../actions";
import charSheet from '../assets/images/vector_characters.svg';
import tileSheet from '../assets/images/vector_tiles.svg';
import geoPattern from '../assets/images/geopattern.svg';
import openSocket from 'socket.io-client';

import sounds from './sounds.js';

// import { sendClick } from "../api";

class Spygame extends Component{
    constructor(props){
        super(props);

        let charImg = new Image();
        let tileImg = new Image();
        let geoImg = new Image();

        charImg.src = charSheet;
        tileImg.src = tileSheet;
        geoImg.src = geoPattern;

        this.state = {
            gameStyle: {
                border: '1px solid black',
                width: 1200,
                height: 800,
                margin: 'auto'
            },
            canvasAttr:{
                width: 1200,
                height: 800
            },
            scale: 1,
            context: null,
            color: 'black',
            // socketConnection: openSocket('http://www.hello-operator.net:8001'),
            socketConnection: this.props.gameSocket,
            objectsToRender: [],
            requestFrameID: null,
            char: charImg,
            tile: tileImg,
            geo: geoImg,
            scroll: 1,
            scrollMax: 1200,
            alpha: 0,
            sounds: sounds,
            animationRef: null
        };

        this.state.socketConnection.io._reconnection = true;

        const id = this.props.id;
        const socket = this.state.socketConnection;

        socket.emit('id', id);

        // this.state.socketConnection.on('connection', ()=>{
        //     console.log('emitting lobbyConn');
        //     this.state.socketConnection.emit('id', this.props.lobbyConn);
        // });

        this.state.socketConnection.on('update', newState => {
            // console.log(`got: `, newState);
            this.setState({objectsToRender: newState});
        });

        this.handleSound = this.handleSound.bind(this);

        this.handleResize = this.handleResize.bind(this);
        // this.state.socketConnection.on('camera', ()=>{
        //     console.log("MESSAGE RECEIVED - MISSION CONTROL");
        // });

        // Can't use onClick={this.handleClick} in Canvas element
        // React event pooling must be synchronous
        // Since all events are tied into SyntheticEvent
        // See: https://reactjs.org/docs/events.html#event-pooling
        // this.handleClick = this.handleClick.bind(this);

        // Use addEventListener instead in componentDidMount
    }

    // componentWillMount(){
    //     this.state.socketConnection.io._reconnection = true;
    //     // this.state.socketConnection.on('connect', ()=>{
    //     //
    //     // });
    // }

    componentDidMount(){
        this.state.sounds.playBackground();
        console.log("component mounted!");
        console.log(`current props: `, this.props);
        console.log('lobbyConn: ', this.props.lobbyConn);

        // Must target canvas element directly instead of window

        document.getElementById('main').addEventListener('click', this.handleClick.bind(this));
        window.addEventListener('keydown', this.handleKeydown.bind(this));
        window.addEventListener('keyup', this.handleKeyup.bind(this));

        window.addEventListener('resize', this.handleResize);
        this.handleResize();

        const context = this.refs.canvas.getContext('2d');
        this.setState({ context: context});
        let refID =  requestAnimationFrame(()=>{this.canvasUpdater()});
        this.setState({animationRef: refID});
    }

    componentWillUnmount(){
        console.log("goodbye!");

        cancelAnimationFrame(this.state.animationRef);
        const socket = this.state.socketConnection; 

        socket.off('update');

        socket.close();
        this.state.sounds.stopBackground();
    }

    handleResize(){
        console.log('handling resize for new innerWidth: ', window.innerWidth);

        let scale = this.state.scale;

        switch(true){
            case window.innerWidth < 1025:
                scale = 0.60;
                break;
            case window.innerWidth < 1400:
                scale = 0.75;
                break;
            default:
                scale = 1;
        }

        this.setState({scale: scale});
    }

    handleSound(){

    }

    soundLoader(){
    }

    objectInterpreter(object){

        // console.log('drawing: ',object);

        let context = this.state.context;

        context.fillStyle = object.color;
        context.strokeStyle = 'black';

        switch(object.type){
            case 'guard':
                context.save();
                context.translate(object.x, object.y);
                context.rotate(object.degrees* Math.PI/180);
                context.translate(-object.x, -object.y);
                context.drawImage(
                    this.state.char, object.sx, object.sy,
                    object.sWidth, object.sHeight,
                    object.dx-42, object.dy-45,
                    object.dWidth, object.dHeight
                );
                context.restore();
                break;
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
            case 'digitalwall':
                context.fillRect(object.x+1, object.y+1, object.width-1, object.height-1);
                context.strokeStyle = 'green';
                context.strokeRect(object.x, object.y, object.width, object.height);
                break;
            case 'word':
                context.globalAlpha = object.alpha;
                context.font = object.font;
                context.textAlign = "center";
                context.fillText(object.text, object.x, object.y);
                context.globalAlpha = 1;
                break;
            case 'door':
                let x = (object.dx ? object.dx : object.x);
                let y = (object.dy ? object.dy : object.y);

                context.save();
                // context.beginPath();
                context.translate(object.x, object.y + object.height/2);
                // context.rotate(object.degrees* Math.PI/180);
                // context.rect(0, -object.height/2, object.width, object.height);
                // context.fillStyle = "blue";
                // context.fill();


                // context.setTransform(1,0,0,1,0,0);
                context.rotate(object.degrees* Math.PI/180);

                context.translate(-object.x, -(object.y + object.height/2));
                context.drawImage(
                    this.state.tile, object.sx, object.sy,
                    object.sWidth, object.sHeight,
                    x, y-20,
                    object.dWidth, object.dHeight
                );

                context.restore();
                break;
            case 'digitaldoor':
                context.save();
                context.beginPath();
                context.translate(object.x, object.y + object.height/2);
                context.rotate(object.degrees* Math.PI/180);
                context.rect(0, -object.height/2, object.width, object.height);
                context.fillStyle = "blue";
                context.fill();
                context.restore();
                break;
            case 'pulse':
                context.globalAlpha = object.alpha;
                context.beginPath();
                context.arc(object.x, object.y, object.r, object.start, object.end);
                context.lineTo(object.x, object.y);
                context.closePath();
                context.fill();
                context.globalAlpha = 1;
                break;
            case 'custom':

                context.strokeRect(object.dx-1, object.dy-1, object.dWidth+2, object.dHeight+2);

                let scroll = this.state.scroll+1;

                if(scroll > this.state.scrollMax){
                    scroll = 1;
                }

                if(this.props.gameSocket.disconnected === false) {
                    this.setState({
                        scroll: scroll
                    });
                }
                
                // console.log("scroll val: ", this.state.scroll);

                // console.log(object);
                context.save();

                // context.globalAlpha = Math.cos(new Date());

                context.drawImage(
                    this.state.geo, object.sx+this.state.scroll, object.sy+this.state.scroll,
                    object.sWidth, object.sHeight,
                    object.dx, object.dy,
                    object.dWidth, object.dHeight
                    );

                context.restore();

                break;
            default:
                context.fillRect(object.x, object.y, object.width, object.height);
        }
    }

    tileInterpreter(object){
        let context = this.state.context;
    }

    // Main rendering function.
    // Is initiated in componentDidMount
    // Continues to run indefinitely via requestAnimationFrame in client
    // Uses 3 layer rendering design for managing how objects overlap
    canvasUpdater(){
        // this.setState({
        //     color: this.props.server,
        //     objectsToRender: this.props.newObjects
        // });

        // console.log('canvas updater running: ', this.state.color);
        // console.log('received objects are: ', this.state.objectsToRender);
        const context = this.state.context;
        context.clearRect(0,0, this.state.gameStyle.width, this.state.gameStyle.height);
        context.fillStyle = this.state.color;
        context.fillRect(0,0,this.state.gameStyle.width,this.state.gameStyle.height);

        let player = this.state.objectsToRender[0];

        // console.log(this.state.objectsToRender);

        if(this.state.objectsToRender.length === 0){
            context.fillStyle = 'white';
            context.font = '48px serif';
            context.textAlign = "center";
            context.fillText('Waiting for Server...', 550, 350);
        }

        if(this.state.objectsToRender[0] !== undefined){
            // Loop for all non UI objects
            for(let i = 3; i < this.state.objectsToRender.length; i++){

                let newObject = this.state.objectsToRender[i];

                if(!newObject.ui){
                    if(newObject.display) {
                        if(newObject.type === 'tile' ||
                            newObject.type === 'object' ||
                            newObject.type === 'wall'
                        ){
                            context.drawImage(
                                this.state.tile, newObject.sx, newObject.sy,
                                newObject.sWidth, newObject.sHeight,
                                (newObject.dx ? newObject.dx : newObject.x),
                                (newObject.dy ? newObject.dy : newObject.y),
                                newObject.dWidth, newObject.dHeight
                            );
                        }
                        else {
                            this.objectInterpreter(newObject);
                        }
                    }
                }
            }

            let guardArray = this.state.objectsToRender[1];
            for(let guardID = 0; guardID < guardArray.length; guardID++){
                this.objectInterpreter(guardArray[guardID]);
                this.objectInterpreter(guardArray[guardID].sight);
            }

            let activeArray = this.state.objectsToRender[2];
            for(let activeID = 0; activeID < activeArray.length; activeID++){
                this.objectInterpreter(activeArray[activeID]);
            }
            // context.fillRect(player.x-15, player.y-15, 80, 80);

            // Player object rendering
            // Occurs inbetween floor/static objects and UI/overhead objects
            let x = player.x;
            let y = player.y;
            // context.drawImage(this.state.char, 0, 360, 60, 60, x-15, y-15, 80, 80);

            context.save();
            context.setTransform(1,0,0,1,player.x+25, player.y+25);
            // context.translate(player.x, player.y);
            context.rotate(player.degrees* Math.PI/180);

            context.drawImage(this.state.char, 0, 360, 60, 60, -40, -40, 80, 80);
            context.restore();

            // Gradient is used to create shadow/FOV effect around player
            // let gradient = context.createRadialGradient(x+25,y+25,0,x+25,y+25, 125);
            // gradient.addColorStop(0, 'rgba(255,255,255,0)');
            // gradient.addColorStop(1, 'black');
            // context.fillStyle = gradient;
            // context.fillRect(0, 0, 800, 800);

            // Loop for all UI objects
            for(let i = 4; i < this.state.objectsToRender.length; i++){
                if(this.state.objectsToRender[i].ui){
                    if(this.state.objectsToRender[i].display){
                        this.objectInterpreter(this.state.objectsToRender[i]);
                    }
                }
            }

            let wordOverlay = this.state.objectsToRender[3];
            if(wordOverlay.display === true){
                this.objectInterpreter(wordOverlay);
            }
        }

        requestAnimationFrame(()=>{this.canvasUpdater()});
    }

    handleClick(event){
        console.log('Click detected: ',event);
        // Coordinates are divided by scale to compensate for smaller canvas size

        this.state.socketConnection.emit('click', {x: event.x/this.state.scale, y: event.y/this.state.scale});
    }

    handleKeydown(event){
        console.log('Key down detected: ', event);
        this.state.socketConnection.emit('keydown', event.key);
    }

    handleKeyup(event){
        console.log('Key up detected: ', event);
        this.state.socketConnection.emit('keyup', event.key);
    }

    render(){

        let gameStyle = {...this.state.gameStyle};
        let scale = this.state.scale;

        gameStyle.width = gameStyle.width*scale;
        gameStyle.height = gameStyle.height*scale;

        return(
            <div>
                <canvas id="main" ref="canvas" width={this.state.canvasAttr.width} height={this.state.canvasAttr.height} style={gameStyle} />
            </div>
        )
    }
}

function mapStateToProps(state){
    console.log(state);

    // let setConnect = state.socketConnection.setConn;
    // setConnect._reconnection = true;
    return{
        id: state.socketConnection.setConn.id,
        playerRole: state.playerInformation.playerRole,
    }
}

export default connect(mapStateToProps, {setConn, reconnectOn, playerInfo})(Spygame);
