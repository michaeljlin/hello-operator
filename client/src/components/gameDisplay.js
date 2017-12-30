import React, {Component} from 'react';
import {connect} from 'react-redux';
import {setConn, gameInfo, playerRole} from "../actions";
import './player.css';
import './lobby.css';
// import profilePic from "../assets/images/test_fb_1.jpg"

class gameDisplay extends Component {
    constructor(props) {
        super(props);
        this.state = {
            displaySize: '7vh',
            spymaster: '',
            spy: '',
            joinedPlayer: '',
            //Need to store game index here for the changeDisplayHeight function
            openGameIndex: this.props.gameIndex,
            maximizedOpenGameInfo: [],
        };

        this.changeDisplayHeight = this.changeDisplayHeight.bind(this);
        this.joinButtonClicked = this.joinButtonClicked.bind(this);
        this.roleTogglePlayer1 = this.roleTogglePlayer1.bind(this);
        this.roleTogglePlayer2 = this.roleTogglePlayer2.bind(this);
    }

    joinButtonClicked() {
        // const playerId = this.props.socketConnection.id;
        const playerAgentName = this.props.player.agentName;
        const index = this.state.openGameIndex;
        const socket = this.props.socketConnection;

        //*****This component may be he only one that needs to know the player roles, so let's just use the local state for now*****
        // this.props.playerRole('spy', playerAgentName, playerId);
        //
        // //Once the action has been updated to include the new spy information, then update the state
        // if(this.props.playerRoleObject.spy !== {}){
        //     this.setState({
        //         spy: this.props.playerRoleObject.spy,
        //     });
        //
        //     console.log('new state', this.state);
        // }

        socket.emit('playerJoinedGame', playerAgentName, index);

        // this.setState({
        //     joinedPlayer: playerAgentName,
        // });

        //Causes the join button to disappear after a player joins a game
        // document.getElementById(`join ${index}`).classList.add('hide');
    }



    changeDisplayHeight() {

        const index = this.state.openGameIndex;

        //Height changed by changing state so that the dom is re-rendered when the game display size changes
        if(this.state.displaySize === '7vh') {
            this.setState({
                displaySize: '20vh',
            });
        }
        else if(this.state.displaySize === '20vh') {

            let openGameInfo = {
                gameIndex: index,
                mission: document.getElementById('missionName').innerText,
                joinButton: document.getElementById(`join ${index}`).classList,
                player1: {
                    agentName: document.getElementById('agent_1').innerText,
                    role: document.getElementById(`player_1_role ${index}`).innerText,
                    switchCheck: document.getElementById(`first_switch_check ${index}`).checked,
                    ready: document.getElementById(`player_1_ready ${index}`).innerText,
                },
                player2: {
                    agentName: document.getElementById(`agent_2 ${index}`).innerText,
                    role: document.getElementById(`player_2_role ${index}`).innerText,
                    switchCheck: document.getElementById(`second_switch_check ${index}`).checked,
                    ready: document.getElementById(`player_2_ready ${index}`).innerText,
                },
            };

            //Check to see if the game currently being minimized and whose information we might be about to store has already been opened and thus stored before, and if it has, find the index of that game
            let gameWithThisIndex = (this.state.maximizedOpenGameInfo).filter(openGame => openGame.gameIndex === index);
            let indexOfPreviouslyStoredGame = this.state.maximizedOpenGameInfo.indexOf(gameWithThisIndex[0]);

            //If this game has been stored before, remove it from the array so when we store it again below with updated information we will not have a duplicate
            if(gameWithThisIndex.length > 0){
                this.state.maximizedOpenGameInfo.splice(indexOfPreviouslyStoredGame, 1)
            }

            this.setState({
                displaySize: '7vh',

                //Saving the changes made on the Dom so that the information shows up when the open game is maximized again
                maximizedOpenGameInfo: [
                    ...this.state.maximizedOpenGameInfo, openGameInfo,
                ]
            });
            console.log('current state', this.state);
        }
    }

    roleTogglePlayer1(event) {
        console.log('event props', event);
        const socket = this.props.socketConnection;

        const gameIndex = this.props.gameIndex;
        const elementId = event.target.id;

        // //If the switch that was clicked on is the same one as the one being rendered in this component, then change the player roles (prevents the roles of all player 1s being changed)
        // if(elementId === `first_switch_check ${gameIndex}`){

            //Only change the player role of the game currently being rendered
            if(document.getElementById(`player_1_role ${gameIndex}`).innerText === 'Handler'){
                socket.emit('playerChoseRole', 'player1_agent', elementId, gameIndex)
            }
            else if(document.getElementById(`player_1_role ${gameIndex}`).innerText === 'Agent'){
                socket.emit('playerChoseRole', 'player1_handler', elementId, gameIndex)
            }
            socket.emit('playerReady', 'player1', elementId, gameIndex);
        // }

    }

    roleTogglePlayer2(event) {
        const socket = this.props.socketConnection;

        const gameIndex = this.props.gameIndex;
        const elementId = event.target.id;

        // //If the switch that was clicked on is the same one as the one being rendered in this component, then change the player roles (prevents the roles of all player 1s being changed)
        // if(elementId === `second_switch_check ${gameIndex}`){
            if(document.getElementById(`player_2_role ${gameIndex}`).innerText === 'Handler'){
                socket.emit('playerChoseRole', 'player2_agent', elementId, gameIndex)
            }
            else if(document.getElementById(`player_2_role ${gameIndex}`).innerText === 'Agent'){
                socket.emit('playerChoseRole', 'player2_handler', elementId, gameIndex)
            }

            socket.emit('playerReady', 'player2', elementId, gameIndex);
        // }
    }

    componentDidMount(){
        const socket = this.props.socketConnection;

        //Depending on the information about which player clicked the switch and the role they chose, the state will be updated accordingly (so the currently selected player role can be displayed) and the switch position will change to reflect the role chosen
        socket.on('whichPlayerRole', (playerAndRoleChosen, gameClickedonId, gameIndex) => {
            //If the open game that was clicked on is the same as the open game rendered in this component
            // if(gameClickedonId === `first_switch_check ${gameIndex}` || `second_switch_check ${gameIndex}`){
                switch(playerAndRoleChosen){
                    case 'player1_agent':
                        document.getElementById(`first_switch_check ${gameIndex}`).setAttribute('checked', true);
                        document.getElementById(`player_1_role ${gameIndex}`).innerText = 'Agent';
                        break;

                    case 'player1_handler':
                        document.getElementById(`first_switch_check ${gameIndex}`).removeAttribute('checked');
                        document.getElementById(`player_1_role ${gameIndex}`).innerText = 'Handler';
                        break;

                    case 'player2_agent':
                        document.getElementById(`second_switch_check ${gameIndex}`).removeAttribute('checked');
                        document.getElementById(`player_2_role ${gameIndex}`).innerText = 'Agent';
                        break;

                    case 'player2_handler':
                        document.getElementById(`second_switch_check ${gameIndex}`).removeAttribute('checked');
                        document.getElementById(`player_2_role ${gameIndex}`).innerText = 'Handler';
                        break;
                }
            // }
        });

        socket.on('whichPlayerIsReady', (playerReady, gameClickedonId, gameIndex) => {
            //If the open game that was clicked on is the same as the open game rendered in this component
            switch (playerReady) {
                case 'player1':
                    // this.setState({
                    //     player1IsReady: true,
                    // });
                    document.getElementById(`player_1_ready ${gameIndex}`).innerText = 'Ready';
                    break;
                case 'player2':
                    // this.setState({
                    //     player2IsReady: true,
                    // });
                    document.getElementById(`player_2_ready ${gameIndex}`).innerText = 'Ready';
                    break;
            }
        });

        socket.on('whichPlayerJoined', (joiningPlayer, gameIndex) => {
            //Used for determining if the joined player can change the position of the switch
            this.setState({
                joinedPlayer: joiningPlayer,
            });

            document.getElementById(`agent_2 ${gameIndex}`).innerText = `Agent ${joiningPlayer}`;

            document.getElementById(`join ${gameIndex}`).classList.remove('joinButton');
            document.getElementById(`join ${gameIndex}`).classList.add('hide');

        });
    }

    render(){
        let display = this.props.display;
        let thisPlayer = this.props.player.agentName;
        let index = this.props.gameIndex;
        let joinedPlayer = this.state.joinedPlayer;
        let displayHeight = this.state.displaySize;

        //Figures out if there is a game that has been opened before by comparing the game indexes of the stored game info in the state and the currently rendering game's index
        let recordedOpenGameIndex = (this.state.maximizedOpenGameInfo).filter(openGame => openGame.gameIndex === index);
        //Player and game information from previously stored game, there should only be one previously opened game with this game index, so we will always be getting the information from the first object in the array
        //If statement to make sure that the player and game info is only being retrieved when there is a previously open recorded game
        if(recordedOpenGameIndex.length > 0){
            var player1Info = (this.state.maximizedOpenGameInfo[0]).player1;
            var player2Info = (this.state.maximizedOpenGameInfo[0]).player2;
            var missionName = (this.state.maximizedOpenGameInfo[0]).mission;
            var joinButtonVisibility = (this.state.maximizedOpenGameInfo[0]).joinButton;
        }


        //The game display will only be rendered when all of the information has been passed down to this component, and the username is typically loaded last
        if(this.props.userName !== undefined){

            //If the display has the minimized view
            if(this.state.displaySize === '7vh'){
                return(
                    <div className= {display ? "lobbyGameContainer" : "hide"} style={{height: displayHeight}}>
                        {/*<img id="profilePic" src= {this.props.picture}/>*/}
                        <p className="missionname">Mission {this.props.missionName}</p>
                        {/*<p id="username" style={{left: '20%'}}> Player {this.props.userName} </p>*/}
                        <p className="agentname">Agent {this.props.agentName}</p>
                        <i id="game_display_arrow" className="small material-icons" onClick={this.changeDisplayHeight} >arrow_drop_down</i>
                    </div>
                )
            }

            //If the display has the maximized view
            if(this.state.displaySize === '20vh'){

                //Prevents information disappearing after an open game is minimized then maximized again. If there is a gameIndex in the maximizedOpenGameInfo section of the state (so this game was maximized previously) and it matches the currently rendered game's index, use that game info stored in the state to build the open game
                if(recordedOpenGameIndex.length > 0){
                    return(
                        <div id="maxGameDisplay" className= {display ? "lobbyGameContainer" : "hide"} style={{height: displayHeight}}>
                            <p id="missionName">{missionName}</p>
                            <p id="agent_1" className="agentname">{player1Info.agentName}</p>
                            <p id={`player_1_role ${index}`} className="agentname" style={{top: '36%', left: '50%'}}>{player1Info.role}</p>
                            {/*If the displayed agent name is that of the currently logged in player, then the player can click on the switch, otherwise they cannot click on the switch*/}
                            <label className="switch" style={this.props.agentName === thisPlayer ? {top: '36%', left: '61%', position: 'absolute'} : {pointerEvents: 'none', top: '34%', left: '61%', position: 'absolute'}} >
                                {/*The id is for checking to see if the clicked on switch is the one rendering here, and the class is for changing the checked status */}
                                <input id={`first_switch_check ${index}`} className="first_switch" type="checkbox" onClick={this.roleTogglePlayer1}/>
                                <span className="slider round"> </span>
                            </label>
                            <p id={`player_1_ready ${index}`} className="readyStatus" style={{top: '28%', left: '75%'}} >{player1Info.ready}</p>

                            <p id={`agent_2 ${index}`} className="agentname" style={{top: '74%'}}>{player2Info.agentName}</p>
                            <p id={`player_2_role ${index}`} className="agentname" style={{top: '71%', left: '50%'}}>{player2Info.role}</p>
                            {/*If the displayed agent name is that of the currently logged in player (that joined the game), then the player can click on the switch, otherwise they cannot click on the switch*/}
                            <label  className="switch" style={joinedPlayer === thisPlayer ? {top: '71%', left: '61%', position:'absolute' } : {pointerEvents: 'none', top: '73%', left: '61%', position: 'absolute'}}>
                                {/*The id is for checking to see if the clicked on switch is the one rendering here, and the class is for changing the checked status */}
                                <input id={`second_switch_check ${index}`} className="second_switch" type="checkbox" onClick={this.roleTogglePlayer2}/>
                                <span className="slider round"> </span>
                            </label>
                            <p id={`player_2_ready ${index}`} className="readyStatus" style={{top: '63%', left: '75%'}} >{player2Info.ready}</p>

                            <i id="game_display_arrow" className="small material-icons" onClick={this.changeDisplayHeight} style={{top: '17%', right: '1%'}}>arrow_drop_up</i>
                            {/*The join button only displays if the game was not created by the currently logged in user, and if someone hasn't already joined the game*/}
                            {/*<button id={`join ${index}`} className= { this.props.agentName === thisPlayer || joinedPlayer !== "" ? "hide" : "joinButton"} onClick={this.joinButtonClicked}>Join Game</button>*/}
                            {/*<button id={`join ${index}`} className= { joinedPlayer !== "" ? "hide" : "joinButton"}  onClick={this.joinButtonClicked}>Join Game</button>*/}
                            <button id={`join ${index}`} className= {joinButtonVisibility} onClick={this.joinButtonClicked}>Join Game</button>
                        </div>
                    )
                }
                //If this game has not minimized then maximized before, populate the open game with new information
                else {
                    return(
                        <div id="maxGameDisplay" className= {display ? "lobbyGameContainer" : "hide"} style={{height: displayHeight}}>
                            <p id="missionName">Mission {this.props.missionName} </p>
                            <p id="agent_1" className="agentname">Agent {this.props.agentName}</p>
                            <p id={`player_1_role ${index}`} className="agentname" style={{top: '36%', left: '50%'}}>Handler</p>
                            {/*If the displayed agent name is that of the currently logged in player, then the player can click on the switch, otherwise they cannot click on the switch*/}
                            <label className="switch" style={this.props.agentName === thisPlayer ? {top: '36%', left: '61%', position: 'absolute'} : {pointerEvents: 'none', top: '34%', left: '61%', position: 'absolute'}} >
                                {/*The id is for checking to see if the clicked on switch is the one rendering here, and the class is for changing the checked status */}
                                <input id={`first_switch_check ${index}`} className="first_switch" type="checkbox" onClick={this.roleTogglePlayer1}/>
                                <span className="slider round"> </span>
                            </label>
                            <p id={`player_1_ready ${index}`} className="readyStatus" style={{top: '28%', left: '75%'}} > </p>

                            <p id={`agent_2 ${index}`} className="agentname" style={{top: '74%'}}>Agent </p>
                            <p id={`player_2_role ${index}`} className="agentname" style={{top: '71%', left: '50%'}}>Handler</p>
                            {/*If the displayed agent name is that of the currently logged in player (that joined the game), then the player can click on the switch, otherwise they cannot click on the switch*/}
                            <label  className="switch" style={joinedPlayer === thisPlayer ? {top: '71%', left: '61%', position:'absolute' } : {pointerEvents: 'none', top: '73%', left: '61%', position: 'absolute'}}>
                                {/*The id is for checking to see if the clicked on switch is the one rendering here, and the class is for changing the checked status */}
                                <input id={`second_switch_check ${index}`} className="second_switch" type="checkbox" onClick={this.roleTogglePlayer2}/>
                                <span className="slider round"> </span>
                            </label>
                            <p id={`player_2_ready ${index}`} className="readyStatus" style={{top: '63%', left: '75%'}} > </p>

                            <i id="game_display_arrow" className="small material-icons" onClick={this.changeDisplayHeight} style={{top: '17%', right: '1%'}}>arrow_drop_up</i>
                            {/*The join button only displays if the game was not created by the currently logged in user, and if someone hasn't already joined the game*/}
                            {/*<button id={`join ${index}`} className= { this.props.agentName === thisPlayer || joinedPlayer !== "" ? "hide" : "joinButton"} onClick={this.joinButtonClicked}>Join Game</button>*/}
                            {/*<button id={`join ${index}`} className= { joinedPlayer !== "" ? "hide" : "joinButton"}  onClick={this.joinButtonClicked}>Join Game</button>*/}
                            <button id={`join ${index}`} className= { this.props.agentName === thisPlayer ? "hide" : "joinButton"} onClick={this.joinButtonClicked}>Join Game</button>
                        </div>
                    )
                }
            }
        }

        //This should never actually appear on the dom, but until the username is defined, something has to render
        else if (this.props.userName === undefined){
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

export default connect(mapStateToProps, {setConn, gameInfo, playerRole})(gameDisplay);