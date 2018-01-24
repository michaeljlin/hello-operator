import React, {Component} from 'react';
import {setConn, playerInfo, gameInfo, createButton, playerRole, joinButton, modalActions, makeGameArrays, storePlayerMessages, playerLoggedOut} from "../actions"
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
        // if(this.props.playerLog === false) {
            const socket = this.props.socketConnection;

            socket.on('updateOpenGames', gameTracker => {
                console.log('game tracker', gameTracker);
                // this.props.makeGameArrays(gameTracker)
                this.setState({
                    gameTracker: gameTracker
                })
            });

            socket.on('playerJoinedSoRemoveCreate', () => {
                document.getElementById('create').classList.add('hide');
            });

            socket.on('addCreateButton', () => {
                document.getElementById('create').classList.remove('hide');
            });

        //     this.props.playerLoggedOut(false)
        // }
    }

    componentWillUnmount() {
        const socket = this.props.socketConnection;

        socket.removeListener('updateOpenGames', gameTracker => {
            this.setState({
                gameTracker: gameTracker
            })
        });

        socket.removeListener('updateOpenGames', gameTracker => {
            console.log('game tracker', gameTracker);
            // this.props.makeGameArrays(gameTracker)
            this.setState({
                //Array is reversed so the list still displays games from newest to oldest in render
                gameTracker: gameTracker.reverse()
            })
        });

        // socket.close();
    }


    createButtonClicked() {
        // if(this.props.playerLog === false) {
            //Causes the create button to disappear so each player can only make one game at a time
            document.getElementById('create').classList.add('hide');

            const socket = this.props.socketConnection;
            const playerId = this.props.socketConnection.id;
            const playerUsername = this.props.player.userName;
            const playerAgentName = this.props.player.agentName;

            this.props.playerRole('spymaster', playerAgentName, playerId);

            console.log('current props', this.props);

            if (playerId && playerUsername && playerAgentName !== undefined) {
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
        // }
    }

    gameList() {

        // if(this.props.playerLog === false) {
            //If there are games in the game tracker
            if(this.state.gameTracker.length > 0){
                let gameArray = this.state.gameTracker;

                let spymasterInfo = () => {
                    return this.props.playerRoleObject.spymaster.agentName
                };

                let allPlayer1 = [];
                let allPlayer2 = [];

                if (gameArray !== "") {
                    gameArray.forEach((game) => {
                        allPlayer1.push(game.player1.agentName);
                        allPlayer2.push(game.player2.agentName);
                    });
                }

                console.log('all player 1 and 2', allPlayer1, allPlayer2);

                console.log('gameArray', gameArray);


                if (gameArray && spymasterInfo !== undefined) {
                    return (
                        //Array order is reversed to show newest games first
                        gameArray.reverse().map((item, index) => {
                            return (
                                <li id={index} key={index}>
                                    <Game gameIndex={index} missionName={gameArray[index].mission}
                                          gameID={gameArray[index].gameID}
                                          joinButton={gameArray[index].joinButton}
                                          abortButton={gameArray[index].abortButton}
                                          player1={gameArray[index].player1}
                                          player2={gameArray[index].player2}
                                          thisPlayer={gameArray[index].thisPlayer}
                                          connId={gameArray[index].player1.connId}
                                          display="true"
                                          allPlayer1={allPlayer1}
                                          allPlayer2={allPlayer2}
                                          history={this.props.history}
                                    />
                                </li>
                            )
                        })
                    )
                }
            }
            //If there are no open games
            else {
                return (
                    <p style={{color: 'white'}}>There are no open missions right now, go ahead and make one</p>
                )
            }

        // }
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
        // playerLog: state.playerInformation.playerLogStatus,

    }
}

export default connect(mapStateToProps, {setConn, playerInfo, gameInfo, createButton, playerRole, joinButton, modalActions, makeGameArrays, storePlayerMessages, playerLoggedOut})(OpenGames)
