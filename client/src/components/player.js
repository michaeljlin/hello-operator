import React, {Component} from 'react';
import {connect} from 'react-redux';
import {setConn, playerInfo} from "../actions";
import './player.css';

class Player extends Component {
    constructor(props) {
        super(props);
    }

    render(){
        const display = this.props.display;

        let pictureSource = this.props.picture;

        if(this.props.picture === undefined){
            pictureSource = '../assets/images/default_profile.jpg'
        }
            return(
                <div className= {display ? "lobbyPlayerContainer" : "hide"} >
                    <p id="agentNamePlayerContainer" style={this.props.player.agentName === this.props.agentName ? {color: 'limegreen'} : {color: 'white'}}>Agent:  {this.props.agentName}</p>
                    <p id="username" style={this.props.player.userName === this.props.userName ? {color: 'limegreen'} : {color: 'white'}}> Player: {this.props.userName} </p>
                </div>
            )
    }
}

function mapStateToProps(state){
    return{
        socketConnection: state.socketConnection.setConn,
        player: state.playerInformation.playerObject
    }
}

export default connect(mapStateToProps, {setConn, playerInfo})(Player);