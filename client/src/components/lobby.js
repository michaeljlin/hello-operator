import React, {Component} from 'react';
import PlayerList from './player_list';
import './lobby.css';
import OpenGames from './open_games';
import {connect} from 'react-redux';
import {makePlayerArrays} from "../actions";

class Lobby extends Component {

    componentWillMount(){
        if(this.props.socketConnection === null){
            // const socket = openSocket(domain+'8000', { reconnection: true });
            // this.props.setConn(socket);

            this.props.history.push('/');
        }
    }

    render () {

        if(this.props.socketConnection === null){
            return (<div>Returning to Landing Page</div>)
        }
        else {
            return (
                <div id="lobbyContainer">
                    {/*<div id="phone_cover" className="hide">*/}
                        {/*<p>This game is not suitable for a phone, please move to a larger device</p>*/}
                    {/*</div>*/}

                    <div id="open_games_container">
                        <OpenGames history={this.props.history}/>
                    </div>

                    <div id="joinOrCreateGameContainer">
                        <PlayerList history={this.props.history}/>
                    </div>

                    <div id="messages">
                        <h4>Messages from Mission Control:</h4>
                        <p>{this.props.messageForPlayer.message}</p>
                    </div>
                </div>
            )
        }
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