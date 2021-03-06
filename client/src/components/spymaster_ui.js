import React, {Component} from 'react';
import monitor from '../assets/images/monitor_frame.svg';
import ComPanel from './com_panel';
import {connect} from 'react-redux';
import  {setConn, displayTE, playerEvent} from "../actions";
import Player from './player';
import './ui.css';
import Phase1 from './phase1';
import Phase2 from './phase2';
import Phase3 from './phase3';

import sounds from './sounds.js';

class spymasterUI extends Component {
    constructor(props){
        super(props);

        this.state = {
            page: 'Phase1',
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

        this.setHtmlPage = this.setHtmlPage.bind(this);
        this.getHtmlPage = this.getHtmlPage.bind(this);
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
            })
    
            gameSocket.on('exitMessage', (message) => {
                this.setState({exitMessage: message})
            })
        });
    }

    setHtmlPage(html){
        switch(html){
            case 'Phase1':
                this.setState({page: 'Phase1'});
                break;
            case 'Phase2':
                this.setState({page: 'Phase2'});
                break;
            case 'Phase3':
                this.setState({page: 'Phase3'});
                break;
            default:
                return null
        }
    }

    getHtmlPage(){
        switch(this.state.page){
            case 'Phase1':
                return <Phase1/>;
                break;
            case 'Phase2':
                return <Phase2/>;
                break;
            case 'Phase3':
                return <Phase3/>;
                break;
            default:
                return null

        }
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

    render(){
        const gameSocket = this.props.gameSocket;

        const triggered = this.state.triggered;

        let messageStyle = {};
        if(triggered === true){
            messageStyle.opacity = 1;
        }
        else{
            messageStyle.opacity = 0;
        }

        return (
            <div id="spymasterUiContainer" style={{pointerEvents:'none'}}>
                <button onClick={() => {this.openDialog()}} className="toLobbyButtonSpymaster" style={{pointerEvents: 'auto'}}>Back to Lobby</button>

                <div id="static_html_container">
                    <ul>
                        <li>
                            <button onClick={() => {this.setHtmlPage('Phase1')}} style={{pointerEvents: 'auto'}}>Phase 1</button>
                        </li>
                        <li>
                            <button onClick={() => {this.setHtmlPage('Phase2')}} style={{pointerEvents: 'auto'}}>Phase 2</button>
                        </li>
                        <li>
                            <button onClick={() => {this.setHtmlPage('Phase3')}} style={{pointerEvents: 'auto'}}>Phase 3</button>
                        </li>
                    </ul>
                    <div id="html_display">
                        {this.getHtmlPage()}
                    </div>
                </div>

                <div style={messageStyle} id="spymaster_message">

                    <i className="material-icons" id="spymaster_message_icon">{this.state.icon}</i>
                    <p id="spymaster_message_text"> { this.state.text } </p>

                </div>

                <div className={this.state.toLobbyConfirm ? 'hide' : 'lobbyMessageSpymaster'}>
                    <p>Continue to lobby and exit mission?</p>
                    <button className="lobbyRedirectDialogButtons" onClick={() => this.goingToLobby()}> Yes</button>
                    <button className="lobbyRedirectDialogButtons" onClick={() => {this.resetMessage()}}>No</button>
                </div>
                <div id="exitMessageSpymaster">
                    <p>{this.state.exitMessage}</p>
                </div>
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