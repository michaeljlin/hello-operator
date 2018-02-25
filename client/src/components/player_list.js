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
            // playerTracker: this.props.loggedInPlayers.playerTracker,
            playerTracker: [],
            playerLoggedOut: false,
        };



        // this.logOut = this.logOut.bind(this);

        // const socket = this.props.socketConnection;
        //
        // socket.on('updatePlayerList', playerTracker => {
        //     // this.props.makePlayerArrays(playerTracker)
        //     this.setState({
        //         playerTracker: playerTracker
        //     })
        // });
    }

    // componentWillMount(){
    //     if(this.state.playerTracker === undefined){
    //         const socket = this.props.socketConnection;
    //
    //         socket.emit('requestPlayerList');
    //     }
    // }

    componentDidMount() {
        const socket = this.props.socketConnection;
        console.log('player socket', socket);

        socket.on('updatePlayerList', playerTracker => {
            // this.props.makePlayerArrays(playerTracker)
            console.log('updatePlayerList PlayerTracker', playerTracker);
            this.setState({
                playerTracker: playerTracker
            })
        });
    }

    // componentDidUpdate(){
    //     if(this.props.playerLog){
    //         //The timeout gives other components a change to finish updating before the page redirects
    //         setTimeout(() => {
    //             this.props.history.push('/');
    //         }, 1000)
    //     }
    // }

    playerList() {
        //Sorts the player agent names in alphabetical order
        if(this.state.playerTracker !== []){
            console.log('playerTracker', this.state.playerTracker);
            // let playerArray = (this.props.playerTracker.playerTracker).sort((a,b) => {
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

    // logOut() {
    //     const socket = this.props.socketConnection;

    //     let playerToLogOut = this.props.player.agentName;

    //     socket.emit('log_out', playerToLogOut);

    //     // socket.on('newPlayerTrackerAfterLogout', (playerTracker) => {
    //     //     this.props.makePlayerArrays(playerTracker)
    //     // });

    //     this.props.storePlayerMessages('');

    //     //

    //     this.props.playerLoggedOut(true);

    //     // this.props.history.push('/');
    // }

    render() {

        let playerArray = this.state.playerTracker;

        return (
            <div>
                <ul>
                    {this.playerList()}
                </ul>
                {/*Only show the arrow to indicate scrolling when the array is long enough to need scrolling*/}
                <i id="joinOrCreateArrow" className= {playerArray.length >= 6 ? "material-icons" : "hide"} >arrow_drop_down</i>

                {/*************Commenting out the log out button for now, very nearly functional but still has a few bugs (mostly having to do with logging back in after logging out) to work on************/}
                {/*<button id="log_out" className="joinButton" onClick={this.logOut}>Log Out</button>*/}
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