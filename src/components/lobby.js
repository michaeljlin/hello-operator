import React, {Component} from 'react';
import JoinGame from './join_game';
import './lobby.css'

class Lobby extends Component {
    render () {
        return (
            <div id="lobbyContainer">
                <JoinGame />
            </div>
        )
    }
}

export default Lobby