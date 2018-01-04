import React, {Component} from 'react';
import {setConn, playerInfo, gameInfo, createButton, playerRole, joinButton, modalActions, makeGameArrays, storePlayerMessages} from "../actions"
import {connect} from "react-redux";
import Game from './gameDisplay';
import CreateModal from './createModal';
import './lobby.css';

class OpenGames extends Component {
    constructor(props){
        super(props);

        this.state = {
            gameTracker: ''
        };

        this.createButtonClicked = this.createButtonClicked.bind(this);
    }

    componentDidMount(){
        const socket = this.props.socketConnection;

        socket.on('updateOpenGames', gameTracker => {
            console.log('game tracker', gameTracker);
            // this.props.makeGameArrays(gameTracker)
            this.setState({
                gameTracker: gameTracker
            })
        });

        socket.on ('playerJoinedSoRemoveCreate', () => {
            document.getElementById('create').classList.add('hide');
        });

        socket.on('addCreateButton', () => {
            document.getElementById('create').classList.remove('hide');
        })
    }


    createButtonClicked() {
        //Causes the create button to disappear so each player can only make one game at a time
        document.getElementById('create').classList.add('hide');

        const socket = this.props.socketConnection;
        const playerId = this.props.socketConnection.id;
        const playerUsername = this.props.player.userName;
        const playerAgentName = this.props.player.agentName;

        this.props.playerRole('spymaster', playerAgentName, playerId);

        console.log('current props', this.props);
   
        if(playerId && playerUsername && playerAgentName !== undefined){
            socket.emit('create_button_pressed', playerId, playerUsername, playerAgentName);
        }

        this.props.createButton('true');

        socket.on('updateOpenGames', gameTracker => {
            console.log('game tracker', gameTracker);
            // this.props.makeGameArrays(gameTracker)
            this.setState({
                //Array is reversed so the list still displays games from newest to oldest in render
                gameTracker: gameTracker.reverse()
            })
        });

        this.props.storePlayerMessages('You have been assigned to a mission. To be reassigned, you must abort this mission first');
    }

    gameList() {

        // let gameArray = [];
        //
        // if(this.state.gameTracker !== ""){
        //     gameArray = (this.state.gameTracker).reverse();
        // }
        let gameArray = this.state.gameTracker;

        let spymasterInfo = () => {
            //If there are no open games in the gametracker, the player role object is an empty object, as such, the spymaster agent name cannot be found and an error is thrown. The agent name can only be retrieved if first the spymaster info exists in the object
            if (this.props.playerRoleObject.spymaster !== undefined) {
                return this.props.playerRoleObject.spymaster.agentName
            }
        };

        let allPlayer1 = [];
        let allPlayer2 = [];

        if(gameArray !== ""){
            gameArray.forEach((game) => {
                allPlayer1.push(game.player1.agentName);
                allPlayer2.push(game.player2.agentName);
            });
        }

        console.log('all player 1 and 2', allPlayer1, allPlayer2);

        console.log('gameArray', gameArray);


        if(gameArray && spymasterInfo!== undefined) {
                return(
                    //Array order is reversed to show newest games first
                    gameArray.reverse().map((item, index) => {
                        return(
                            <li id={index} key={index}>
                                <Game gameIndex={index} missionName={gameArray[index].mission} joinButton={gameArray[index].joinButton} abortButton={gameArray[index].abortButton} player1={gameArray[index].player1} player2={gameArray[index].player2} thisPlayer={gameArray[index].thisPlayer} connId={gameArray[index].player1.connId} display="true" allPlayer1={allPlayer1} allPlayer2={allPlayer2} />
                            </li>
                        )
                    })
                )
        }
    }


    render() {
        // const gameName = this.props.openGames.place;
        // const player = this.props.player.agentName;
        let gameArray = this.state.gameTracker;

        return (
            <div style={{height: '100%'}} >
                <button id="create" className="joinButton" onClick={this.createButtonClicked}>Create Game</button>
                <ul>
                    {this.gameList()}
                </ul>
                <i id="openGamesArrow" className= {gameArray.length >= 6 ? "material-icons" : "hide"} >arrow_drop_down</i>
            </div>
        )
    }
}

function mapStateToProps(state){
    return{
        socketConnection: state.socketConnection.setConn,
        player: state.playerInformation.playerObject,
        openGames: state.gameInformation.gameObject,
        createButtonWasClicked: state.gameInformation.createButtonWasClicked,
        joinButtonWasClicked: state.gameInformation.joinButtonWasClicked,
        playerRoleObject: state.playerInformation.playerRoles,
        modalDisplay: state.userInterface.modalActions,
        // openGames: state.gameInformation.gameArrays,
    }
}

export default connect(mapStateToProps, {setConn, playerInfo, gameInfo, createButton, playerRole, joinButton, modalActions, makeGameArrays, storePlayerMessages})(OpenGames)
