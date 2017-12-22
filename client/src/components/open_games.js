import React, {Component} from 'react';
import {setConn, playerInfo, gameInfo, createButton, playerRole, joinButton, modalActions, makeGameArrays} from "../actions"
import {connect} from "react-redux";
import Game from './gameDisplay';
import CreateModal from './createModal';
import './lobby.css';

class OpenGames extends Component {
    constructor(props){
        super(props);

        // this.joinButtonClicked = this.joinButtonClicked.bind(this);
        // this.testStartButtonClicked = this.testStartButtonClicked.bind(this);
        this.createButtonClicked = this.createButtonClicked.bind(this);
    }

    // componentDidMount(){
    //     const socket = this.props.socketConnection;
    //     socket.on('updateOpenGames', gameTracker => {
    //         console.log('game tracker', gameTracker);
    //         this.props.makeGameArrays(gameTracker);
    //         this.setState({
    //             updateComponent: 'yes'
    //         })
    //     });
    // }



    // joinButtonClicked(event) {
        // const eventId = event.target.id;
        // const playerId = this.props.socketConnection.id;
        // // this.props.socketConnection.emit('join_button_pressed', eventId, playerId);
        // if(this.props.createButtonWasClicked === 'false'){
        //     this.props.playerRole('spy');
        //     console.log('Agent is now the spy')
        // }
        // this.props.joinButton(true);
        // this.props.modalActions('block', 'none')
    // }

    // testStartButtonClicked(event) {
    //     const eventId = event.target.id;
    //     const playerId = this.props.socketConnection.id;
    //     // this.props.socketConnection.emit('join_button_pressed', eventId, playerId);
    //         this.props.playerRole('spymaster');
    //         console.log('Agent is now the spymaster');
    //     this.props.joinButton(true);
    //     this.props.modalActions('block', 'none')
    // }

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
            this.props.makeGameArrays(gameTracker)
        });

        // //Only load the game component when all of the information about the open games and player roles have been defined
        // console.log('current props again', this.props);
        // if(this.props.openGames.gameTracker && this.props.playerRoleObject.spymaster !== undefined){
        //     return(
        //         <OpenGames gameArray= {this.props.openGames.gameTracker}/>
        //     )
        // }
    }




    gameList() {

        let gameArray = this.props.gameArray;

        let spymasterInfo = () => {
            //If there are no open games in the gametracker, the player role object is an empty object, as such, the spymaster agent name cannot be found and an error is thrown. The agent name can only be retrieved if first the spymaster info exists in the object
            if (this.props.playerRoleObject.spymaster !== undefined) {
                return this.props.playerRoleObject.spymaster.agentName
            }
        };

        console.log('gameArray', gameArray);


        if(gameArray && spymasterInfo!== undefined) {
                return(
                    gameArray.map((item, index) => {
                        return(
                            <li id={index} key={index}>
                                <Game missionName={gameArray[index].missionName} userName={gameArray[index].playerUserNames[0]} agentName={gameArray[index].playerAgentNames[0]} connId={gameArray[index].playerConnIds[0]} display="true"/>
                            </li>
                        )
                    })
                )
        }
    }


    render() {
        const gameName = this.props.openGames.place;
        const player = this.props.player.agentName;

        return (
            <div style={{height: '100%'}} >
                <button id="create" className="joinButton" onClick={this.createButtonClicked}>Create Game</button>
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
        player: state.playerInformation.playerObject,
        openGames: state.gameInformation.gameObject,
        createButtonWasClicked: state.gameInformation.createButtonWasClicked,
        joinButtonWasClicked: state.gameInformation.joinButtonWasClicked,
        playerRoleObject: state.playerInformation.playerRoles,
        modalDisplay: state.userInterface.modalActions,
        // openGames: state.gameInformation.gameArrays,
    }
}

export default connect(mapStateToProps, {setConn, playerInfo, gameInfo, createButton, playerRole, joinButton, modalActions, makeGameArrays})(OpenGames)
