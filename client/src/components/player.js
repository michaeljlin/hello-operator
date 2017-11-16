import React, {Component} from 'react';
import {connect} from 'react-redux';
import {setConn, playerInfo} from "../actions";
import './player.css';
import profilePic from "../assets/images/test_fb_1.jpg"

class Player extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const socket = this.props.socketConnection;

        // socket.on('updatePlayer', function (playerInfo, numberOfPlayers, createOrJoin) {
        socket.on('updatePlayer', playerInfo => {
            // console.log('player info', playerInfo);
            // console.log(createOrJoin);
            // const allPlayerInfo = {
            //     playerInfo: playerInfo,
            //     // numberOfPlayers: numberOfPlayers,
            //     // createOrJoinStatus: createOrJoin
            // };
            return this.props.playerInfo(playerInfo)
        });
        // socket.emit('updatePlayer', playerInfo, numberOfPlayers, createOrJoin);
    }

    render(){
        const display = this.props.display;
        return(
            <div className= {display ? "lobbyPlayerContainer" : "hide"} >
            {/*<img id="profilePic" src={this.props.player.profilePic}/>*/}
            {/*Below version for testing, src is getting passed in but won't load*/}
            <img id="profilePic" src={profilePic}/>
            <p id="username"> {this.props.player.userName} </p>
            </div>
        )
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