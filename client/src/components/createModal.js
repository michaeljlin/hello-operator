import React, {Component} from 'react';
import ComPanel from './com_panel';
import cogGlyphicon from '../assets/images/cog_glyphicon.png';
import closeGlyphicon from '../assets/images/close_glyphicon.png';
import HelloOperatorLogin from './hello_operator_login';
import FacebookLogin from './facebook_login';
import Login from './login';
import {connect} from 'react-redux';
import{setConn, modalActions, gameInfo} from "../actions";
import {Link} from 'react-router-dom'
import './ui.css';
import './login.css';


class CreateModal extends Component {
    constructor(props) {
        super(props);
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.joinGame = this.joinGame.bind(this);
    }

    openModal() {
        this.props.modalActions('block', 'none')
    }

    closeModal() {
        this.props.modalActions('none', 'inline-block')
    }

    joinGame() {
        const socket = this.props.socketConnection;
        socket.emit('startGame');
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
                    {/*<button id="openModal" onClick={this.openModal}>*/}
                        {/*<img draggable="false" id="glyphicon" src={cogGlyphicon} style={{display: modalButtonStyle, userSelect:'none'}}/>*/}
                    {/*</button>*/}
                    <div id="joinGameModal" style={{display: modalStyle}}>
                        <p>Are you sure that you want to join this game?</p>
                        <button className="joinButton joinGameButton" onClick={this.closeModal}>No</button>
                        {/*<Link className="joinButton" to={"/game" + gameId}>Yes</Link>*/}
                        <button onClick={this.joinGame} className="joinLink">
                            <Link to={"/game"} style={{color: 'white', textDecoration: 'none'}}>Yes</Link>
                        </button>
                        {/*<Link className="joinLink" to={"/game"} >Yes</Link>*/}
                        <img draggable="false" id="spyModalClose" src={closeGlyphicon} onClick={this.closeModal} style={{display: modalStyle}}/>
                    </div>
                </div>
            )
        }

        if(this.props.parent==="landing_login"){
            const signIn = 'true';
            console.log('CREATE MODAL PROPS:', this.props);
            if(signIn === 'true'){
                return (
                    <div>
                        <div id="loginModal" style={{display: modalStyle}}>
                            <div>
                                <HelloOperatorLogin history={this.props.history} />
                            </div>
                            <button className="joinButton">Facebook Sign In
                                <Link to={"/auth/facebook"}/>
                            </button>
                            <button className="joinButton">
                                <Link to={"/login"}>Sign Up</Link>
                            </button>
                            {/*/!*<Link className="joinButton" to={"/game" + gameId}>Yes</Link>*!/*/}
                            {/*<button onClick={this.joinGame} className="joinLink">*/}
                            {/*<Link to={"/game"} style={{color: 'white', textDecoration: 'none'}}>Yes</Link>*/}
                            {/*</button>*/}
                            {/*/!*<Link className="joinLink" to={"/game"} >Yes</Link>*!/*/}
                            <img draggable="false" id="spyModalClose" src={closeGlyphicon} onClick={this.closeModal} style={{display: modalStyle}}/>
                        </div>
                    </div>
                )
            }

        }

        if(this.props.parent==="landing_login"){
            const signIn = 'true';
            if(signIn === 'true'){
                return (
                    <div>
                        <div id="loginModal" style={{display: modalStyle}}>
                            <div>
                                <HelloOperatorLogin />
                            </div>
                            <button className="joinButton" onClick={this.closeModal}>Facebook Sign In</button>
                            <div>
                                <FacebookLogin />
                            </div>
                            {/*/!*<Link className="joinButton" to={"/game" + gameId}>Yes</Link>*!/*/}
                            {/*<button onClick={this.joinGame} className="joinLink">*/}
                            {/*<Link to={"/game"} style={{color: 'white', textDecoration: 'none'}}>Yes</Link>*/}
                            {/*</button>*/}
                            {/*/!*<Link className="joinLink" to={"/game"} >Yes</Link>*!/*/}
                            <img draggable="false" id="spyModalClose" src={closeGlyphicon} onClick={this.closeModal} style={{display: modalStyle}}/>
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
    }
}

export default connect(mapStateToProps, {setConn, modalActions, gameInfo})(CreateModal)