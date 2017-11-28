import React, { Component } from 'react';
import { Link, Route, Redirect } from 'react-router-dom';
import './landing.css';
import CreateModal from './createModal';
import {connect} from 'react-redux';
import {modalActions} from "../actions";

class Landing extends Component{
    constructor(props){
        super(props);

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
        }, 6000)
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
                <div id="login" style={{display: 'none'}} onClick={() => {this.openLogin('true')}}>
                    <p className="loginText" >Login</p>
                </div>
                <CreateModal history={this.props.history} parent="landing_login"/>
            </div>
        )
    }
}

function mapStateToProps(state){
    return {
        modalDisplay: state.userInterface.modalActions,
    }
}

export default connect(mapStateToProps, {modalActions})(Landing);