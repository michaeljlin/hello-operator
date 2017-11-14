import React, { Component } from 'react';
import Spygame from './spygame';
import { Link, Route } from 'react-router-dom';
import UI from './ui';
import Lobby from './lobby';
import Player from './player';
import Login from "./login";
import openSocket from 'socket.io-client';
import {connect} from 'react-redux';
import {setConn} from "../actions"


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
        this.props.setConn(socket)
    }

    // handleClick(event){
    //     console.log("click triggered!");
    // }

    render(){
        // console.log('socket connection', this.state.conn);
        return(

            <div className="spyGame">

                <Route exact path="/" component={Spygame} />
                <Route path="/lobby" component={Player}/>
                <Route path="/lobby" component={Lobby}/>
                <Route path="/login" component={Login}/>

                <UI />

            </div>
        )
    }
}

function mapStateToProps(state){
    return{
        socketConnection: state.socketConnection,
    }
}

function mapDispatchToProps(dispatch){
    return {
        setConn: socket => {
            dispatch(setConn(socket))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);

// export default App
