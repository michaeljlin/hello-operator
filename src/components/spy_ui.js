import React, {Component} from 'react';
import ComPanel from "./com_panel";
import CreateModal from "./createModal";
import TimeElapsed from "./timeElapsed";
import {connect} from 'react-redux';
import {displayTE} from "../actions";
import {setConn} from "../actions";
// import {playerParent} from "../actions";
// import {comParent} from "../actions"
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

    // componentWillMount(){
    //     this.props.comParent('spy_ui')
    // }

    render () {
        const elapsedTimeAreaStyle = this.props.displayTime;
        return (
            <div id="spyUiContainer">
                {/*<Player />*/}
                <CreateModal visibility= "false"/>
                <TimeElapsed className = {elapsedTimeAreaStyle ? "" : "hide"} />
            </div>
        )
    }
}

function mapStateToProps(state){
    return{
        socketConnection: state.socketConnection.setConn,
        // isParent: state.playerInformation.parent,
        // isComParent: state.comInformation.comParent
    }
}

// export default connect(mapStateToProps, {displayTE, setConn, playerParent, comParent})(spyUI);
export default connect(mapStateToProps, {displayTE, setConn})(spyUI);