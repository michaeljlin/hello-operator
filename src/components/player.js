import React, {Component} from 'react';
import {connect} from 'react-redux';
// import {setConn, serverData, playerParent, comParent} from "../actions";
import {setConn, playerInfo} from "../actions";
import './player.css';

class Player extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        const socket = this.props.socketConnection;

        socket.on('updatePlayer', playerInfo =>{
            console.log(playerInfo);
            return this.props.playerInfo(playerInfo)
        });

    }




    // render() {
    //     console.log('Player props', this.props.parent);
    //     console.log('ComPlayer props', this.props.whichComParent);
    //     const whichParent = ()=>{
    //         if(!this.props.parent === ""){
    //             return this.props.parent
    //         }
    //         else if(!this.props.whichComParent === ""){
    //             let theParent = this.props.whichComParent
    //         }
    //     };
    //
    //     return (
    //         <div>
    //
    //             {/*//Image element for avatar to be used during game play, add here when main game constructor fucntion is ready*/}
    //
    //             {/*<div id="gamePlayerContainer" className = {whichParent ==='join_game' ? "" : "hide"}>*/}
    //                 {/*<img id="sprite" src={spriteTest} />*/}
    //             {/*</div>*/}
    //
    //             <div id="lobbyPlayerContainer" className = {whichParent ==='join_game' ? "" : "hide"}>
    //                 <img id="profilePic" src={fbTest} />
    //                 <p id="username">Superusername007</p>
    //             </div>
    //
    //             <div id="spyUiPlayerContainer" className = {whichParent === 'spy_ui' ? "" : "hide"}>
    //                 <p id="agentName">Agent Coughing Coyote</p>
    //             </div>
    //
    //             {/*//Agent name for spy UI*/}
    //             {/*//Agent name for spymaster UI*/}
    //         </div>
    //     )
    // }
    render(){
        return(
            <div> </div>
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

// export default connect(mapStateToProps, {setConn, serverData, playerParent, comParent})(Player);
export default connect(mapStateToProps, {setConn, playerInfo})(Player);