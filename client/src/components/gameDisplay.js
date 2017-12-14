import React, {Component} from 'react';
import {connect} from 'react-redux';
import {setConn, gameInfo} from "../actions";
import './player.css';
import './lobby.css';
// import profilePic from "../assets/images/test_fb_1.jpg"

class gameDisplay extends Component {
    constructor(props) {
        super(props);
        this.state = {
            displaySize: '7vh',
            displayArrow: 'arrow_drop_down',
        };

        this.changeDisplayHeight = this.changeDisplayHeight.bind(this);
    }

    // joinButtonClicked(event) {
    //     const eventId = event.target.id;
    //     const playerId = this.props.socketConnection.id;
    //     this.props.socketConnection.emit('join_button_pressed', eventId, playerId);
    //     // this.props.playerRole('spy')
    // }


    changeDisplayHeight() {

        if(this.state.displaySize === '7vh') {
            this.setState({
                displaySize: '20vh',
                displayArrow: 'arrow_drop_up'
            });
        }
        else if(this.state.displaySize === '20vh') {
            this.setState({
                displaySize: '7vh',
                displayArrow: 'arrow_drop_down'
            })
        }
    }


    render(){
        const display = this.props.display;
        const thisPlayer = this.props.player.userName;

        let displayHeight = this.state.displaySize;
        let displayArrow = this.state.displayArrow;

        //The game display will only be rendered when all of the information has been passed down to this component
        if(this.props.userName !== undefined){

            //If the display has the minimized view
            if(this.state.displaySize === '7vh'){
                return(
                    <div className= {display ? "lobbyGameContainer" : "hide"} style={{height: displayHeight}} onClick={this.changeDisplayHeight} >
                        {/*<img id="profilePic" src= {this.props.picture}/>*/}
                        <p className="missionname">Mission {this.props.missionName}</p>
                        {/*<p id="username" style={{left: '20%'}}> Player {this.props.userName} </p>*/}
                        <p className="agentname">Agent {this.props.agentName}</p>
                        <i id="game_display_arrow" className="small material-icons" >{displayArrow}</i>
                    </div>
                )
            }

            //If the display has the maximized view
            if(this.state.displaySize === '20vh'){
                return(
                    <div id="maxGameDisplay" className= {display ? "lobbyGameContainer" : "hide"} style={{height: displayHeight}} onClick={this.changeDisplayHeight}>
                        {/*<img id="profilePic" src= {this.props.picture}/>*/}
                        <p className="missionname">Mission {this.props.missionName} </p>
                        {/*<p id="username" style={{left: '20%'}}> Player {this.props.userName} </p>*/}
                        <p className="agentname">Agent {this.props.agentName}</p>
                        <label className="switch">
                            <input type="checkbox"/>
                                <span className="slider round"> </span>
                        </label>
                        <p className="agentname" style={{top: '74%'}}>Agent </p>
                        <label className="switch">
                            <input type="checkbox"/>
                                <span className="slider round"> </span>
                        </label>
                        <i id="game_display_arrow" className="small material-icons" >{displayArrow}</i>
                        {/*The join button only displays if the game was not created by the currently logged in user*/}
                        <button id="join" className= { this.props.userName === thisPlayer ? "hide" : "joinButton"} onClick={this.joinButtonClicked } >Join Game</button>
                    </div>
                )
            }
        }

        //This should never appear on the dom, but until the username is defined in this render, something has to render
        else if (this.props.userName === undefined){
            return(
                <div className= {display ? "lobbyGameContainer" : "hide"} >
                    {/*<p id="username" style={{left: '20%'}}>Loading player data</p>*/}
                </div>
            )
        }
    }
}

function mapStateToProps(state){
    return{
        socketConnection: state.socketConnection.setConn,
        openGames: state.gameInformation.gameArrays,
        player: state.playerInformation.playerObject,
    }
}

export default connect(mapStateToProps, {setConn, gameInfo})(gameDisplay);