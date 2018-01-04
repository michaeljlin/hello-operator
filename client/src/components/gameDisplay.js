import React, {Component} from 'react';
import {connect} from 'react-redux';
import {setConn, gameInfo, playerRole, storePlayerMessages} from "../actions";
import './player.css';
import './lobby.css';
// import profilePic from "../assets/images/test_fb_1.jpg"

class gameDisplay extends Component {
    constructor(props) {
        super(props);

        this.state = {
            displaySize: '8vh',
            displayNeedsUpdate: true,
        };

        this.changeDisplayHeight = this.changeDisplayHeight.bind(this);
        this.joinButtonClicked = this.joinButtonClicked.bind(this);
        this.abortButtonClicked = this.abortButtonClicked.bind(this);
        this.roleTogglePlayer1 = this.roleTogglePlayer1.bind(this);
        this.roleTogglePlayer2 = this.roleTogglePlayer2.bind(this);
    }

    joinButtonClicked() {
       const socket = this.props.socketConnection;

       let updatedInformation = {
            mission: this.props.missionName,
            joinButton: true,
           abortButton: true,
            thisPlayer: this.props.thisPlayer,
            player1: {
                connId: this.props.connId,
                userName: this.props.player1.userName,
                agentName: this.props.player1.agentName,
                role: this.props.player1.role,
                switchCheck: this.props.player1.switchCheck,
                ready: this.props.player1.ready,
            },
            player2: {
                connId: this.props.player.socketId,
                userName: this.props.player.userName,
                agentName:this.props.player.agentName,
                role: 'Handler',
                switchCheck: false,
                ready: '',
            },
        };

       let updatedInformationAndAction = {
           updatedInformation: updatedInformation,
           action: 'join'
       };

        socket.emit('updateGameTracker', (updatedInformationAndAction));

        this.props.storePlayerMessages('You have been assigned to a mission. To be reassigned, you must abort this mission first');
    }

    abortButtonClicked() {
        const socket = this.props.socketConnection;

        let updatedInformation = {};

        //If there is only player 1 in the game, the game needs to be deleted
        if(this.props.player2.agentName === ""){
            socket.emit('deleteGame', (this.props.missionName))
        }

        //If there is are two players in the game, what happens depends on if player 1 or player 2 exits the game:
        else if(this.props.player2.agentName !== "") {

            //If the player exiting the game is a player 1, their info needs to be removed and player 2 needs to become player 1
            if(this.props.player.agentName === this.props.player1.agentName) {
                updatedInformation = {
                    mission: this.props.missionName,
                    joinButton: false,
                    abortButton: false,
                    thisPlayer: this.props.thisPlayer,
                    player1: {
                        connId: this.props.player2.connId,
                        userName: this.props.player2.userName,
                        agentName: this.props.player2.agentName,
                        role: this.props.player2.role,
                        switchCheck: this.props.player2.switchCheck,
                        ready: this.props.player2.ready,
                    },
                    player2: {
                        connId: '',
                        userName: '',
                        agentName: '',
                        role: '',
                        switchCheck: '',
                        ready: '',
                    },
                };
            }

            //If the player exiting the game is a player 2, their info just needs to be removed from the game
            else if(this.props.player.agentName === this.props.player2.agentName) {
                updatedInformation = {
                    mission: this.props.missionName,
                    joinButton: true,
                    abortButton: true,
                    thisPlayer: this.props.thisPlayer,
                    player1: {
                        connId: this.props.connId,
                        userName: this.props.player1.userName,
                        agentName: this.props.player1.agentName,
                        role: this.props.player1.role,
                        switchCheck: this.props.player1.switchCheck,
                        ready: this.props.player1.ready,
                    },
                    player2: {
                        connId: '',
                        userName: '',
                        agentName: '',
                        role: '',
                        switchCheck: '',
                        ready: '',
                    },
                };
            }
            let updatedInformationAndAction = {
                updatedInformation: updatedInformation,
                action: 'exit_game'
            };

            socket.emit('updateGameTracker', (updatedInformationAndAction))
        }
        this.props.storePlayerMessages('');
    }


    changeDisplayHeight() {
        //Height changed by changing state so that the dom is re-rendered when the game display size changes
        if (this.state.displaySize === '8vh') {
            this.setState({
                displaySize: '20vh',
            });
        }
        else if (this.state.displaySize === '20vh') {
            this.setState({
                displaySize: '8vh',
            });
        }
    }

    roleTogglePlayer1() {
        const socket = this.props.socketConnection;

        let player1Role = '';
        if(this.props.player1.role === 'Handler'){
            player1Role = 'Agent'
        }
        else{
            player1Role = 'Handler'
        }

        let switchCheck = '';
        if(!this.props.player1.switchCheck){
            switchCheck = true
        }
        else{
            switchCheck = false
        }

        let updatedInformation = {
            mission: this.props.missionName,
            //Player 1's role can be changed regardless of the state of the join button, so the join button info will be updated to whatever is currently in lobbyserver
            joinButton: '',
            abortButton: '',
            thisPlayer: this.props.thisPlayer,
            player1: {
                connId: this.props.connId,
                userName: this.props.player1.userName,
                agentName: this.props.player1.agentName,
                role: player1Role,
                switchCheck: switchCheck,
                ready: 'Ready',
            },


            //Player 1's role can be changed regardless of the state of player2, so player2 info will be updated to whatever is currently in lobbyserver
            player2: {
                connId: '',
                userName: '',
                agentName: '',
                role: '',
                switchCheck: '',
                ready: '',
            },
        };

        let updatedInformationAndAction = {
            updatedInformation: updatedInformation,
            action: 'player1_role'
        };

        socket.emit('updateGameTracker', (updatedInformationAndAction))

    }

    roleTogglePlayer2() {
        const socket = this.props.socketConnection;

        let player2Role = '';
        if(this.props.player2.role === 'Handler'){
            player2Role = 'Agent'
        }
        else{
            player2Role = 'Handler'
        }

        let switchCheck = '';
        if(!this.props.player2.switchCheck){
            switchCheck = true
        }
        else{
            switchCheck = false
        }

        let updatedInformation = {
            mission: this.props.missionName,
            //Player 2's role can be changed regardless of the state of the join button, so the join button info will be updated to whatever is currently in lobbyserver
            joinButton: '',
            abortButton: '',
            thisPlayer: this.props.thisPlayer,
            //Player 2's role can be changed regardless of the state of player 1, so player 1 info will be updated to whatever is currently in lobbyserver
            player1: {
                connId: '',
                userName: '',
                agentName: '',
                role: '',
                switchCheck: '',
                ready: '',
            },
            player2: {
                connId: this.props.connId,
                userName: this.props.player2.userName,
                agentName: this.props.player2.agentName,
                role: player2Role,
                switchCheck: switchCheck,
                ready: 'Ready',
            },
        };

        let updatedInformationAndAction = {
            updatedInformation: updatedInformation,
            action: 'player2_role'
        };

        socket.emit('updateGameTracker', (updatedInformationAndAction))
    }

    // componentDidMount(){
    //     const socket = this.props.socketConnection;
    //
    //     //Depending on the information about which player clicked the switch and the role they chose, the state will be updated accordingly (so the currently selected player role can be displayed) and the switch position will change to reflect the role chosen
    //     socket.on('whichPlayerRole', (playerAndRoleChosen, gameClickedonId, gameIndex) => {
    //         //If the open game that was clicked on is the same as the open game rendered in this component
    //         // if(gameClickedonId === `first_switch_check ${gameIndex}` || `second_switch_check ${gameIndex}`){
    //             switch(playerAndRoleChosen){
    //                 case 'player1_agent':
    //                     document.getElementById(`first_switch_check ${gameIndex}`).setAttribute('checked', true);
    //                     document.getElementById(`player_1_role ${gameIndex}`).innerText = 'Agent';
    //                     break;
    //
    //                 case 'player1_handler':
    //                     document.getElementById(`first_switch_check ${gameIndex}`).removeAttribute('checked');
    //                     document.getElementById(`player_1_role ${gameIndex}`).innerText = 'Handler';
    //                     break;
    //
    //                 case 'player2_agent':
    //                     document.getElementById(`second_switch_check ${gameIndex}`).removeAttribute('checked');
    //                     document.getElementById(`player_2_role ${gameIndex}`).innerText = 'Agent';
    //                     break;
    //
    //                 case 'player2_handler':
    //                     document.getElementById(`second_switch_check ${gameIndex}`).removeAttribute('checked');
    //                     document.getElementById(`player_2_role ${gameIndex}`).innerText = 'Handler';
    //                     break;
    //             }
    //         // }
    //     });
    //
    //     socket.on('whichPlayerIsReady', (playerReady, gameClickedonId, gameIndex) => {
    //         //If the open game that was clicked on is the same as the open game rendered in this component
    //         switch (playerReady) {
    //             case 'player1':
    //                 // this.setState({
    //                 //     player1IsReady: true,
    //                 // });
    //                 document.getElementById(`player_1_ready ${gameIndex}`).innerText = 'Ready';
    //                 break;
    //             case 'player2':
    //                 // this.setState({
    //                 //     player2IsReady: true,
    //                 // });
    //                 document.getElementById(`player_2_ready ${gameIndex}`).innerText = 'Ready';
    //                 break;
    //         }
    //     });
    //
    //     socket.on('whichPlayerJoined', (joiningPlayer, gameIndex) => {
    //         //Used for determining if the joined player can change the position of the switch
    //         this.setState({
    //             joinedPlayer: joiningPlayer,
    //         });
    //
    //         document.getElementById(`agent_2 ${gameIndex}`).innerText = `Agent ${joiningPlayer}`;
    //
    //         document.getElementById(`join ${gameIndex}`).classList.remove('joinButton');
    //         document.getElementById(`join ${gameIndex}`).classList.add('hide');
    //
    //     });
    // }


    render(){
        let display = this.props.display;
        let mission = this.props.missionName;
        let joinButton = this.props.joinButton;
        let abortButton = this.props.abortButton;
        let thisPlayer = this.props.player.agentName;
        let player1 = this.props.player1;
        let player2 = this.props.player2;
        let index = this.props.gameIndex;
        let joinedPlayer = this.state.joinedPlayer;
        let displayHeight = this.state.displaySize;
        let allPlayer1 = this.props.allPlayer1;
        let isPlayer1 = allPlayer1.find((player) => {
            return player === thisPlayer
        });
        let allPlayer2 = this.props.allPlayer2;
        let isPlayer2 = allPlayer2.find((player) => {
            return player === thisPlayer
        });

        //The game display will only be rendered when all of the information has been passed down to this component, and the username is typically loaded last
        if(player1.userName !== undefined){

            //If the display has the minimized view
            if(displayHeight === '8vh'){
                return(
                    <div className= {display ? "lobbyGameContainer" : "hide"} style={{height: displayHeight}}>
                        {/*<img id="profilePic" src= {this.props.picture}/>*/}
                        {/*If the player currently viewing is in the game, change the mission title to green*/}
                        <p className="missionname" style={thisPlayer === player1.agentName || thisPlayer === player2.agentName ? {color:'limegreen'} : {color: 'white'} }>Mission {mission}</p>
                        {/*If the player currently viewing is in the game, change the agent name to green*/}
                        <p className="agentname" style={thisPlayer === player1.agentName || thisPlayer === player2.agentName ? {color:'limegreen'} : {color: 'white'} }>Agent {player1.agentName}</p>
                        <i id="game_display_arrow" className="small material-icons" onClick={this.changeDisplayHeight} >arrow_drop_down</i>
                    </div>
                )
            }

            //If the display has the maximized view
            if(displayHeight === '20vh'){

                return(
                    <div id="maxGameDisplay" className= {display ? "lobbyGameContainer" : "hide"} style={{height: displayHeight}}>
                        {/*If the player currently viewing is in the game, change the mission title to green*/}
                        <p id="missionName" style={thisPlayer === player1.agentName || thisPlayer === player2.agentName ? {color:'limegreen'} : {color: 'white'} }>Mission {mission}</p>
                        {/*If the player currently viewing is the player with the same agent name, change the color to green*/}
                        <p id="agent_1" className="agentname" style={thisPlayer === player1.agentName ? {color:'limegreen'} : {color: 'white'}}>Agent {player1.agentName}</p>
                        <p id={`player_1_role ${index}`} className="agentname" style={{top: '36%', left: '50%'}}>{player1.role}</p>
                        {/*If the displayed agent name is that of the currently logged in player, then the player can click on the switch, otherwise they cannot click on the switch*/}
                        <label className="switch" style={thisPlayer === player1.agentName ? {top: '36%', left: '61%', position: 'absolute'} : {pointerEvents: 'none', top: '34%', left: '61%', position: 'absolute'}} >
                            {/*The id is for checking to see if the clicked on switch is the one rendering here, and the class is for changing the checked status */}
                            <input id='first_switch_check' className="first_switch" type="checkbox" checked={player1.switchCheck} onClick={this.roleTogglePlayer1}/>
                            <span className="slider round"> </span>
                        </label>
                        <p id='player_1_ready' className="readyStatus" style={{top: '28%', left: '75%'}} >{player1.ready}</p>

                        <p id='agent_2' className="agentname" style={thisPlayer === player2.agentName ? {color:'limegreen', top: '74%'} : {color: 'white', top: '74%'}}>Agent {player2.agentName}</p>
                        <p id='player_2_role' className="agentname" style={{top: '71%', left: '50%'}}>{player2.role}</p>
                        {/*If the displayed agent name is that of the currently logged in player (that joined the game), then the player can click on the switch, otherwise they cannot click on the switch*/}
                        <label  className="switch" style={thisPlayer === player2.agentName ? {top: '71%', left: '61%', position:'absolute' } : {pointerEvents: 'none', top: '73%', left: '61%', position: 'absolute'}}>
                            {/*The id is for checking to see if the clicked on switch is the one rendering here, and the class is for changing the checked status */}
                            <input id='second_switch_check' className="second_switch" type="checkbox"  checked={player2.switchCheck} onClick={this.roleTogglePlayer2}/>
                            <span className="slider round"> </span>
                        </label>
                        <p id='player_2_ready' className="readyStatus" style={{top: '63%', left: '75%'}} >{player2.ready}</p>

                        <i id="game_display_arrow" className="small material-icons" onClick={this.changeDisplayHeight}>arrow_drop_up</i>
                        {/*The join button only displays for a player if that player has not created a game (so they're a player 1), joined another game (so they're a player 2) or if that game does not have a second player yet*/}
                        <button id='join' className= { joinButton || isPlayer1 || isPlayer2 ? "hide" : "joinButton"} onClick={this.joinButtonClicked}>Join Mission</button>
                        <button id='abort' className= { abortButton && (thisPlayer === player1.agentName || thisPlayer === player2.agentName) ? "joinButton" : "hide"} onClick={this.abortButtonClicked}>Abort Mission</button>
                    </div>
                )
            }
        }

        //This should never actually appear on the dom, but until the username is defined, something has to render
        else if (player1.userName === undefined){
            return(
                <div className= {display ? "lobbyGameContainer" : "hide"} >
                    {/*<p id="username" style={{left: '20%'}}>Loading player data</p>*/}
                </div>
            )
        }
    }
}

function mapStateToProps(state){
    return{
        socketConnection: state.socketConnection.setConn,
        openGames: state.gameInformation.gameArrays,
        player: state.playerInformation.playerObject,
        playerRoleObject: state.playerInformation.playerRoles,
    }
}

export default connect(mapStateToProps, {setConn, gameInfo, playerRole, storePlayerMessages})(gameDisplay);