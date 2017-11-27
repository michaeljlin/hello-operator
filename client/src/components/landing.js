import React, { Component } from 'react';
import { Link, Route, Redirect } from 'react-router-dom';
import './landing.css';

class Landing extends Component{
    constructor(props){
        super(props);
        // console.log(props);

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
                <Link id="login" style={{display: 'none'}} to="/login">
                    <p className="loginText" >Login</p>
                </Link>
            </div>
        )
    }
}

export default Landing;