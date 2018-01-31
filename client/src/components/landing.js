import React, { Component } from 'react';
import { Link, Route, Redirect } from 'react-router-dom';
import './landing.css';
import CreateModal from './createModal';
import {connect} from 'react-redux';
import {setConn, modalActions, playerLoggedOut} from "../actions";
import logo from '../assets/images/Spy Logo.jpg';

import intro from '../assets/sounds/Analog-Nostalgia.mp3';

class Landing extends Component{
    constructor(props){
        super(props);

        this.state = {
            loginStatus: 'false',
            music: new Audio(intro),
            openModal: false,
        };

        this.openLogin = this.openLogin.bind(this);

        setTimeout(() => {
            document.getElementById("gameTitle").classList.add("titleAnimation");
            document.getElementById("gameTitle").setAttribute('style', 'display: inline-block')
        }, 2000);

        setTimeout(() => {
            document.getElementById("gameTitle").classList.remove("titleAnimation");
            document.getElementById("gameTitle").classList.add("titleNoAnimation");
            document.getElementById("login").classList.add("loginLink");
            document.getElementById("login").setAttribute('style', 'display: inline-block')
        }, 6000);
    }

    componentWillMount() {
        // const socket = this.props.socketConnection;
        //
        // socket.on('login_status', (authStatus) => {
        //     if(authStatus === 'true') {
        //         this.setState({
        //             loginStatus: 'true'
        //         })
        //     }
        //     if(authStatus === 'false') {
        //         this.setState({
        //             loginStatus: 'false'
        //         })
        //     }
        // });
    }

    componentDidMount(){
        this.state.music.loop = true;
        this.state.music.play();
        this.props.playerLoggedOut(false);
        this.openLogin('false');
    }

    componentWillUnmount(){
        this.state.music.pause();
    }

    openLogin(clickStatus){
        switch(clickStatus) {
            case 'true':
                this.setState({
                    openModal: true
                });
                this.props.modalActions('block', 'none');
                break;
            case 'false':
                this.setState({
                    openModal: false
                });
                this.props.modalActions('none', 'inline-block');
                break;
            default:
                return null
        }
    }

    render(){
        console.log('LANDING PROPS:',this.props);

        //If the login link has not been clicked, don't display the login modal
        if(this.state.openModal === false){
            return (
                <div className="landing">
                    <ul className="nav">
                        {/*<li className="nav-item">*/}
                        {/*<Link to="/lobby">Lobby</Link>*/}
                        {/*</li>*/}
                        {/*<li className="nav-item">*/}
                        {/*<Link to="/game">Game</Link>*/}
                        {/*</li>*/}
                        {/*<li className="nav-item">*/}
                        {/*<Link to="/login">Login</Link>*/}
                        {/*</li>*/}
                    </ul>
                    <h1 id="gameTitle" style={{display: 'none'}}>Hello, Operator</h1>
                    <div id="login" style={{display: 'none'}} onClick={() => {
                        this.openLogin('true')
                    }}>
                        <p className="loginText">Login</p>
                    </div>
                    {/*<CreateModal history={this.props.history} parent="landing_login"/>*/}
                </div>
            );
        }

        //If the login link has been clicked, also render the login modal
        else if(this.state.openModal === true){
            return (
                <div className="landing">
                    <ul className="nav">
                        {/*<li className="nav-item">*/}
                        {/*<Link to="/lobby">Lobby</Link>*/}
                        {/*</li>*/}
                        {/*<li className="nav-item">*/}
                        {/*<Link to="/game">Game</Link>*/}
                        {/*</li>*/}
                        {/*<li className="nav-item">*/}
                        {/*<Link to="/login">Login</Link>*/}
                        {/*</li>*/}
                    </ul>
                    <h1 id="gameTitle" style={{display: 'none'}}>Hello, Operator</h1>
                    <div id="login" style={{display: 'none'}} onClick={() => {
                        this.openLogin('true')
                    }}>
                        <p className="loginText">Login</p>
                    </div>
                    <CreateModal history={this.props.history} parent="landing_login"/>
                </div>
            );
        }


    };
}

function mapStateToProps(state){
    return {
        modalDisplay: state.userInterface.modalActions,
        socketConnection: state.socketConnection.setConn,
        playerLog: state.playerInformation.playerLogStatus,
    }
}

export default connect(mapStateToProps, {setConn, modalActions, playerLoggedOut})(Landing);