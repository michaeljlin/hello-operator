import React, {Component} from 'react';
import ComPanel from "./com_panel";
import TimeElapsed from "./timeElapsed";
import './ui.css';
import {connect} from 'react-redux';
import {displayTE, setConn} from "../actions";

class spyUI extends Component {
    constructor (props){
        super(props);
        debugger;
        this.state = {
            text: '',
            icon: '',
            triggered: false,
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
            ],
            toLobbyConfirm: true,
            exitMessage: '',
        };

        this.openDialog = this.openDialog.bind(this);
        this.resetMessage = this.resetMessage.bind(this);
    }

    componentDidMount() {
        const gameSocket = this.props.gameSocket;

        gameSocket.on('player_event', (event) => {

            let thisIcon = this.state.iconEventArray.find((iconTriggered) => {
                return iconTriggered.event === event;
            });
            this.setState({text: thisIcon.text, icon: thisIcon.icon, triggered: true},()=>{
                setTimeout(() => {
                    
                    this.setState({triggered: false});
                }, 2000);
            });

            gameSocket.on('exitMessage', (message) => {
                this.setState({exitMessage: message})
            })
        });
    }

    openDialog() {
        this.setState({toLobbyConfirm: false})
    }

    resetMessage() {
        this.setState({toLobbyConfirm: true})
    }

    goingToLobby() {
        const gameSocket = this.props.gameSocket;

        if(gameSocket.disconnected){
            this.props.socketConnection.emit('earlyQuit', sessionStorage.getItem('jwt'), (response)=>{
                sessionStorage.setItem('jwt', response);
            });
        }

        gameSocket.disconnect();

        this.props.history.push('/lobby');
    }

    render () {
        const gameSocket = this.props.gameSocket;

        let triggered = this.state.triggered;

        let messageStyle = {};
        if(triggered === true){
            messageStyle.opacity = 1;
        }
        else{
            messageStyle.opacity = 0;
        }

        return (
            <div id="spyUiContainer">
            <button onClick={() => {this.openDialog()}} className="toLobbyButtonSpy" style={{pointerEvents: 'auto'}}>Back to Lobby</button>

                <div style={messageStyle} id="spy_message">
                    <i className="material-icons" id="spymaster_message_icon">{this.state.icon}</i>
                    <p id="spymaster_message_text"> { this.state.text } </p>
                </div>

                <div className={this.state.toLobbyConfirm ? 'hide' : 'lobbyMessageSpy'}>
                    <p>Continue to lobby and exit mission?</p>
                    <button className="lobbyRedirectDialogButtons" onClick={() =>{ this.goingToLobby()}}> Yes</button>
                    <button className="lobbyRedirectDialogButtons" onClick={() => {this.resetMessage()}}>No</button>
                </div>
                <div id="exitMessageSpy">
                    <p>{this.state.exitMessage}</p>
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