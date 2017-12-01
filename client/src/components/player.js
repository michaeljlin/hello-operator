import React, {Component} from 'react';
import {connect} from 'react-redux';
import {setConn, playerInfo} from "../actions";
import './player.css';
// import profilePic from "../assets/images/test_fb_1.jpg"

class Player extends Component {
    constructor(props) {
        super(props);
    }

    // componentDidMount() {
    //     const socket = this.props.socketConnection;
    //
    //     // socket.on('updatePlayer', function (playerInfo, numberOfPlayers, createOrJoin) {
    //     socket.on('updatePlayer', playerData => {
    //         // console.log('player info', playerInfo);
    //         // console.log(createOrJoin);
    //         // const allPlayerInfo = {
    //         //     playerInfo: playerInfo,
    //         //     // numberOfPlayers: numberOfPlayers,
    //         //     // createOrJoinStatus: createOrJoin
    //         // };
    //         return this.props.playerInfo(playerData)
    //     });
    //     // socket.emit('updatePlayer', playerInfo, numberOfPlayers, createOrJoin);
    // }

    render(){
        const display = this.props.display;
        if(this.props.userName !== undefined){
            return(
                <div className= {display ? "lobbyPlayerContainer" : "hide"} >
                    {/*<img id="profilePic" src= {this.props.picture}/>*/}
                    <img id="profilePic" src={this.props.picture}/>
                    <p id="username" style={{left: '20%'}}> Player {this.props.userName} </p>
                    <p id="agentNamePlayerContainer">Agent {this.props.agentName}</p>
                </div>
            )
        }
       else if (this.props.userName === undefined){
            return(
                <div className= {display ? "lobbyPlayerContainer" : "hide"} >
                    <p id="username" style={{left: '20%'}}>Loading player data</p>
                </div>
            )
        }
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