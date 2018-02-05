import React, {Component} from 'react';
import {setConn, storePlayerMessages} from "../actions"
import {connect} from "react-redux";
import Game from './gameDisplay';
import CreateModal from './createModal';
import './lobby.css';
import './ui.css';
import decode from 'jwt-decode';
import domain from "../../domain";
import fetcher from './fetcher';

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
        this.togglePlayerRole = this.togglePlayerRole.bind(this);
        this.startButtonClicked = this.startButtonClicked.bind(this);

        const socket = this.props.socketConnection;

        socket.emit('getGameTracker');
    }

    componentDidMount(){
        const socket = this.props.socketConnection;

        //Any time the game tracker changes, this takes the game tracker and puts created or joined games for each user on top, then adds the game tracker to the local state
        socket.on('updateOpenGames', gameTracker => {
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
                    gameTracker: gameTracker
                })
            }

            socket.on('redirectToGame', () => {
                this.props.history.push('/game');
            });
        });

    }

    componentWillUnmount() {
        const socket = this.props.socketConnection;

        socket.off('updateOpenGames');
    }

    createButtonClicked() {
        const socket = this.props.socketConnection;
        // socket.emit('updateGameTracker', 'create', this.state.playerInfo, null);

        this.props.storePlayerMessages('You have been assigned to a mission. To be reassigned, you must abort this mission first');
            fetcher.get('create');

            // let token = sessionStorage.getItem('jwt');
            //
            // fetch('http://'+domain+'8000/api/game/create',{
            //     method: 'POST',
            //     // mode: 'no-cors', // Only enable this for local debugging purposes
            //     body: JSON.stringify({token: token}),
            //     headers: new Headers({
            //         'Content-Type': 'application/json',
            //         'Authorization': 'JWT '+token
            //     })
            // }).catch((error)=>{
            //     console.error('Create game error: ', error);
            // }).then((response)=>{
            //     console.log('got response from authentication: ', response);
            //     return response.json();
            // }).then((data)=>{
            //     console.log('data says: ', data);
            //
            //     sessionStorage.clear();
            //     sessionStorage.setItem('jwt', data.token);
            // });

        this.setState({displaySize: '20vh', createButton: false, joinButton: false, abortButton: true})
    }

    joinGameButtonClicked(gameClicked, gameID) {
        // let gameIndex = this.state.gameTracker.findIndex((game) => {
        //     return game.mission === gameClicked
        // });

        // const socket = this.props.socketConnection;
        // socket.emit('updateGameTracker', 'join', this.state.playerInfo, gameIndex)

        fetcher.get('join', gameID);

        this.setState({displaySize: '20vh', joinButton: false, createButton: false, abortButton: true})
    }

    abortButtonClicked(gameClicked) {
        // let gameIndex = this.state.missionNames.findIndex((mission) => {
        //     return mission === gameClicked
        // });

        // const socket = this.props.socketConnection;
        // socket.emit('updateGameTracker', 'abort', this.state.playerInfo, gameIndex)

        fetcher.get('abort');

        this.setState({displaySize: '8vh', joinButton: true, createButton: true, abortButton: false})
    }

    togglePlayerRole(player, gameClicked) {
        // let gameIndex = this.state.missionNames.findIndex((mission) => {
        //     return mission === gameClicked
        // });

        // const socket = this.props.socketConnection;
        // socket.emit('updateGameTracker', 'toggleRole', this.state.playerInfo, gameIndex)

        fetcher.get('swap');

        if(player === 'player1') {
            this.setState({player1Ready: true})
        }
        else {
            this.setState({player2Ready: true})
        }
    }

    startButtonClicked(gameClicked){
        let gameIndex = this.state.missionNames.findIndex((mission) => {
            return mission === gameClicked
        });

        const socket = this.props.socketConnection;
        let playerConnId = this.state.playerInfo.socketId;
        let thisGameID = this.state.gameTracker[gameIndex].gameID;
        socket.emit('startGame', playerConnId, thisGameID);
    }

    changeDisplayHeight(index) {
        if (this.state.displaySize === '8vh') {
            this.setState({
                displaySize: '20vh',
                whichGameClicked: index,
            });
        }
        else if (this.state.displaySize === '20vh') {
            this.setState({
                displaySize: '8vh',
                whichGameClicked: index,
            });
        }
    }

    gameList() {
        //If there are games in the game tracker
        if(this.state.gameTracker.length > 0){
            let gameArray = this.state.gameTracker.reverse();

            console.log('gameArray', gameArray);


            if (gameArray!== undefined) {
                return (
                    gameArray.reverse().map((item, index) => {
                        return (
                    
                            <li id={index} key={index}>
                                <Game gameIndex={index} 
                                      missionName={gameArray[index].mission}
                                      player1={gameArray[index].player1.agentName}
                                      player1Role = {gameArray[index].player1.role}
                                      player1Ready = {gameArray[index].player1.ready}
                                      player2={gameArray[index].player2.agentName}
                                      player2Role = {gameArray[index].player2.role}
                                      player2Ready = {gameArray[index].player2.ready}
                                      thisPlayer={this.state.playerInfo.agentName}
                                      displayHeight = {this.state.whichGameClicked === index ?  this.state.displaySize : '8vh'}
                                      gameID = {gameArray[index].gameID}
                                />
                                <i id="game_display_arrow" className="small material-icons" onClick = {() => {this.changeDisplayHeight(index, this.state.displaySize)}} style={this.state.displaySize === '20vh' && this.state.whichGameClicked === index ? {bottom: '20vh'} : null}>
                                {this.state.displaySize === '8vh' || !(this.state.whichGameClicked === index) ? 'arrow_drop_down' : 'arrow_drop_up'}</i>

                                <button id='join' className={this.state.joinButton && (gameArray[index].player2.agentName === undefined || gameArray[index].player2.agentName === "")  ? "lobbyButton" : "hide"} onClick={()=> {this.joinGameButtonClicked(gameArray[index].mission, gameArray[index].gameID)}} style={this.state.displaySize === '20vh' && this.state.whichGameClicked === index ? {top: '-19vh'} : null}>Join Mission</button>

                                <button id='abort' className= {this.state.abortButton && (gameArray[index].player1.agentName === this.state.playerInfo.agentName || gameArray[index].player2.agentName === this.state.playerInfo.agentName) ? "lobbyButton" : "hide"} onClick={()=>{this.abortButtonClicked(gameArray[index].mission)}}>Abort Mission</button>

                                <label className={this.state.displaySize === '20vh' && this.state.whichGameClicked === index ? "switch" : "hide"} style={gameArray[index].player1.agentName === this.state.playerInfo.agentName ? {top: '-13vh', left: '28vh'} : {pointerEvents: 'none', top: '-13vh', left: '28vh'}} >
                                    <input id='first_switch_check' className="first_switch" type="checkbox" checked={gameArray[index].player1.role === 'Handler' ? false : true} onClick = {() => {this.togglePlayerRole('player1', gameArray[index].mission)}}/>
                                    <span className="slider round"> </span>
                                </label>

                                <label  className={this.state.displaySize === '20vh' && this.state.whichGameClicked === index ? "switch" : "hide"} style={ gameArray[index].player2.agentName === this.state.playerInfo.agentName ? {top: '-7vh', left: '10vw'} : {pointerEvents: 'none', top: '-7vh', left: '10vw'}}>
                                    <input id='second_switch_check' className="second_switch" type="checkbox"  checked={gameArray[index].player2.role === 'Handler' ? false : true} onClick = {() => {this.togglePlayerRole('player2', gameArray[index].mission)}}/>
                                    <span className="slider round"> </span>
                                </label>

                                 <p className={gameArray[index].player1.readyState && gameArray[index].player2.readyState && this.state.displaySize === '20vh' &&  this.state.whichGameClicked === index ? 'start' : 'hide'} onClick={() => {this.startButtonClicked(gameArray[index].mission)}}>Start Mission</p>;

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

    }
}

export default connect(mapStateToProps, {setConn, storePlayerMessages})(OpenGames)
