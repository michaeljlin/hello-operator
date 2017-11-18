import React, { Component } from 'react';
import { Link, Route, Redirect } from 'react-router-dom';
import './landing.css';

class Landing extends Component{
    constructor(props){
        super(props);
        // console.log(props);
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
                        <Link to="/Login">Login</Link>
                    </li>
                </ul>
                <h1 className="title" style={{'fontFamily':'Special Elite'}}>Hello Operator,</h1>
            </div>
        )
    }
}

export default Landing;