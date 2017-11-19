import React, {Component} from 'react';
import Spygame from './spygame';
import UI from './ui';
import {connect} from 'react-redux';
import {setConn, gameInfo} from "../actions"

class GameContainer extends Component{

    componentWillMount(){
        const eventId = 'join game';
        const gameCreatorId = 'dummy1234';
        const playerIds = {
            currentPlayer: this.props.socketConnection.id,
            gameCreatorPlayer: gameCreatorId
        };
        const gameId = this.props.openGame.placeId;
        this.props.socketConnection.emit('join_button_pressed', eventId, gameId, playerIds);
    }

    render(){
        return(
            <div>
                <Spygame/>
                <UI/>
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