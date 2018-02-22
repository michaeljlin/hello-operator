import React, {Component} from 'react';
import ComPanel from './com_panel';
import cogGlyphicon from '../assets/images/cog_glyphicon.png';
import closeGlyphicon from '../assets/images/close_glyphicon.png';
import HelloOperatorLogin from './hello_operator_login';
import FacebookLogin from './facebook_login';
import Login from './login';
import {connect} from 'react-redux';
import{setConn, modalActions, gameInfo, signUp} from "../actions";
import {Link} from 'react-router-dom'
import './ui.css';
import './login.css';

class CreateModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
           signUpClicked: 'false'
        };

        this.openModal = this.openModal.bind(this);
        this.joinGame = this.joinGame.bind(this);
        this.changeSignUpClicked = this.changeSignUpClicked.bind(this);
    }

    openModal() {
        this.props.modalActions('block', 'none')
    }

    joinGame() {
        const socket = this.props.socketConnection;
        socket.emit('startGame');
    }

    changeSignUpClicked(){
        if(this.props.signUpClicked === 'false'){
            this.props.signUp('true');
        }
        if(this.props.signUpClicked === 'true'){
            this.props.signUp('false')
        }
    }


    render() {
        const modalStyle = this.props.modalDisplay.modalVisibility;
        const modalButtonStyle = this.props.modalDisplay.glyphiconVisibility;

        if(this.props.parent==="spy_ui"){
            return (
                <div>
                    <button id="openModal" onClick={this.openModal}>
                        <img draggable="false" id="glyphicon" src={cogGlyphicon} style={{display: modalButtonStyle, userSelect:'none'}}/>
                    </button>
                    <div id="spyModal" style={{display: modalStyle}}>
                        <ComPanel  id="spyModalComPanel"/>
                        <img draggable="false" id="spyModalClose" src={closeGlyphicon} onClick={this.closeModal} style={{display: modalStyle}}/>
                    </div>
                </div>
            )
        }
        if(this.props.parent==="open_game"){
            const gameId = this.props.openGame;
            return (
                <div>
                    <div id="joinGameModal" style={{display: modalStyle}}>
                        <p>Are you sure that you want to join this game?</p>
                        <button className="joinButton joinGameButton" onClick={this.closeModal}>No</button>
                        <button onClick={this.joinGame} className="joinLink">
                            <Link to={"/game"} style={{color: 'white', textDecoration: 'none'}}>Yes</Link>
                        </button>
                        <img draggable="false" id="spyModalClose" src={closeGlyphicon} onClick={this.closeModal} style={{display: modalStyle}}/>
                    </div>
                </div>
            )
        }



        if(this.props.parent==="landing_login"){

            console.log('CREATE MODAL PROPS:', this.props);

            if(this.props.signUpClicked=== 'false'){
                return (
                    <div>
                        <div id="loginModal" style={{display: modalStyle}}>
                            <div>
                                <HelloOperatorLogin history={this.props.history} />
                            </div>
                            <button className="login_button" id="facebookButton">
                            </button>
                            <button className="login_button" id="signUpButton" onClick={this.changeSignUpClicked}>
                                <p id="signUpButtonText" onClick={this.changeSignUpClicked}>Sign Up</p>
                            </button>
                            {/*<img draggable="false" id="spyModalClose" src={closeGlyphicon} onClick={this.closeModal} style={{display: modalStyle}}/>*/}
                        </div>
                    </div>
                )
            }

            if(this.props.signUpClicked=== 'true'){
                return (
                    <div>
                        <div id="loginModal" style={{display: modalStyle}}>
                            <div>
                                <Login history={this.props.history} />
                            </div>
                            <button className="login_button" id="signUpButton">
                                <p id="signUpButtonText" style={{fontWeight: 'bold'}} onClick={this.changeSignUpClicked}>Sign In</p>
                            </button>
                        </div>
                    </div>
                )
            }

        }
    }
}

function mapStateToProps(state){
    return{
        socketConnection: state.socketConnection.setConn,
        modalDisplay: state.userInterface.modalActions,
        openGame: state.gameInformation.gameObject,
        signUpClicked: state.userInterface.signUpClick,
    }
}

export default connect(mapStateToProps, {setConn, modalActions, gameInfo, signUp})(CreateModal)