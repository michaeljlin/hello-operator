import React, {Component} from 'react';
import './lobby.css';
import {connect} from 'react-redux';
import {setConn, playerInfo, playerRole} from "../actions";
import profilePic from "../assets/images/test_fb_1.jpg"

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
        this.props.playerRole('spymaster')
    }

    joinButtonClicked(event) {
        const eventId = event.target.id;
        const playerId = this.props.socketConnection.id;
        this.props.socketConnection.emit('join_button_pressed', eventId, playerId);
        this.props.playerRole('spy')
    }

    render() {

        console.log('join game props', this.props.player);
        return (
            <div id="joinOrCreateGameContainer">
                <div id="lobbyPlayerContainer">
                    {/*<img id="profilePic" src={this.props.player.profilePic}/>*/}
                    {/*Below version for testing, src is getting passed in but won't load*/}
                    <img id="profilePic" src={profilePic}/>
                    <p id="username"> {this.props.player.userName} </p>
                </div>
                <button id="create" className="joinButton" onClick={this.createButtonClicked} >Create Game</button>
                <button id="join" className="joinButton" onClick={this.joinButtonClicked} >Join Game</button>
            </div>
        )
    }
}

function mapStateToProps(state){
    return{
        player: state.playerInformation.playerObject,
        playerRole: state.playerInformation.playerRole,
        socketConnection: state.socketConnection.setConn
    }
}

export default connect(mapStateToProps, {setConn, playerInfo, playerRole})(JoinGame)