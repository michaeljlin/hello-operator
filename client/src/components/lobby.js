import React, {Component} from 'react';
import PlayerList from './player_list';
import './lobby.css';
import OpenGames from './open_games';
import {connect} from 'react-redux';
import {makePlayerArrays} from "../actions";

class Lobby extends Component {

    // constructor(props) {
    //     super(props);
    //
    //     this.state = {
    //         playerTracker: this.props.loggedInPlayers,
    //     };
    // }

    // componentDidMount() {
    //     const socket = this.props.socketConnection;
    //
    //     socket.on('newPlayerTrackerAfterLogOut', (playerTracker) => {
    //         this.props.makePlayerArrays(playerTracker)
    //     });
    // }

    render () {
        // if(this.state.playerTracker!== ""){
        // let playerTracker = this.state.playerTracker;
            return (
                <div id="lobbyContainer">
                    <div>
                        {/*<PlayerList history={this.props.history} playerTracker = {this.state.playerTracker} />*/}
                        <PlayerList history={this.props.history} />
                    </div>

                    <div id="open_games_container">
                        {/*Passing in the game tracker as a prop here ensures that when a new game is created and the redux action receives the new game information, this component is updated */}
                        {/*<OpenGames gameArray= {this.props.openGames.gameTracker}/>*/}
                        <OpenGames/>
                    </div>
                    <div id="messages">
                        <h4>Messages from Mission Control:</h4>
                        <p>{this.props.messageForPlayer.message}</p>
                    </div>
                </div>
            )
        // }
    }
}

function mapStateToProps(state){
    return{
        socketConnection: state.socketConnection.setConn,
        openGames: state.gameInformation.gameArrays,
        messageForPlayer: state.userInterface.playerMessages,
        loggedInPlayers: state.playerInformation.playerArrays,
    }
}

export default connect(mapStateToProps, {makePlayerArrays})(Lobby)