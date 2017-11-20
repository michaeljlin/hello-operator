import React, {Component} from 'react';
import monitor from '../assets/images/monitor_frame.svg';
import ComPanel from './com_panel';
import {connect} from 'react-redux';
import {setConn} from "../actions";
import  {displayTE} from "../actions";
import Player from './player';


class spymasterUI extends Component {
    constructor(props){
        super(props);
    }


    //Include spymaster agent name somewhere

    render(){

        return (
            <div id="spymasterUiContainer">

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
                    <i className="material-icons" id="spymaster_message_icon">check_box</i>
                    <p id="spymaster_message_text">Completed mission</p>
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
        socketConnection: state.socketConnection.setConn
    }
}

export default connect(mapStateToProps, {displayTE, setConn})(spymasterUI);
