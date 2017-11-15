import React, {Component} from 'react';
import JoinOrCreateGame from './join_or_create_game';
import './lobby.css'

class Lobby extends Component {
    render () {
        return (
            <div id="lobbyContainer">
                <JoinOrCreateGame />
                <div id="lobbyPlaceholder_1"> </div>
                <div id="lobbyPlaceholder_2"> </div>
            </div>
        )
    }
}

export default Lobby