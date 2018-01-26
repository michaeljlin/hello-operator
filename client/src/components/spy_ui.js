import React, {Component} from 'react';
import ComPanel from "./com_panel";
import CreateModal from "./createModal";
import TimeElapsed from "./timeElapsed";
import './ui.css';
import {connect} from 'react-redux';
import {displayTE, setConn} from "../actions";

class spyUI extends Component {
    constructor (props){
        super(props);
        this.state = {
            text: '',
            icon: '',
            iconEventArray: [
                {
                    event: 'camera',
                    icon: 'camera',
                    text: 'Camera detected agent'
                },
                {
                    event: 'door',
                    icon: 'vpn_key',
                    text: 'Door is unlocked'
                },
                {
                    event: 'button',
                    icon: 'radio_button_checked',
                    text: 'Agent pressed switch'
                },
                {
                    event: 'pick_up',
                    icon: 'pan_tool',
                    text: 'Agent picked up item'
                },
                {
                    event: 'exit',
                    icon: 'check_box',
                    text: 'Mission Complete'
                },
                {
                    event: 'guard',
                    icon: 'remove_red_eye',
                    text: 'Guard detected agent'
                },
            ]
        };
    }

    componentDidMount() {
        const gameSocket = this.props.gameSocket;

        gameSocket.on('player_event', (event) => {
            console.log("player event", event);

            let thisIcon = this.state.iconEventArray.find((iconTriggered) => {
                return iconTriggered.event === event;
            });

            console.log("this icon", thisIcon);

            this.setState({text: thisIcon.text, icon: thisIcon.icon})
        });
    }

    render () {
        const elapsedTimeAreaStyle = this.props.displayTime;
        return (
            <div id="spyUiContainer" style = {{backgroundColor: 'black', zIndex: '-6'}}>

                <div id="spymaster_message" style={{top: '70vh'}} >
                    <i className="material-icons" id="spymaster_message_icon">{this.state.icon}</i>
                    <p id="spymaster_message_text"> { this.state.text } </p>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state){
    return{
        socketConnection: state.socketConnection.setConn,
    }
}

export default connect(mapStateToProps, {displayTE, setConn})(spyUI);