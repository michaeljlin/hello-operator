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

class App extends Component {

    constructor(props){
        super(props);
    }

    render(){
        return(
            <div className="spyGame">
                <Switch>
                    <Route exact path="/" component={Landing} />
                    <Route path="/game" component={auth(GameContainer)}/>
                    <Route path="/lobby" component={auth(Lobby)}/>
                    <Route path="/about" component={About}/>
                </Switch>
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
