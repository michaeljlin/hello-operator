import React, { Component } from 'react';
import { Link, Route, Switch, withRouter } from 'react-router-dom';

import Landing from './landing';

import Login from "./login";
import Gamecontainer from './gamecontainer.js';
import Lobbycontainer from './lobbycontainer.js'

import openSocket from 'socket.io-client';
import { connect } from 'react-redux';
import { setConn } from "../actions"


class App extends Component {

    constructor(props){
        super(props);

        // this.handleClick = this.handleClick.bind(this);

        // this.state = {
        //     timestamp: 'no timestamp yet',
        //     color: 'white',
        //     conn: this.props.socketConnection,
        //     objectsToRender: [],
        //     player: {}
        // };


        // Can be a different callback function depending on received emit in api.js
        // Therefore, must account for different states using OR for variables
        // subscribeToTimer((err, color, object) => this.setState({
        //     // timestamp
        //     color: color || 'white',
        //     objectsToRender: object || []
        // }), this.state.conn);

        // socket.on('update', newState => this.setState({
        //         objectsToRender: newState || []
        // }));

        // socket.on('player', newState => {
        //     console.log(`got: ${newState}`);
        //     this.setState({player: newState});
        // });
        const socket = openSocket('http://localhost:8000', {
            reconnection: false
        });
        this.state = {socket: socket};

        this.props.setConn(socket);
    }

    // handleClick(event){
    //     console.log("click triggered!");
    // }

    componentWillMount(){
        console.log(this);
        this.state.socket.io._reconnection = false;
    }

    render(){
        // console.log('socket connection', this.state.conn);
        return(
            <div className="spyGame">
                <Switch>
                    <Route exact path="/" component={Landing} />
                    <Route path="/game" component={Gamecontainer}/>
                    <Route path="/lobby" component={Lobbycontainer}/>
                    <Route path="/login" component={Login}/>
                    {/*<Route path="/lobby" component={UI}/>*/}
                </Switch>

            </div>
        )
    }
}

function mapStateToProps(state){
    // let setConnect = state.socketConnection;
    // setConnect._reconnection = false;

    return{
        socketConnection: state.socketConnection,
        player: state.playerInformation.playerObject
    }
}

function mapDispatchToProps(dispatch){
    return {
        setConn: socket => {
            dispatch(setConn(socket))
        }
    }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));

// export default App
