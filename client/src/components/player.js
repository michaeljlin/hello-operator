import React, {Component} from 'react';
import {connect} from 'react-redux';
import {setConn, playerInfo} from "../actions";
import './player.css';

class Player extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const socket = this.props.socketConnection;

        socket.on('updatePlayer', playerInfo =>{
            console.log(playerInfo);
            return this.props.playerInfo(playerInfo)
        });

    }

    render(){
        return(
            <div> </div>
        )
    }
}

function mapStateToProps(state){
    return{
        socketConnection: state.socketConnection.setConn,
        // data: state,
        // parent: state.playerInformation.isParent,
        // whichComParent: state.comInformation.isComParent
        player: state.playerInformation.playerObject
    }
}

export default connect(mapStateToProps, {setConn, playerInfo})(Player);