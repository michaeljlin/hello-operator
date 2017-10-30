import React, { Component } from 'react';
import './app.css';
import { subscribeToTimer } from "../api";
import Spygame from './spygame';

import openSocket from 'socket.io-client';
const  socket = openSocket('http://localhost:8000');

class App extends Component {

    constructor(props){
        super(props);

        // this.handleClick = this.handleClick.bind(this);

        this.state = {
            timestamp: 'no timestamp yet',
            color: 'blue',
            conn: socket,
            objectsToRender: []
        };

        // Can be a different callback function depending on received emit in api.js
        // Therefore, must account for different states using OR for variables
        subscribeToTimer((err, color, object) => this.setState({
            // timestamp
            color: color || 'white',
            objectsToRender: [object] || []
        }), this.state.conn);
    }

    // handleClick(event){
    //     console.log("click triggered!");
    // }

    render(){

        console.log("state current color: ",this.state.color);
        return(

            <div>
                <Spygame conn={this.state.conn} server={this.state.color} newObjects={this.state.objectsToRender}/>
            </div>
        )
    }
}

export default App;
