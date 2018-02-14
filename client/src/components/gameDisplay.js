import React, {Component} from 'react';
import {connect} from 'react-redux';
import './player.css';
import './lobby.css';

class gameDisplay extends Component {

    render(){
        console.log('this.props', this.props);

        let mission = this.props.missionName;
        let thisPlayer = this.props.thisPlayer;
        let player1 = this.props.player1;
        let player1Role = this.props.player1Role;
        let player1Ready = this.props.player1Ready;
        let player2 = this.props.player2;
        let player2Role = this.props.player2Role;
        let player2Ready = this.props.player2Ready;
        let index = this.props.gameIndex;
        let displayHeight = this.props.displayHeight;

        //If the display has the minimized view
        if(displayHeight === '8vh'){
            return(
                <div id="minGameDisplay" className= "lobbyGameContainer" style={{height: displayHeight}}>
                    <p className="missionname" style={thisPlayer === player1 || thisPlayer === player2 ? {color:'limegreen'} : {color: 'white'} }>Mission {mission}</p>
                    <p className="agentname" style={thisPlayer === player1 || thisPlayer === player2 ? {color:'limegreen'} : {color: 'white'} }>Agent {player1}</p>
                </div>
            )
        }

        //If the display has the maximized view
        if(displayHeight === '20vh'){

            return(
                <div id="maxGameDisplay" className= "lobbyGameContainer" style={{height: displayHeight}}>
                    <p id="missionName" style={thisPlayer === player1 || thisPlayer === player2 ? {color:'limegreen'} : {color: 'white'} }>Mission {mission}</p>

                    <p id="agent_1" className="agentname" style={thisPlayer === player1 ? {color:'limegreen'} : {color: 'white'}}>Agent {player1}</p>
                    <p id='player_1_role'>{player1Role}</p>
                    <p id='player_1_ready' className="readyStatus">{player1Ready ? 'Ready' : ''}</p>

                    <p id='agent_2' className="agentname" style={thisPlayer === player2 ? {color:'limegreen', top: '74%'} : {color: 'white', top: '74%'}}>Agent {player2}</p>
                    <p id='player_2_role'>{player2Role}</p>
                    <p id='player_2_ready' className="readyStatus">{player2Ready ? 'Ready': ''}</p>
                </div>
            )
        }
    }
}

export default gameDisplay;