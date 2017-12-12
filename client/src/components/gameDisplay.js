import React, {Component} from 'react';
import {connect} from 'react-redux';
import {setConn, gameInfo} from "../actions";
import './player.css';
import './lobby.css';
// import profilePic from "../assets/images/test_fb_1.jpg"

class gameDisplay extends Component {
    constructor(props) {
        super(props);
    }

    // joinButtonClicked(event) {
    //     const eventId = event.target.id;
    //     const playerId = this.props.socketConnection.id;
    //     this.props.socketConnection.emit('join_button_pressed', eventId, playerId);
    //     // this.props.playerRole('spy')
    // }


    render(){
        const display = this.props.display;

        if(this.props.userName !== undefined){
            return(
                <div className= {display ? "lobbyGameContainer" : "hide"} >
                    {/*<img id="profilePic" src= {this.props.picture}/>*/}
                    <p id="missionname">Mission {this.props.missionName}</p>
                    {/*<p id="username" style={{left: '20%'}}> Player {this.props.userName} </p>*/}
                    <p id="agentname">Agent {this.props.agentName}</p>
                    <button id="join" className="joinButton" onClick={this.joinButtonClicked} >Join Game</button>
                </div>
            )
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
    }
}

export default connect(mapStateToProps, {setConn, gameInfo})(gameDisplay);