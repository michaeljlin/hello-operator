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

        const socket = this.props.socketConnection;

        this.state = {
            page: 'Phase1'
        };

        this.setHtmlPage = this.setHtmlPage.bind(this);
        this.getHtmlPage = this.getHtmlPage.bind(this);

        socket.on('player_event', (event) => {
            console.log("player event", event);
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
                case 'Guard detected agent':
                    this.props.player('Guard detected agent', 'remove_red_eye');
                    break;
            }

            document.getElementById("spymaster_message").classList.add("spymaster_message_display_in");
            document.getElementById("spymaster_message").setAttribute('style', 'display: inline-block');

            setTimeout(() => {
                document.getElementById("spymaster_message").classList.remove("spymaster_message_display_in");
                document.getElementById("spymaster_message").classList.add("spymaster_message_display_out");
                document.getElementById("spymaster_message").setAttribute('style', 'display: none');
            }, 3000);

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

    render(){

        return (
            <div id="spymasterUiContainer" style={{pointerEvents:'none'}}>

                {/*Check to see if props are being passed correctly here*/}
                {/*<Player />*/}
                {/*<img id="monitor" src={monitor}/>*/}
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

                <div className="spymaster_icon_container" style={{top: '60vh'}}>
                    <i className="material-icons spymaster_icons">remove_red_eye</i>
                    <p className="spymaster_event_text">Guard detection</p>
                </div>

                <div id="spymaster_message" style={{top: '70vh'}} >

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