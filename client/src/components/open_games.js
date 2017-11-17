import React, {Component} from 'react';
import {setConn, playerInfo, gameInfo, createButton} from "../actions"
import {connect} from "react-redux";
import Player from './player';

class OpenGames extends Component {

    componentDidMount(){
        const socket = this.props.socketConnection;
        socket.on('updateOpenGames', gameInfo => {
            return this.props.gameInfo(gameInfo)
        });

    }

    render(){
        const gameName = this.props.openGame.place;
        const player = this.props.player.agentName;

        if(this.props.createButtonWasClicked === 'true'){
            return(
                <div className="lobbyPlayerContainer">
                    <p id="username">Mission {gameName}</p>
                    <p id="username_2"> Agent {player}</p>
                </div>
            )
        }
        else {
            return (
                <div> </div>
            )
        }
    }
}

function mapStateToProps(state){
    return{
        socketConnection: state.socketConnection.setConn,
        player: state.playerInformation.playerObject,
        openGame: state.gameInformation.gameObject,
        createButtonWasClicked: state.gameInformation.createButtonWasClicked
    }
}

export default connect(mapStateToProps, {setConn, playerInfo, gameInfo, createButton})(OpenGames)
