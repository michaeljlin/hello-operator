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
                <div className="spymaster_side_panel"> Camera Detection
                    <i className="material-icons">add</i>
                </div>

                <div className="spymaster_side_panel" style={{top: '24vh'}}> Door Locked</div>
                <div className="spymaster_side_panel" style={{top: '38vh'}}> Switch Pressed</div>
                <div className="spymaster_side_panel" style={{top: '52vh'}}> Picked up item</div>
                <div className="spymaster_side_panel" style={{top: '66vh'}}> Completed mission</div>
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
