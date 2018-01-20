import React, {Component} from 'react';
import Spygame from './spygame';
import UI from './ui';
import {connect} from 'react-redux';
import {setConn, gameInfo} from "../actions"

class GameContainer extends Component{

    constructor(props){
        super(props);
        this.state = {
            role: null
        }
    }

    componentWillMount(){
        // const eventId = 'join game';
        // const gameCreatorId = 'dummy1234';
        // const playerIds = {
        //     currentPlayer: this.props.socketConnection.id,
        //     gameCreatorPlayer: gameCreatorId
        // };
        // const gameId = this.props.openGame.placeId;
        // this.props.socketConnection.emit('join_button_pressed', eventId, gameId, playerIds);

        const socket = this.props.socketConnection;

        socket.on('gameEnd',(missionName)=>{
            console.log('received game end notification');

            // socket.emit('deleteGame', (missionName));

            this.props.history.push('/lobby');
        });

        socket.on('role', (role)=>{
            console.log('new role received: ', role);

            this.setState({
                role: role
            });
        });
    }

    // componentWillUnmount(){
    //     this.props.socketConnection.close();
    // }

    render(){
        const role = this.state.role;
        return(
            <div>
                <div id="gameContainer"  style={{pointerEvents: 'auto'}}>
                    <Spygame />
                </div>
                <UI role={role} style={{pointerEvents: 'none'}}/>
            </div>
        )
    }
}

function mapStateToProps(state){
    return {
        socketConnection: state.socketConnection.setConn,
        openGame: state.gameInformation.gameObject,
    }

}

export default connect(mapStateToProps, {setConn,gameInfo})(GameContainer)