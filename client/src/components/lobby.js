import React, {Component} from 'react';
import JoinOrCreateGame from './join_or_create_game';
import './lobby.css';
import OpenGames from './open_games';

class Lobby extends Component {
    render () {
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

export default Lobby