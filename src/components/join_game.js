import React, {Component} from 'react';
import './lobby.css';
import Player from './player';
import {connect} from 'react-redux';
import {setConn} from "../actions"

class JoinGame extends Component {
    constructor(props) {
        super(props);
        this.createButtonClicked = this.createButtonClicked.bind(this);
        this.joinButtonClicked = this.joinButtonClicked.bind(this);
    }

    createButtonClicked(event) {
        const eventId = event.target.id;
        const playerId = this.props.socketConnection.id;
        this.props.socketConnection.emit('create_button_pressed', eventId, playerId);
    }

    joinButtonClicked(event) {
        const eventId = event.target.id;
        const playerId = this.props.socketConnection.id;
        this.props.socketConnection.emit('join_button_pressed', eventId, playerId);
    }

    render() {
        // console.log(this.props.conn);
        return (
            <div id="joinGameContainer">
                <Player parent="join_game"/>
                <button id="create" className="joinButton" onClick={this.createButtonClicked} >Create Game</button>
                <button id="join" className="joinButton" onClick={this.joinButtonClicked} >Join Game</button>
            </div>
        )
    }
}

function mapStateToProps(state){
    return{
        socketConnection: state.socketConnection.setConn
    }
}

export default connect(mapStateToProps, {setConn})(JoinGame)