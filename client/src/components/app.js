import React, { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';

import Landing from './landing';
import Login from "./login";
import GameContainer from './gamecontainer.js';
import Lobby from './lobby.js';
import HelloOperatorLogin from './hello_operator_login';
import auth from '../hoc/auth';
import { connect } from 'react-redux';
import About from './about';

import './appCatcher.css';

class App extends Component {

    constructor(props){
        super(props);
    }

    render(){

        return(
            <div className="appPages">
                <div className="portraitwarning">
                    <p>This app is not supported in portrait mode.</p>
                </div>
                <div className="mobileWarning">
                    <p>This app is not supported on mobile devices.</p>
                </div>
                <div className="spyGame">
                    <Switch>
                        <Route exact path="/" component={Landing} />
                        <Route path="/game" component={auth(GameContainer)}/>
                        <Route path="/lobby" component={auth(Lobby)}/>
                        <Route path="/about" component={About}/>
                    </Switch>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state){

    return{
        socketConnection: state.socketConnection,
        player: state.playerInformation.playerObject
    }
}
export default withRouter(connect(mapStateToProps)(App));
