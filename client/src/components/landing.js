import React, { Component } from 'react';
import { Link, Route, Redirect } from 'react-router-dom';
import './landing.css';
import CreateModal from './createModal';

class Landing extends Component{
    constructor(props){
        super(props);
        // console.log(props);

        this.state = {
            loginClicked: 'false'
        };

        this.loginClick = this.loginClick.bind(this);

        setTimeout(() => {
            document.getElementById("gameTitle").classList.add("titleAnimation");
            document.getElementById("gameTitle").setAttribute('style', 'display: inline-block')
        }, 2000);

        setTimeout(() => {
            document.getElementById("gameTitle").classList.remove("titleAnimation");
            document.getElementById("gameTitle").classList.add("titleNoAnimation");
            document.getElementById("login").classList.add("loginLink");
            document.getElementById("login").setAttribute('style', 'display: inline-block')
        }, 6000)
    }

    loginClick() {
        if(this.state.loginClicked === 'true'){
            return (
                <CreateModal parent="landing_login"/>
            )
        }
    }

    render(){

        return(
            <div className="landing">
                <ul className="nav">
                    <li className="nav-item">
                        <Link to="/lobby">Lobby</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/game">Game</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/login">Login</Link>
                    </li>
                </ul>
                {/*<h1 className="title" style={{'fontFamily':'Special Elite'}}>Hello, Operator</h1>*/}
                <h1 id="gameTitle" style={{display: 'none'}}>Hello, Operator</h1>
                <div id="login" style={{display: 'none'}} onClick={() => {this.setState({loginClicked: 'true'}); this.loginClick()}}>
                    <p className="loginText" >Login</p>
                </div>
                {this.loginClick()}
            </div>
        )
    }
}

export default Landing;