import React, {Component} from 'react';
import {connect} from 'react-redux';
import {setConn, playerInfo} from "../actions";
import './player.css';

class Player extends Component {
    constructor(props) {
        super(props);
    }

    render(){
        const display = this.props.display;

        let pictureSource = this.props.picture;

        if(this.props.picture === undefined){
            pictureSource = '../assets/images/default_profile.jpg'
        }

        // if(this.props.userName !== undefined){
            console.log('Player component player info', this.props.agentName );
            return(
                <div className= {display ? "lobbyPlayerContainer" : "hide"} >
                    {/*Commenting this out until facebook login is complete*/}
                    {/*<img id="profilePic" src={pictureSource}/>*/}
                    {/*If the player viewing the game is the same player as the one with the below agent and user names, change the text to green*/}
                    <p id="agentNamePlayerContainer" style={this.props.player.agentName === this.props.agentName ? {color: 'limegreen'} : {color: 'white'}}>Agent:  {this.props.agentName}</p>
                    <p id="username" style={this.props.player.userName === this.props.userName ? {color: 'limegreen'} : {color: 'white'}}> Player: {this.props.userName} </p>
                </div>
            )
        // }
       // else if (this.props.userName === undefined){
       //      return(
       //          <div className= {display ? "lobbyPlayerContainer" : "hide"} >
       //              <p id="username" style={{left: '20%'}}>Loading player data</p>
       //          </div>
       //      )
       //  }
    }
}

function mapStateToProps(state){
    return{
        socketConnection: state.socketConnection.setConn,
        // data: state,
        // parent: state.playerInformation.isParent,
        // whichComParent: state.comInformation.isComParent
        player: state.playerInformation.playerObject
    }
}

export default connect(mapStateToProps, {setConn, playerInfo})(Player);