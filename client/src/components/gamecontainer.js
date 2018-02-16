import React, {Component} from 'react';
import Spygame from './spygame';
import UI from './ui';
import openSocket from 'socket.io-client';
import {connect} from 'react-redux';
import {setConn, gameInfo} from "../actions"
import domain from '../../domain';

class GameContainer extends Component{

    constructor(props){
        super(props);

        this.state = {
            role: null,
            gameSocket: null,
        };

        const socket = this.props.socketConnection;

        console.log('socket in gamecontainer: ', socket);

        socket.emit('clientReady');

        socket.on('initConn', (port, role)=>{
            console.log('establishing connection');

            if(this.state.gameSocket === null){
                const gameSocket = openSocket(domain+port,{
                    reconnection: false
                });

                this.setState({
                    role: role,
                    gameSocket: gameSocket
                });
            }
        });
    }

    componentDidMount(){

        const socket = this.props.socketConnection;

        console.log('socket in gamecontainer at role listener: ', socket);

        socket.on('gameEnd',(thisGameID)=>{
            console.log('received game end notification');

            this.props.history.push('/lobby');
        });

    }

    componentWillUnmount(){
        const socket = this.props.socketConnection;
        socket.removeListener('role');
        socket.removeListener('gameEnd');
        socket.removeListener('initConn');

    }

    render(){
        const role = this.state.role;
        const gameSocket = this.state.gameSocket;
        console.log('role is: ', role);
        if(gameSocket !== null){
            return(
                <div>
                    <div id="gameContainer"  style={{pointerEvents: 'auto'}}>
                        <Spygame gameSocket={this.state.gameSocket}/>
                    </div>
                    <UI role={role} gameSocket={this.state.gameSocket} history={this.props.history} style={{pointerEvents: 'none'}}/>
                </div>
            )
        }
        else{
            return(<div>Establishing Connection...</div>);
        }

        // return(
        //     <div>
        //         <div id="gameContainer"  style={{pointerEvents: 'auto'}}>
        //             <Spygame gameSocket={this.state.gameSocket}/>
        //         </div>
        //         <UI role={role} gameSocket={this.state.gameSocket} style={{pointerEvents: 'none'}}/>
        //     </div>
        // )
    }
}

function mapStateToProps(state){
    return {
        socketConnection: state.socketConnection.setConn,
        openGame: state.gameInformation.gameObject,
    }
}

export default connect(mapStateToProps, {setConn,gameInfo})(GameContainer)