import React, {Component} from 'react';
import './lobby.css';
import {connect} from 'react-redux';
import {setConn, playerInfo, createButton, playerRole, joinButton, makePlayerArrays} from "../actions";
import profilePic from "../assets/images/test_fb_1.jpg";
import dummyProfilePic from '../assets/images/test_fb_2.jpg';
import Player from './player';
import OpenGames from './open_games';

class JoinGame extends Component {
    constructor(props) {
        super(props);

        this.state = {
            numberOfPlayers: ''
        };

        this.createButtonClicked = this.createButtonClicked.bind(this);
        // this.joinButtonClicked = this.joinButtonClicked.bind(this);
        this.logOut = this.logOut.bind(this);
    }

    componentWillMount(){
        const socket = this.props.socketConnection;
        socket.on('numberOfPlayers', numberOfPlayers => {
            this.setState({
                numberOfPlayers: numberOfPlayers,
            });
            console.log(this.state.numberOfPlayers)
        });

        socket.on('loadingLobby', playerTracker => {
            console.log('playerTracker', playerTracker);
            this.props.makePlayerArrays(playerTracker);
            console.log('playerTracker in action', this.props.loggedInPlayers)
        });

        console.log('JOIN_OR_CREATE_GAME_PROPS', this.props);
    }

    playerList() {
       let playerArray = this.props.loggedInPlayers.playerTracker;

        console.log('playerArray', this.props.loggedInPlayers.playerTracker);

        if(playerArray !== undefined) {
            return(
                playerArray.map((item, index) => {
                    return(
                        <li key={index} style={{height: '8%'}}>
                            <Player userName={playerArray[index].username} picture={playerArray[index].picture} agentName={playerArray[index].agentname} display="true"/>
                        </li>
                    )
                })
            )
        }
    }

    createButtonClicked(event) {
        const eventId = event.target.id;
        const playerId = this.props.socketConnection.id;
        this.props.socketConnection.emit('create_button_pressed', eventId, playerId);
        this.props.createButton('true');
        if(this.props.joinButtonWasClicked === false){
            this.props.playerRole('spymaster');
            console.log('Agent is now the spymaster')
        }
    }

    // joinButtonClicked(event) {
    //     const eventId = event.target.id;
    //     const playerId = this.props.socketConnection.id;
    //     this.props.socketConnection.emit('join_button_pressed', eventId, playerId);
    //     // this.props.playerRole('spy')
    // }

    logOut() {
        const socket = this.props.socketConnection;
        socket.emit('log_out')
    }

    render() {
        return (
            <div id="joinOrCreateGameContainer">
                {/*<div className="lobbyPlayerContainer">*/}
                    {/*/!*<img id="profilePic" src={this.props.player.profilePic}/>*!/*/}
                    {/*/!*Below version for testing, src is getting passed in but won't load*!/*/}
                    {/*<img id="profilePic" src={profilePic}/>*/}
                    {/*<p id="username"> {this.props.player.userName} </p>*/}
                {/*</div>*/}
                {/*<Player display='true'/>*/}
                <ul style={{height: '100%'}}>
                    {this.playerList()}
                </ul>
                <button id="create" className="joinButton" onClick={this.createButtonClicked} >Create Game</button>
                {/*<button id="join" className="joinButton" onClick={this.joinButtonClicked} >Join Game</button>*/}
                <button id="log_out" className="joinButton" onClick={this.logOut}>Log Out</button>
            </div>
        )
    }
}

function mapStateToProps(state){
    return{
        player: state.playerInformation.playerObject,
        socketConnection: state.socketConnection.setConn,
        createButtonWasClicked: state.gameInformation.createButtonWasClicked,
        playerRole: state.playerInformation.playerRole,
        joinButtonWasClicked: state.gameInformation.joinButtonWasClicked,
        loggedInPlayers: state.playerInformation.playerArrays,
    }
}

export default connect(mapStateToProps, {setConn, playerInfo, createButton, playerRole, joinButton, makePlayerArrays})(JoinGame)