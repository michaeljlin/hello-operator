import React, {Component} from 'react';
import JoinOrCreateGame from './join_or_create_game';
import './lobby.css';
import OpenGames from './open_games';
import {connect} from 'react-redux';
import {modalActions} from "../actions";

class Lobby extends Component {
    render () {
        this.props.modalActions('none', 'inline-block');
        return (
            <div id="lobbyContainer">
                <div>
                    <JoinOrCreateGame />
                </div>

                <div id="open_games_container">
                    <OpenGames/>
                </div>
                <div id="lobbyPlaceholder_2"> </div>
            </div>
        )
    }
}

export default connect(null, {modalActions})(Lobby)