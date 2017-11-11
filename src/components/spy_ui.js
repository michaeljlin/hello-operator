import React, {Component} from 'react';
import ComPanel from "./com_panel";
import CreateModal from "./createModal";
import TimeElapsed from "./timeElapsed";
import {connect} from 'react-redux';
import {displayTE} from "../actions";
import {setConn} from "../actions";
import Player from './player'

class spyUI extends Component {
    constructor (props){
        super(props);
        // this.state = {
        //     comPanel: new ComPanel().state,
        //     modal: new CreateModal().state,
        //     timeElapsed: new TimeElapsed().state,
        // };
    }

    //Include spy agent name somewhere


    render () {
        const elapsedTimeAreaStyle = this.props.displayTime;
        return (
            <div id="spyUiContainer">
                {/*<ComPanel id="spyCom" displayText={this.state.comPanel.displayText}/>*/}

                {/*Make sure player can get conn from redux action*/}
                {/*<Player conn={this.props.conn} parent="spy_ui"/>*/}
                <Player parent="spy_ui"/>

                {/*<CreateModal conn = {this.props} visibility= "false"/>*/}

                {/*Make sure player can get conn from redux action*/}
                <CreateModal visibility= "false"/>


                <TimeElapsed className = {elapsedTimeAreaStyle ? "" : "hide"} />
            </div>
        )
    }
}

function mapStateToProps(state){
    return{
        socketConnection: state.socketConnection.setConn
    }
}

export default connect(mapStateToProps, {displayTE, setConn})(spyUI);