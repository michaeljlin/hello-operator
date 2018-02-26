import React, {Component} from 'react';
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
        if(displayHeight === 'min'){
            return(
                <div id="minGameDisplay" className= "lobbyGameContainer">
                    <p className="missionname" style={thisPlayer === player1 || thisPlayer === player2 ? {color:'limegreen'} : {color: 'white'} }>Mission {mission}</p>
                    <p className="agentname" style={thisPlayer === player1 || thisPlayer === player2 ? {color:'limegreen'} : {color: 'white'} }>Agent {player1}</p>
                </div>
            )
        }

        //If the display has the maximized view
        if(displayHeight === 'max'){

            return(
                <div id="maxGameDisplay" className= "lobbyGameContainer">
                    <p id="missionName" style={thisPlayer === player1 || thisPlayer === player2 ? {color:'limegreen'} : {color: 'white'} }>Mission: {mission}</p>
                    <div id='playersInfo'>
                        <div id="player_1">
                            <p id="agent_1" className="agentname" style={thisPlayer === player1 ? {color:'limegreen'} : {color: 'white'}}>Agent: {player1}</p>
                            <p id='player_1_role'>Role: {player1Role}</p>
                            {/*<p id='player_1_ready' className="readyStatus">{player1Ready ? 'Ready' : ''}</p>*/}
                        </div>
                        <div id="player_2">
                            <p id='agent_2' className="agentname" style={thisPlayer === player2 ? {color:'limegreen'} : {color: 'white'}}>Agent: {player2 === undefined ? 'None' : player2}</p>
                            <p id='player_2_role'>Role: {player2Role === undefined ? 'No role selected' : player2Role}</p>
                            {/*<p id='player_2_ready' className="readyStatus">{player2Ready ? 'Ready': ''}</p>*/}
                        </div>
                    </div>
                </div>
            )
        }
    }
}

export default gameDisplay;