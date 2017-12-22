import React, {Component} from 'react';
import './lobby.css';
import './login.css';
import {connect} from 'react-redux';
import {setConn, playerInfo, createButton, playerRole, joinButton, makePlayerArrays, makeGameArrays} from "../actions";
import profilePic from "../assets/images/test_fb_1.jpg";
import dummyProfilePic from '../assets/images/test_fb_2.jpg';
import Player from './player';
import OpenGames from './open_games';

class JoinGame extends Component {
    constructor(props) {
        super(props);

        // this.createButtonClicked = this.createButtonClicked.bind(this);
        // this.joinButtonClicked = this.joinButtonClicked.bind(this);
        this.logOut = this.logOut.bind(this);
    }

    //Defines the socket connection,
    componentWillMount(){
        const socket = this.props.socketConnection;

        // socket.on('loadingLobby', playerTracker => {
        //     console.log('playerTracker', playerTracker);
        //     this.props.makePlayerArrays(playerTracker);
        //     console.log('playerTracker in action', this.props.loggedInPlayers)
        // });

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
                            <Player userName={playerArray[index].userName} picture={playerArray[index].profilePic} agentName={playerArray[index].agentName} display="true"/>
                        </li>
                    )
                })
            )
        }
    }


    // createButtonClicked() {
    //     //Causes the create button to disappear so each player can only make one game at a time
    //     document.getElementById('create').classList.add('hide');
    //
    //     const socket = this.props.socketConnection;
    //     const playerId = this.props.socketConnection.id;
    //     const playerUsername = this.props.player.userName;
    //     const playerAgentName = this.props.player.agentName;
    //
    //     this.props.playerRole('spymaster', playerAgentName, playerId);
    //
    //     console.log('current props', this.props);
    //
    //     if(playerId && playerUsername && playerAgentName !== undefined){
    //         socket.emit('create_button_pressed', playerId, playerUsername, playerAgentName);
    //     }
    //
    //     this.props.createButton('true');
    //
    //     socket.on('updateOpenGames', gameTracker => {
    //         console.log('game tracker', gameTracker);
    //         this.props.makeGameArrays(gameTracker)
    //     });
    //
    //     //Only load the game component when all of the information about the open games and player roles have been defined
    //     console.log('current props again', this.props);
    //     if(this.props.openGames.gameTracker && this.props.playerRoleObject.spymaster !== undefined){
    //         return(
    //             <OpenGames gameArray= {this.props.openGames.gameTracker}/>
    //         )
    //     }
    // }

    logOut() {
        const socket = this.props.socketConnection;
        socket.emit('log_out')
    }

    render() {
        return (
            <div id="joinOrCreateGameContainer">
                <ul>
                    {this.playerList()}
                </ul>
                {/*<button id="create" className="joinButton" onClick={this.createButtonClicked}>Create Game</button>*/}
                {/*<button id="join" className="joinButton" onClick={this.joinButtonClicked} >Join Game</button>*/}
                <button id="log_out" className="joinButton" onClick={this.logOut}>Log Out</button>
            </div>
        )
    }
}

function mapStateToProps(state){
    return{
        player: state.playerInformation.playerObject,
        playerRoleObject: state.playerInformation.playerRoles,
        socketConnection: state.socketConnection.setConn,
        createButtonWasClicked: state.gameInformation.createButtonWasClicked,
        joinButtonWasClicked: state.gameInformation.joinButtonWasClicked,
        loggedInPlayers: state.playerInformation.playerArrays,
        openGames: state.gameInformation.gameArrays,
    }
}

export default connect(mapStateToProps, {setConn, playerInfo, createButton, playerRole, joinButton, makePlayerArrays, makeGameArrays,})(JoinGame)