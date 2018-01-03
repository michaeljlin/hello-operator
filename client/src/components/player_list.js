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
        //Sorts the player agent names in alphabetical order
        let playerArray = (this.props.loggedInPlayers.playerTracker).sort((a,b) => {
             if(a.agentName < b.agentName){
                return -1
             }
             if(a.agentName > b.agentName){
                return 1
             }
             return 0
        });

        console.log('playerArray', this.props.loggedInPlayers.playerTracker);

        if(playerArray !== undefined) {
            return(
                playerArray.map((item, index) => {
                    return(
                        <li key={index}>
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

        let playerArray = this.props.loggedInPlayers.playerTracker;

        return (
            <div id="joinOrCreateGameContainer">
                <ul>
                    {this.playerList()}
                </ul>
                {/*Only show the arrow to indicate scrolling when the array is long enough to need scrolling*/}
                <i id="joinOrCreateArrow" className= {playerArray.length >= 6 ? "material-icons" : "hide"} >arrow_drop_down</i>
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