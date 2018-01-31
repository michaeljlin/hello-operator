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


class spymasterUI extends Component {
    constructor(props){
        super(props);

        this.state = {
            page: 'Phase1',
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
            ],
            toLobbyConfirm: true,
        };

        console.log('gameSocket', this.props.gameSocket);

        this.setHtmlPage = this.setHtmlPage.bind(this);
        this.getHtmlPage = this.getHtmlPage.bind(this);
        this.toLobby = this.toLobby.bind(this);
        this.resetMessage = this.resetMessage.bind(this);
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

    toLobby() {
        this.setState({toLobbyConfirm: false})
    }

    resetMessage() {
        this.setState({toLobbyConfirm: true})
    }

    render(){
        const gameSocket = this.props.gameSocket;

        return (
            <div id="spymasterUiContainer" style={{pointerEvents:'none'}}>

                <div id="spymasterFrame"> </div>

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

                <div id="spymaster_message" style={{top: '70vh'}} >

                    <i className="material-icons" id="spymaster_message_icon">{this.state.icon}</i>
                    <p id="spymaster_message_text"> { this.state.text } </p>

                </div>

                <button onClick={() => {this.toLobby()}} className="toLobbyButtonSpymaster" style={{pointerEvents: 'auto'}}>Back to Lobby</button>

                <div className={this.state.toLobbyConfirm ? 'hide' : 'lobbyMessageSpymaster'}>
                    <p>Continue to lobby and exit mission?</p>
                    <button className="lobbyRedirectDialogButtons" onClick={() =>{ this.props.history.push('/lobby'); gameSocket.emit('playerExiting')}} style={{position: 'relative',
                        left: '25%'}}> Yes</button>
                    <button className="lobbyRedirectDialogButtons" onClick={() => {this.resetMessage()}}>No</button>
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