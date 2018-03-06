import React, {Component} from 'react';
import {setConn, storePlayerMessages} from "../actions"
import {connect} from "react-redux";
import Game from './gameDisplay';
import './lobby.css';
import './ui.css';
import fetcher from './fetcher';

class OpenGames extends Component {
    constructor(props){
        super(props);

        this.state = {
            missionNames: '',
            gameTracker: '',
            displaySize: 'max',
            whichGameClicked: 0,
            previousHeight: 'min',
            previousMissionMaxOrMin: 'start',
            playerInfo: JSON.parse(sessionStorage.getItem('playerInfo')),
            joinButton: true,
            abortButton: false,
            createButton: true,
        };

        console.log('openGames state', this.state);

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

        //Any time the game tracker changes, this takes the game tracker and puts any game participated in for each user on top, then adds the game tracker to the local state
        socket.on('updateOpenGames', gameTracker => {
            console.log('game tracker', gameTracker);

            let missionNames = [];

            gameTracker.forEach((game, index) => {
                missionNames.push(game.mission);
                if(game.status === 'running') {
                    gameTracker.splice(index, 1)
                }
            });

            this.setState({missionNames: missionNames});

            console.log('before agentName: ', this.state);

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
                this.props.storePlayerMessages('');
            });
        });

        socket.on('removeAbortButton', () => {
            console.log('received remove abort button socket emit');
            this.setState({abortButton: false});
        });

    }

    componentWillUnmount() {
        const socket = this.props.socketConnection;

        socket.off('updateOpenGames');
    }

    createButtonClicked() {
        const socket = this.props.socketConnection;
        this.props.storePlayerMessages('You have been assigned to a mission. To be reassigned, you must abort this mission first');
            fetcher.get('create');
        this.setState({displaySize: 'max', createButton: false, joinButton: false, abortButton: true})
    }

    joinGameButtonClicked(gameClicked, gameID) {
        fetcher.get('join', gameID);

        this.setState({displaySize: 'max', joinButton: false, createButton: false, abortButton: true});

        this.props.storePlayerMessages('You have been assigned to a mission. To be reassigned, you must abort this mission first');
    }

    abortButtonClicked(gameClicked) {
        fetcher.get('abort');

        this.setState({displaySize: 'min', joinButton: true, createButton: true, abortButton: false});

        this.props.storePlayerMessages('');
    }

    togglePlayerRole(player, gameClicked) {
        fetcher.get('swap');

        if(player === 'player1') {
            this.setState({player1Ready: true})
        }
        else {
            this.setState({player2Ready: true})
        }
    }

    startButtonClicked(gameRoom, gameID){

        console.log('openGameState at start', this.state);

        const socket = this.props.socketConnection;

        fetcher.get('start', gameID).then((data)=>{
            if(data.status === 'start'){
                console.log('start');
                socket.emit('moveToGame', sessionStorage.getItem('jwt') );
            }
            if(data === 'start') {
                this.setState({abortButton: false});
            }
        });


    }

    changeDisplayHeight(index, mission) {

        if(this.state.previousMissionMaxOrMin !== mission  || this.state.previousMissionMaxOrMin === 'start') {
            if (this.state.previousHeight === 'min') {
                this.setState({
                    displaySize: 'max',
                    whichGameClicked: index,
                    previousMissionMaxOrMin: mission,
                    previousHeight: 'max'
                });
            }
            else if (this.state.previousHeight === 'max') {
                this.setState({
                    displaySize: 'max',
                    whichGameClicked: index,
                    previousMissionMaxOrMin: mission,
                    previousHeight: 'max'
                });
            }
        }
        else {
            if (this.state.displaySize === 'min') {
                this.setState({
                    displaySize: 'max',
                    whichGameClicked: index,
                    previousMissionMaxOrMin: mission,
                    previousHeight: 'max',
                });
            }
            else if (this.state.displaySize === 'max') {
                this.setState({
                    displaySize: 'min',
                    whichGameClicked: index,
                    previousMissionMaxOrMin: mission,
                    previousHeight: 'min',
                });
            }
        }

        console.log('state after display change', this.state);
    }

    gameList() {
        //If there are games in the game tracker
        if(this.state.gameTracker.length > 0){
            let gameArray = this.state.gameTracker;

            console.log('gameArray', gameArray);


            if (gameArray!== undefined) {
                return (
                    gameArray.map((item, index) => {
                        return (
                    
                            <li id={index} key={index}>
                                <p className={gameArray[index].player1.readyState && gameArray[index].player2.readyState && this.state.displaySize === 'max' &&  (this.state.playerInfo.agentName === gameArray[index].player1.agentName || this.state.playerInfo.agentName === gameArray[index].player2.agentName) && this.state.whichGameClicked === index ? 'lobbyButton' : 'hide'} onClick={() => {this.startButtonClicked(gameArray[index], gameArray[index].gameID)}}>Start Mission</p>
                                <p id='join' className={this.state.joinButton && (gameArray[index].player2.agentName === undefined || gameArray[index].player2.agentName === "")  ? "lobbyButton" : "hide"} onClick={()=> {this.joinGameButtonClicked(gameArray[index].mission, gameArray[index].gameID)}}>Join Mission</p>
                                <p id='abort' className= {this.state.abortButton && (gameArray[index].player1.agentName === this.state.playerInfo.agentName || gameArray[index].player2.agentName === this.state.playerInfo.agentName) ? "lobbyButton" : "hide"} onClick={()=>{this.abortButtonClicked(gameArray[index].mission)}}>Abort Mission</p>
                                <i id="game_display_arrow" className="small material-icons" onClick = {() => {this.changeDisplayHeight(index, gameArray[index].mission)}}>
                                    {this.state.displaySize === 'min' || !(this.state.whichGameClicked === index) ? 'arrow_drop_down' : 'arrow_drop_up'}</i>

                                <Game gameIndex={index}
                                      missionName={gameArray[index].mission}
                                      player1={gameArray[index].player1.agentName}
                                      player1Role = {gameArray[index].player1.role}
                                      player1Ready = {gameArray[index].player1.ready}
                                      player2={gameArray[index].player2.agentName}
                                      player2Role = {gameArray[index].player2.role}
                                      player2Ready = {gameArray[index].player2.ready}
                                      thisPlayer={this.state.playerInfo.agentName}
                                      displayHeight = {this.state.whichGameClicked === index ?  this.state.displaySize : 'min'}
                                      gameID = {gameArray[index].gameID}
                                />
                                <div className={this.state.displaySize === 'max' && this.state.whichGameClicked === index ? "roleSwitch" : "hide"} style={gameArray[index].player1.agentName === this.state.playerInfo.agentName ? {pointerEvents: 'auto'} : {pointerEvents: 'none'}} >
                                    <p>H</p>
                                    <label className={this.state.displaySize === 'max' && this.state.whichGameClicked === index ? "switch" : "hide"} style={gameArray[index].player1.agentName === this.state.playerInfo.agentName ? {pointerEvents: 'auto'} : {pointerEvents: 'none'}} >
                                        <input id='first_switch_check' className="first_switch" type="checkbox" checked={gameArray[index].player1.role === 'Handler' ? false : true} onClick = {() => {this.togglePlayerRole('player1', gameArray[index].mission)}}/>
                                        <span className="slider"> </span>
                                    </label>
                                    <p>A</p>
                                </div>
                                <div  className={this.state.displaySize === 'max' && this.state.whichGameClicked === index ? "roleSwitch" : "hide"} style={gameArray[index].player2.agentName === this.state.playerInfo.agentName ? {pointerEvents: 'auto'} : {pointerEvents: 'none'}}>
                                    <p>H</p>
                                    <label  className={this.state.displaySize === 'max' && this.state.whichGameClicked === index ? "switch" : "hide"} style={ gameArray[index].player2.agentName === this.state.playerInfo.agentName ? {pointerEvents: 'auto'} : {pointerEvents: 'none'}}>
                                        <input id='second_switch_check' className="second_switch" type="checkbox"  checked={gameArray[index].player2.role === 'Handler' ? false : true} onClick = {() => {this.togglePlayerRole('player2', gameArray[index].mission)}}/>
                                        <span className="slider"> </span>
                                    </label>
                                    <p>A</p>
                                </div>

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
            <div>
                <p className= {gameArray.length >= 3 ? "scrollMessage" : "hide"} >Scroll down</p>
                <button id="create" className={this.state.createButton ? "lobbyButton" : "hide"} onClick={this.createButtonClicked}>Create Game</button>
                <ul>
                    {this.gameList()}
                </ul>
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
