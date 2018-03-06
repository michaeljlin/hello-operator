import React, {Component} from 'react';
import './lobby.css';
import './login.css';
import {connect} from 'react-redux';
import {setConn, playerInfo, createButton, playerRole, joinButton, makePlayerArrays, makeGameArrays, storePlayerMessages, playerLoggedOut} from "../actions";
import Player from './player';

class JoinGame extends Component {
    constructor(props) {
        super(props);

        this.state = {
            playerTracker: [],
            playerLoggedOut: false,
        };
    }

    componentDidMount() {
        const socket = this.props.socketConnection;
        console.log('player socket', socket);

        socket.on('updatePlayerList', playerTracker => {
            console.log('updatePlayerList PlayerTracker', playerTracker);
            this.setState({
                playerTracker: playerTracker
            })
        });
    }

    playerList() {
        //Sorts the player agent names in alphabetical order
        if(this.state.playerTracker !== []){
            console.log('playerTracker', this.state.playerTracker);
            let playerArray = (this.state.playerTracker).sort((a,b) => {
                if(a.agentName < b.agentName){
                    return -1
                }
                if(a.agentName > b.agentName){
                    return 1
                }
                return 0
            });

            if(playerArray !== []) {
                console.log('playerArray', playerArray);
                return(
                    playerArray.map((item, index) => {

                        if(playerArray[index].gameActiveStatus === false){
                            return(
                                <li key={index}>
                                    <Player userName={playerArray[index].userName} picture={playerArray[index].profilePic} agentName={playerArray[index].agentName} display="true"/>
                                </li>
                            )
                        }
                    })
                )
            }
        }
    }

    render() {

        let playerArray = this.state.playerTracker;

        return (
            <div>
                <i className= {playerArray.length >= 3 ? "scrollMessage" : "hide"} style={{left: '43%'}}>Scroll Down</i>
                <ul>
                    {this.playerList()}
                </ul>
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
        playerLog: state.playerInformation.playerLogStatus,
    }
}

export default connect(mapStateToProps, {setConn, playerInfo, createButton, playerRole, joinButton, makePlayerArrays, makeGameArrays, storePlayerMessages, playerLoggedOut})(JoinGame)