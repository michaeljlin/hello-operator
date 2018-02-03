import React, {Component} from 'react';
import {setConn, playerInfo, gameInfo, createButton, playerRole, joinButton, modalActions, makeGameArrays, storePlayerMessages, playerLoggedOut} from "../actions"
import {connect} from "react-redux";
import Game from './gameDisplay';
import CreateModal from './createModal';
import './lobby.css';
import './ui.css';
import decode from 'jwt-decode';

class OpenGames extends Component {
    constructor(props){
        super(props);

        this.state = {
            missionNames: '',
            gameTracker: '',
            displaySize: '8vh',
            whichGameClicked: 0,
            previousHeight: '8vh',
            playerInfo: JSON.parse(sessionStorage.getItem('playerInfo')),
            joinButton: true,
            abortButton: false,
            createButton: true,
        };

        this.createButtonClicked = this.createButtonClicked.bind(this);
        this.changeDisplayHeight = this.changeDisplayHeight.bind(this);
        this.joinGameButtonClicked = this.joinGameButtonClicked.bind(this);
        this.abortButtonClicked = this.abortButtonClicked.bind(this);

        const socket = this.props.socketConnection;

        socket.emit('getGameTracker');
    }

    componentDidMount(){
        // if(this.props.playerLog === false) {
        const socket = this.props.socketConnection;

        
        // socket.on('playerJoinedSoRemoveCreate', () => {
        //     document.getElementById('create').classList.add('hide');
        // });

        // socket.on('addCreateButton', () => {
        //     document.getElementById('create').classList.remove('hide');
        // });

        //     this.props.playerLoggedOut(false)
        // }

        //Any time the game tracker changes, this takes the game tracker and puts created or joined games for each user on top, then adds the game tracker to the local state
        socket.on('receiveGameTracker', gameTracker => {
            console.log('game tracker', gameTracker);

            let missionNames = [];

            gameTracker.forEach((game) => {
                missionNames.push(game.mission);
            });

            this.setState({missionNames: missionNames});

            const playerAgentName = this.state.playerInfo.agentName;

            //Find the game that the player is currently in (if any)
            let gameThisPlayerIsInIndex = gameTracker.findIndex((game)=> {
                return (game.player1.agentName === playerAgentName) || (game.player2.agentName === playerAgentName)
            });


            if(gameThisPlayerIsInIndex === -1){
                this.setState({
                    gameTracker: gameTracker
                })
            }
            else  {
                const game = gameTracker[gameThisPlayerIsInIndex];
                gameTracker.splice(gameThisPlayerIsInIndex, 1);
                gameTracker.unshift(game);

                console.log('game tracker after moving current game', gameTracker);
                this.setState({
                    //So most recent games comes first
                    gameTracker: gameTracker
                })
            }
        });

    }

    componentWillUnmount() {
        const socket = this.props.socketConnection;

        socket.off('receiveGameTracker');
    }

    createButtonClicked() {
        //Causes the create button to disappear so each player can only make one game at a time
        document.getElementById('create').classList.add('hide');

        const socket = this.props.socketConnection;
        const playerId = this.props.socketConnection.id;
        const playerUsername = this.props.player.userName;
        const playerAgentName = this.props.player.agentName;

       
        socket.emit('updateGameTracker', 'create', this.state.playerInfo, null);
        

        this.props.createButton('true');

        this.props.storePlayerMessages('You have been assigned to a mission. To be reassigned, you must abort this mission first');

        this.setState({displaySize: '20vh', createButton: false, joinButton: false, abortButton: true})
        
        console.log('this.state', this.state)
    }

    joinGameButtonClicked(gameClicked) {
        let gameIndex = this.state.gameTracker.findIndex((game) => {
            return game.mission === gameClicked
        });

        const socket = this.props.socketConnection;
        socket.emit('updateGameTracker', 'join', this.state.playerInfo, gameIndex)
        this.setState({displaySize: '20vh', joinButton: false, createButton: false, abortButton: true})
    }

    abortButtonClicked(gameClicked) {
        let gameIndex = this.state.missionNames.findIndex((mission) => {
            return mission === gameClicked
        });

        const socket = this.props.socketConnection;
        socket.emit('updateGameTracker', 'abort', this.state.playerInfo, gameIndex)
        this.setState({displaySize: '8vh', joinButton: true, createButton: true, abortButton: false})
    }

    changeDisplayHeight(index) {
        if (this.state.displaySize === '8vh') {
            this.setState({
                displaySize: '20vh',
                whichGameClicked: index,
            });
            // return '20vh'
        }
        else if (this.state.displaySize === '20vh') {
            this.setState({
                displaySize: '8vh',
                whichGameClicked: index,
            });
            // return '8vh'
        }
    }

    gameList() {

        // if(this.props.playerLog === false) {
        //If there are games in the game tracker
        if(this.state.gameTracker.length > 0){
            let gameArray = this.state.gameTracker.reverse();

            // let spymasterInfo = () => {
            //     return this.props.playerRoleObject.spymaster.agentName
            // };

            // let allPlayer1 = [];
            // let allPlayer2 = [];

            // if (gameArray !== "") {
            //     gameArray.forEach((game) => {
            //         allPlayer1.push(game.player1.agentName);
            //         allPlayer2.push(game.player2.agentName);
            //     });
            // }

            console.log('gameArray', gameArray);


            if (gameArray!== undefined) {
                return (
                    gameArray.reverse().map((item, index) => {
                        return (
                    
                            <li id={index} key={index}>
                                <Game gameIndex={index} 
                                      missionName={gameArray[index].mission}
                                      gameID={gameArray[index].gameID}
                                    //   joinButton={gameArray[index].joinButton}
                                    //   abortButton={gameArray[index].abortButton}
                                      player1={gameArray[index].player1.agentName}
                                      player2={gameArray[index].player2.agentName}
                                      thisPlayer={this.state.playerInfo.agentName}
                                      connId={this.state.playerInfo.socketId}
                                      display="true"
                                    //   allPlayer1={allPlayer1}
                                    //   allPlayer2={allPlayer2}
                                      history={this.props.history}
                                      displayHeight = {this.state.whichGameClicked === index ?  this.state.displaySize : '8vh'}
                                />
                                <i id="game_display_arrow" className="small material-icons" onClick = {() => {this.changeDisplayHeight(index, this.state.displaySize)}} style={this.state.displaySize === '20vh' && this.state.whichGameClicked === index ? {bottom: '20vh'} : null}>
                                {this.state.displaySize === '8vh' || !(this.state.whichGameClicked === index) ? 'arrow_drop_down' : 'arrow_drop_up'}</i>
                                <button id='join' className={this.state.joinButton && gameArray[index].player2.agentName === ""  ? "lobbyButton" : "hide"} onClick={()=> {this.joinGameButtonClicked(gameArray[index].mission)}} style={this.state.displaySize === '20vh' && this.state.whichGameClicked === index ? {top: '-19vh'} : null}>Join Mission</button>
                                <button id='abort' className= {this.state.abortButton && (gameArray[index].player1.agentName === this.state.playerInfo.agentName || gameArray[index].player2.agentName === this.state.playerInfo.agentName) ? "lobbyButton" : "hide"} onClick={()=>{this.abortButtonClicked(gameArray[index].mission)}}>Abort Mission</button>
                            </li>
                        )
                    
                    })
                )
            }
        //If there are no open games
            else {
                return (
                    <p style={{color: 'white'}}>There are no open missions right now, go ahead and make one</p>
                )
            }
        }
    }


    render() {
        // const gameName = this.props.openGames.place;
        // const player = this.props.player.agentName;
        let gameArray = this.state.gameTracker;

        return (
            <div style={{height: '100%'}} >
                <button id="create" className={this.state.createButton ? "lobbyButton" : "hide"} onClick={this.createButtonClicked}>Create Game</button>
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
