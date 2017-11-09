import React, {Component} from 'react';
import './lobby.css'

class JoinGame extends Component {
    constructor(props) {
        super(props);
        this.createButtonClicked = this.createButtonClicked.bind(this);
        this.joinButtonClicked = this.joinButtonClicked.bind(this);
    }

    createButtonClicked(event) {
        this.props.conn.emit('create_button_press', event.target.id);
    }

    joinButtonClicked(event) {
        this.props.conn.emit('join_button_press', event.target.id);
    }

    render() {
        console.log(this.props.conn);
        return (
            <div id="joinGameContainer">
                <button id="create" className="joinButton" onClick={this.createButtonClicked} >Create Game</button>
                <button id="join" className="joinButton" onClick={this.joinButtonClicked} >Join Game</button>
            </div>
        )
    }
}

export default JoinGame