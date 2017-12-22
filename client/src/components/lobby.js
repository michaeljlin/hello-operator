import React, {Component} from 'react';
import JoinOrCreateGame from './join_or_create_game';
import './lobby.css';
import OpenGames from './open_games';
import {connect} from 'react-redux';
import {modalActions} from "../actions";

class Lobby extends Component {

    render () {
        // this.props.modalActions('none', 'inline-block');
        return (
            <div id="lobbyContainer">
                <div>
                    <JoinOrCreateGame />
                </div>

                <div id="open_games_container">
                    {/*Passing in the game tracker as a prop here ensures that when a new game is created and the redux action receives the new game information, this component is updated */}
                    <OpenGames gameArray= {this.props.openGames.gameTracker}/>
                </div>
                {/*<div id="lobbyPlaceholder_2"> </div>*/}
            </div>
        )
    }
}

function mapStateToProps(state){
    return{
        openGames: state.gameInformation.gameArrays,
    }
}

export default connect(mapStateToProps, {modalActions})(Lobby)