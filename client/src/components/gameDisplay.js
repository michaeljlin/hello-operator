import React, {Component} from 'react';
import {connect} from 'react-redux';
import {setConn, gameInfo} from "../actions";
import './player.css';
// import profilePic from "../assets/images/test_fb_1.jpg"

class gameDisplay extends Component {
    constructor(props) {
        super(props);
    }


    render(){
        debugger;
        const display = this.props.display;

        if(this.props.userName !== undefined){
            return(
                <div className= {display ? "lobbyPlayerContainer" : "hide"} >
                    {/*<img id="profilePic" src= {this.props.picture}/>*/}
                    <p id="missionname" style={{left:'5%'}}>MIssion {this.props.missionName}</p>
                    <p id="username" style={{left: '20%'}}> Player {this.props.userName} </p>
                    <p id="agentNamePlayerContainer">Agent {this.props.agentName}</p>
                </div>
            )
        }
        else if (this.props.userName === undefined){
            return(
                <div className= {display ? "lobbyPlayerContainer" : "hide"} >
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