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
            spymaster: this.props.playerRoleObject.spymaster,
            spy: this.props.playerRoleObject.spy,
        };

        this.changeDisplayHeight = this.changeDisplayHeight.bind(this);
        this.joinButtonClicked = this.joinButtonClicked.bind(this);
    }

    joinButtonClicked() {
        const playerId = this.props.socketConnection.id;
        const playerAgentName = this.props.player.agentName;
        this.props.playerRole('spy', playerAgentName, playerId);

        //Once the action has been updated to include the new spy information, then update the state
        if(this.props.playerRoleObject.spy !== {}){
            this.setState({
                spy: this.props.playerRoleObject.spy,
            });

            console.log('new state', this.state);
        }
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

    roleToggle() {

    }


    render(){
        const display = this.props.display;
        const thisPlayer = this.props.player.agentName;

        let displayHeight = this.state.displaySize;
        let displayArrow = this.state.displayArrow;

        //The game display will only be rendered when all of the information has been passed down to this component
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
                        <label className="switch" style={this.props.agentName === thisPlayer ? {top: '73%', left: '61%', position: 'absolute'} : {pointerEvents: 'none', top: '73%', left: '61%', position: 'absolute'}} >
                            {/*style={{top: '34%', left: '64%'}}*/}
                            <input type="checkbox" onClick={this.roleToggle}/>
                                <span className="slider round"> </span>
                        </label>
                        <p className="roleDisplay" id="first_agent">Choose role</p>
                        <p id="agent_2" className="agentname" style={{top: '74%'}}>Agent </p>
                        <label className="switch" style={this.props.agentName === thisPlayer ? {top: '34%', left: '61%', position:'absolute' } : {pointerEvents: 'none', top: '34%', left: '61%', position: 'absolute'}}>
                            <input type="checkbox" onClick={this.roleToggle}/>
                                <span className="slider round"> </span>
                        </label>
                        <p className="roleDisplay"  id="second_agent">Choose role</p>
                        <i id="game_display_arrow" className="small material-icons" onClick={this.changeDisplayHeight} style={{top: '17%', right: '1%'}}>{displayArrow}</i>
                        {/*The join button only displays if the game was not created by the currently logged in user*/}
                        <button id="join" className= { this.props.agentName === thisPlayer ? "hide" : "joinButton"} onClick={this.joinButtonClicked}>Join Game</button>
                    </div>
                )
            }
        }

        //This should never appear on the dom, but until the username is defined in this render, something has to render
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