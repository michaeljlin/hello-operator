import React, { Component } from 'react';
import { subscribeToTimer } from "../api";
import Spygame from './spygame';

import openSocket from 'socket.io-client';
// const  socket = openSocket('http://10.2.124.253:8000');
const socket = openSocket('http://localhost:8000');

import UI from './ui';

class App extends Component {

    constructor(props){
        super(props);

        // this.handleClick = this.handleClick.bind(this);

        this.state = {
            timestamp: 'no timestamp yet',
            color: 'white',
            conn: socket,
            objectsToRender: [],
            player: {}
        };

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
    }

    // handleClick(event){
    //     console.log("click triggered!");
    // }

    render(){

        return(

            <div className="spyGame">
                <Spygame conn={this.state.conn} server={this.state.color} newObjects={this.state.objectsToRender} />
                <UI conn={this.state.conn} />
            </div>
        )
    }
}

export default App;
