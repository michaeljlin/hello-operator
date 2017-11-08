import React, {Component} from 'react';
import './lobby.css'

class JoinGame extends Component {

    createButtonClicked() {
        console.log("create")
    }

    joinButtonClicked() {
        console.log("join")
    }

    render() {
        return (
            <div id="joinGameContainer">
                <button id="create" className="joinButton" onClick={this.createButtonClicked} >Create Game</button>
                <button id="join" className="joinButton" onClick={this.joinButtonClicked} >Join Game</button>
            </div>
        )
    }
}

export default JoinGame