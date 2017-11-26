import React, {Component} from 'react';
import {setConn, playerInfo, gameInfo, createButton, playerRole, joinButton, modalActions} from "../actions"
import {connect} from "react-redux";
import CreateModal from './createModal';

class OpenGames extends Component {
    constructor(props){
        super(props);
        this.joinButtonClicked = this.joinButtonClicked.bind(this);
        this.testStartButtonClicked = this.testStartButtonClicked.bind(this);
    }

    componentDidMount(){
        const socket = this.props.socketConnection;
        socket.on('updateOpenGames', gameInfo => {
            return this.props.gameInfo(gameInfo)
        });

    }

    joinButtonClicked(event) {
        const eventId = event.target.id;
        const playerId = this.props.socketConnection.id;
        // this.props.socketConnection.emit('join_button_pressed', eventId, playerId);
        if(this.props.createButtonWasClicked === 'false'){
            this.props.playerRole('spy');
            console.log('Agent is now the spy')
        }
        this.props.joinButton(true);
        this.props.modalActions('block', 'none')
    }

    testStartButtonClicked(event) {
        const eventId = event.target.id;
        const playerId = this.props.socketConnection.id;
        // this.props.socketConnection.emit('join_button_pressed', eventId, playerId);
            this.props.playerRole('spymaster');
            console.log('Agent is now the spymaster');
        this.props.joinButton(true);
        this.props.modalActions('block', 'none')
    }

    render(){
        const gameName = this.props.openGame.place;
        const player = this.props.player.agentName;


        if(this.props.createButtonWasClicked === 'true'){
            return(
                //When dummy player is removed, take out the top div
                <div >
                    <div className="openGamePlayerContainer">
                        <p id="username">Mission {gameName}</p>
                        <p id="username_2"> Agent {player}</p>
                        <button id="join" className="joinButton" onClick={this.testStartButtonClicked} >Start Game(Testing feature)</button>
                    </div>
                    <div className="openGamePlayerContainer" style={{top: '10vh'}}>
                        <p id="username">Mission Vicious Volcano</p>
                        <p id="username_2"> Agent Foolish Ostrich</p>
                        <CreateModal parent="open_game"/>
                        <button id="join" className="joinButton" onClick={this.joinButtonClicked} >Join Game</button>
                    </div>

                </div>
            )
        }
        else {
            return (
                <div className="openGamePlayerContainer" style={{top: '10vh'}}>
                    <p id="username">Mission Vicious Volcano</p>
                    <p id="username_2"> Agent Foolish Ostrich</p>
                    <CreateModal parent="open_game"/>
                    <button id="join" className="joinButton" onClick={this.joinButtonClicked} >Join Game</button>
                </div>
            )
        }
    }
}

function mapStateToProps(state){
    return{
        socketConnection: state.socketConnection.setConn,
        player: state.playerInformation.playerObject,
        openGame: state.gameInformation.gameObject,
        createButtonWasClicked: state.gameInformation.createButtonWasClicked,
        joinButtonWasClicked: state.gameInformation.joinButtonWasClicked,
        playerRole: state.playerInformation.playerRole,
        modalDisplay: state.userInterface.modalActions,
    }
}

export default connect(mapStateToProps, {setConn, playerInfo, gameInfo, createButton, playerRole, joinButton, modalActions})(OpenGames)
