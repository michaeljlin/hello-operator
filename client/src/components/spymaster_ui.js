import React, {Component} from 'react';
import monitor from '../assets/images/monitor_frame.svg';
import ComPanel from './com_panel';
import {connect} from 'react-redux';
import {setConn} from "../actions";
import  {displayTE, playerEvent} from "../actions";
import Player from './player';


class spymasterUI extends Component {
    constructor(props){
        super(props);
        // this.playerEvent = this.playerEvent.bind(this)
    }

    componentDidMount(){
        // socket.on('player_event', event){
        //     console.log("player event", event)
        // }

        let event = 'Camera detected agent';
        // let event = 'Door is locked';
        // let event = 'Door is unlocked';
        // let event = 'Agent pressed switch';
        // let event = 'Agent picked up item';
        // let event = 'Mission Complete';
        // let event = ""

        // this.props.playerEvent(event, icon);

        switch(event){
            case 'Camera detected agent':
                this.props.playerEvent('Camera detected agent', 'camera');
                break;
            case 'Door is locked':
                this.props.playerEvent('Door is locked', 'vpn_key');
                break;
            case 'Door is unlocked':
                this.props.playerEvent('Door is unlocked', 'vpn_key');
                break;
            case 'Agent pressed switch':
                this.props.playerEvent('Agent pressed switch', 'radio_button_checked');
                break;
            case 'Agent picked up item':
                this.props.playerEvent('Agent picked up item', 'pan_tool');
                break;
            case 'Mission Complete':
                this.props.playerEvent('Mission Complete', 'check_box');
                break;
        }
    }

    render(){

        // let playerMessageIcon = "";

        // switch(this.props.event){
        //     case this.props.event.event === 'Camera detected agent':
        //         this.props.playerEvent('Camera detected agent', 'camera');
        //         break;
        //     case this.props.event.event === 'Door is locked':
        //         this.props.playerEvent('Door is locked', 'vpn_key');
        //         break;
        //     case this.props.event.event === 'Door is unlocked':
        //         this.props.playerEvent('Door is unlocked', 'vpn_key');
        //         break;
        //     case this.props.event.event === 'Agent pressed switch':
        //         this.props.playerEvent('Agent pressed switch', 'camera');
        //         break;
        //     case this.props.event.event === 'Agent picked up item':
        //         this.props.playerEvent('Camera detected agent', 'camera');
        //         break;
        //     case this.props.event.event === 'Mission Complete':
        //         this.props.playerEvent('Camera detected agent', 'camera');
        //         break;
        // }

        return (
            <div id="spymasterUiContainer" style={{pointerEvents:'none'}}>

                {/*Check to see if props are being passed correctly here*/}
                {/*<Player />*/}
                {/*<img id="monitor" src={monitor}/>*/}
                <div id="spymasterFrame"> </div>
                <div className="spymaster_icon_container" style={{top: '10vh'}}>
                    <i className="material-icons spymaster_icons">camera</i>
                    <p className="spymaster_event_text">Camera Detection</p>
                </div>

                <div className="spymaster_icon_container" style={{top: '20vh'}}>
                    <i className="material-icons spymaster_icons">vpn_key</i>
                    <p className="spymaster_event_text">Door Locked/Door Unlocked</p>
                </div>

                <div className="spymaster_icon_container" style={{top: '30vh'}}>
                    <i className="material-icons spymaster_icons">radio_button_checked</i>
                    <p className="spymaster_event_text">Switch Pressed</p>
                </div>

                <div className="spymaster_icon_container" style={{top: '40vh'}}>
                    <i className="material-icons spymaster_icons">pan_tool</i>
                    <p className="spymaster_event_text">Picked up item</p>
                </div>

                <div className="spymaster_icon_container" style={{top: '50vh'}}>
                    <i className="material-icons spymaster_icons">check_box</i>
                    <p className="spymaster_event_text">Completed Mission</p>
                </div>

                <div id="spymaster_message_display" style={{top: '60vh'}}>

                    <i className="material-icons" id="spymaster_message_icon"> {this.props.event.icon}</i>
                    <p id="spymaster_message_text">{this.props.event.event}</p>
                </div>

                {/*<ComPanel id="leftPanel" />*/}
                {/*<ComPanel id="rightPanel"/>*/}
            </div>
            )
    }
}

function mapStateToProps(state){
    return{
        displayTime: state.userInterface.displayTime,
        socketConnection: state.socketConnection.setConn,
        event: state.playerInformation. playerEvent,
    }
}

export default connect(mapStateToProps, {displayTE, setConn, playerEvent})(spymasterUI);
