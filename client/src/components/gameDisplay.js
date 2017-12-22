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
            displayArrow: 'arrow_drop_down',
            spymaster: '',
            spy: '',
            player1Role: 'Handler',
            player2Role: 'Handler',
            joinedPlayer: '',
            player1IsReady: false,
            player2IsReady: false,
        };

        this.changeDisplayHeight = this.changeDisplayHeight.bind(this);
        this.joinButtonClicked = this.joinButtonClicked.bind(this);
        this.roleTogglePlayer1 = this.roleTogglePlayer1.bind(this);
        this.roleTogglePlayer2 = this.roleTogglePlayer2.bind(this);
        // this.updateThePlayerRoleAndStatus = this.updateThePlayerRoleAndStatus.bind(this);
    }

    joinButtonClicked() {
        const playerId = this.props.socketConnection.id;
        const playerAgentName = this.props.player.agentName;

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

        this.setState({
            joinedPlayer: playerAgentName,
        });

        //Causes the join button to disappear after a player joins a game
        document.getElementById('join').remove();
    }



    changeDisplayHeight() {

        if(this.state.displaySize === '7vh') {
            this.setState({
                displaySize: '20vh',
                displayArrow: 'arrow_drop_up'
            });
        }
        else if(this.state.displaySize === '20vh') {
            this.setState({
                displaySize: '7vh',
                displayArrow: 'arrow_drop_down'
            })
        }
    }

    roleTogglePlayer1() {
        const socket = this.props.socketConnection;
        if(this.state.player1Role === 'Handler'){
            // this.setState({
            //     // player1Role: 'Agent',
            //     // player1IsReady: true,
            // });
            socket.emit('playerChoseRole', 'player1_agent')
        }
        else if(this.state.player1Role === 'Agent'){
            // this.setState({
            //     // player1Role: 'Handler',
            //     // player1IsReady: true,
            // });
            socket.emit('playerChoseRole', 'player1_handler')
        }
        socket.emit('playerReady', 'player1');

        // this.updateThePlayerRoleAndStatus();
    }

    roleTogglePlayer2() {
        const socket = this.props.socketConnection;
        if(this.state.player2Role === 'Handler'){
            // this.setState({
            //     // player2Role: 'Agent',
            //     // player2IsReady: true,
            // });
            socket.emit('playerChoseRole', 'player2_agent')
        }
        else if(this.state.player2Role === 'Agent'){
            // this.setState({
            //     // player2Role: 'Handler',
            //     // player2IsReady: true,
            // });
            socket.emit('playerChoseRole', 'player2_handler')
        }

        socket.emit('playerReady', 'player2');

    //     this.updateThePlayerRoleAndStatus();
    }

    componentDidMount(){
        const socket = this.props.socketConnection;

        socket.on('whichPlayerRole', (playerAndRoleChosen) => {
            switch(playerAndRoleChosen){
                case 'player1_agent':
                    this.setState({
                        player1Role: 'Agent',
                    });
                    document.getElementById('first_switch_check').setAttribute('checked', true);
                    break;
                case 'player1_handler':
                    this.setState({
                        player1Role: 'Handler',
                    });
                    document.getElementById('first_switch_check').removeAttribute('checked');
                    break;
                case 'player2_agent':
                    this.setState({
                        player2Role: 'Agent',
                    });
                    document.getElementById('second_switch_check').setAttribute('checked', true);
                    break;
                case 'player2_handler':
                    this.setState({
                        player2Role: 'Handler',
                    });
                    document.getElementById('second_switch_check').removeAttribute('checked');
                    break;
            }
        });

        socket.on('whichPlayerIsReady', (playerReady) => {
            switch(playerReady){
                case 'player1':
                    this.setState({
                        player1IsReady: true,
                    });
                    break;
                case 'player2':
                    this.setState({
                        player2IsReady: true,
                    });
                    break;
            }
        });
    }

    render(){
        let display = this.props.display;
        let thisPlayer = this.props.player.agentName;
        let joinedPlayer = this.state.joinedPlayer;
        let displayHeight = this.state.displaySize;
        let displayArrow = this.state.displayArrow;
        let player1Role = this.state.player1Role;
        let player1Ready = this.state.player1IsReady;
        let player2Role = this.state.player2Role;
        let player2Ready = this.state.player2IsReady;

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
                        <i id="game_display_arrow" className="small material-icons" onClick={this.changeDisplayHeight} >{displayArrow}</i>
                    </div>
                )
            }

            //If the display has the maximized view
            if(this.state.displaySize === '20vh'){
                return(
                    <div id="maxGameDisplay" className= {display ? "lobbyGameContainer" : "hide"} style={{height: displayHeight}}>
                        {/*<img id="profilePic" src= {this.props.picture}/>*/}
                        <p className="missionname">Mission {this.props.missionName} </p>
                        {/*<p id="username" style={{left: '20%'}}> Player {this.props.userName} </p>*/}
                        <p id="agent_1" className="agentname">Agent {this.props.agentName}</p>
                        <p id="player_1_role" className="agentname" style={{top: '36%', left: '50%'}}>{player1Role}</p>
                        {/*If the displayed agent name is that of the currently logged in player, then the player can click on the switch, otherwise they cannot click on the switch*/}
                        <label className="switch" style={this.props.agentName === thisPlayer ? {top: '36%', left: '61%', position: 'absolute'} : {pointerEvents: 'none', top: '34%', left: '61%', position: 'absolute'}} >
                            {/*style={{top: '34%', left: '64%'}}*/}
                            <input id="first_switch_check" type="checkbox" onClick={this.roleTogglePlayer1}/>
                                <span className="slider round"> </span>
                        </label>
                        <p className="readyStatus" style={player1Ready === true ? {top: '28%', left: '75%'} : {display: 'none'}} >Ready</p>
                        <p id="agent_2" className="agentname" style={{top: '74%'}}>Agent {joinedPlayer}</p>
                        <p id="player_2_role" className="agentname" style={{top: '71%', left: '50%'}}>{player2Role}</p>
                        {/*If the displayed agent name is that of the currently logged in player (that joined the game), then the player can click on the switch, otherwise they cannot click on the switch*/}
                        <label  className="switch" style={joinedPlayer === thisPlayer ? {top: '71%', left: '61%', position:'absolute' } : {pointerEvents: 'none', top: '73%', left: '61%', position: 'absolute'}}>
                            <input id="second_switch_check" type="checkbox" onClick={this.roleTogglePlayer2}/>
                                <span className="slider round"> </span>
                        </label>
                        <p className="readyStatus" style={player2Ready === true ? {top: '63%', left: '75%'} : {display: 'none'}} >Ready</p>
                        <p id="player_2_ready">Ready</p>
                        <i id="game_display_arrow" className="small material-icons" onClick={this.changeDisplayHeight} style={{top: '17%', right: '1%'}}>{displayArrow}</i>
                        {/*The join button only displays if the game was not created by the currently logged in user*/}
                        <button id="join" className= { this.props.agentName === thisPlayer ? "hide" : "joinButton"} onClick={this.joinButtonClicked}>Join Game</button>
                    </div>
                )
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