import React, {Component} from 'react';
import ComPanel from "./com_panel";
import CreateModal from "./createModal";
import TimeElapsed from "./timeElapsed";
import {connect} from 'react-redux';
import {displayTE, setConn} from "../actions";

class spyUI extends Component {
    constructor (props){
        super(props);
    }

    render () {
        const elapsedTimeAreaStyle = this.props.displayTime;
        return (
            <div id="spyUiContainer">
                <CreateModal visibility= "false" parent="spy_ui"/>
                <TimeElapsed className = {elapsedTimeAreaStyle ? "" : "hide"} />
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