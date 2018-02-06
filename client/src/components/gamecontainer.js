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

        // const gameSocket = openSocket('localhost:8001', {
        //     reconnection: false
        // });

        this.state = {
            role: null,
            gameSocket: null,
        };

        const socket = this.props.socketConnection;

        console.log('socket in gamecontainer: ', socket);

        socket.emit('clientReady');

        // socket.on('serverReady', ()=>{
        //     console.log('got game server ready notification');
        //     socket.emit('clientReady');
        // });

        socket.on('initConn', (port)=>{
            console.log('establishing connection');

            if(this.state.gameSocket === null){
                const gameSocket = openSocket(domain+port,{
                    reconnection: false
                });

                this.setState({gameSocket: gameSocket});
            }
        });
    }

    componentDidMount(){
        // const eventId = 'join game';
        // const gameCreatorId = 'dummy1234';
        // const playerIds = {
        //     currentPlayer: this.props.socketConnection.id,
        //     gameCreatorPlayer: gameCreatorId
        // };
        // const gameId = this.props.openGame.placeId;
        // this.props.socketConnection.emit('join_button_pressed', eventId, gameId, playerIds);

        const socket = this.props.socketConnection;
        // socket.on('initConn', (port)=>{
        //     const gameSocket = openSocket('localhost:'+port,{
        //         reconnection: false
        //     });
        //
        //     this.setState({gameSocket: gameSocket});
        // });

        socket.on('gameEnd',(thisGameID)=>{
            console.log('received game end notification');

            this.props.history.push('/lobby');
        });

        socket.on('role', (role)=>{
            console.log('new role received: ', role);

            this.setState({
                role: role
            });
        });
    }

    componentWillUnmount(){
        // this.props.socketConnection.close();
        const socket = this.props.socketConnection;
        socket.removeListener('role');
        socket.removeListener('gameEnd');
        socket.removeListener('initConn');

//         let uuid = socket.on("event", someHandler)
// socket.off(id: uuid)
    }

    render(){
        const role = this.state.role;
        const gameSocket = this.state.gameSocket;

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