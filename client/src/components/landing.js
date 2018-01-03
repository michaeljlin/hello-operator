import React, { Component } from 'react';
import { Link, Route, Redirect } from 'react-router-dom';
import './landing.css';
import CreateModal from './createModal';
import {connect} from 'react-redux';
import {setConn, modalActions} from "../actions";
import logo from '../assets/images/Spy Logo.jpg';

import intro from '../assets/sounds/Analog-Nostalgia.mp3';

class Landing extends Component{
    constructor(props){
        super(props);

        this.state = {
            loginStatus: 'false',
            music: new Audio(intro)
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
        const socket = this.props.socketConnection;

        socket.on('login_status', (authStatus) => {
            if(authStatus === 'true') {
                this.setState({
                    loginStatus: 'true'
                })
            }
            if(authStatus === 'false') {
                this.setState({
                    loginStatus: 'false'
                })
            }
        });
    }

    componentDidMount(){
        this.state.music.loop = true;
        // this.state.music.play();
    }

    componentWillUnmount(){
        this.state.music.pause();
    }

    openLogin(clickStatus){
        switch(clickStatus) {
            case 'true':
                this.props.modalActions('block', 'none');
                break;
            default:
                return null
        }
    }

    render(){
        console.log('LANDING PROPS:',this.props);

            // switch(this.state.loginStatus) {
            //     case 'false':
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
                            {/*<h1 className="title" style={{'fontFamily':'Special Elite'}}>Hello, Operator</h1>*/}
                            <h1 id="gameTitle" style={{display: 'none'}}>Hello, Operator</h1>
                            <div id="login" style={{display: 'none'}} onClick={() => {
                                this.openLogin('true')
                            }}>
                                <p className="loginText">Login</p>
                            </div>
                            <CreateModal history={this.props.history} parent="landing_login"/>
                        </div>
                    );

                // case 'true' :
                //     return (
                //         <div className="landing">
                //             <ul className="nav">
                //                 <li className="nav-item">
                //                     <Link to="/lobby">Lobby</Link>
                //                 </li>
                //                 <li className="nav-item">
                //                     <Link to="/game">Game</Link>
                //                 </li>
                //                 <li className="nav-item">
                //                     <Link to="/login">Login</Link>
                //                 </li>
                //             </ul>
                //             {/*<h1 className="title" style={{'fontFamily':'Special Elite'}}>Hello, Operator</h1>*/}
                //             <h1 id="gameTitle" style={{display: 'none'}}>Hello, Operator</h1>
                //             <div id="login" style={{display: 'none'}}>
                //                 <Link to={"/lobby"} className="loginText" style={{width: '17vw'}}> Play Again</Link>
                //             </div>
                //             <CreateModal history={this.props.history} parent="landing_login"/>
                //         </div>
                //     )
            // }
        };

        // return(
        //     <div className="landing">
        //         <ul className="nav">
        //             <li className="nav-item">
        //                 <Link to="/lobby">Lobby</Link>
        //             </li>
        //             <li className="nav-item">
        //                 <Link to="/game">Game</Link>
        //             </li>
        //             <li className="nav-item">
        //                 <Link to="/login">Login</Link>
        //             </li>
        //         </ul>
        //         {/*<h1 className="title" style={{'fontFamily':'Special Elite'}}>Hello, Operator</h1>*/}
        //         <h1 id="gameTitle" style={{display: 'none'}}>Hello, Operator</h1>
        //         <div id="login" style={{display: 'none'}} onClick={() => {this.openLogin('true')}}>
        //             <p className="loginText" >Login</p>
        //         </div>
        //         <CreateModal history={this.props.history} parent="landing_login"/>
        //     </div>
        // )
    }

function mapStateToProps(state){
    return {
        modalDisplay: state.userInterface.modalActions,
        socketConnection: state.socketConnection.setConn,
    }
}

export default connect(mapStateToProps, {setConn, modalActions})(Landing);