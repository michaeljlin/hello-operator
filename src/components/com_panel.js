import React, {Component} from 'react';
import './ui.css'
import { connect } from 'react-redux';
import {setConn, displayTE, playerInfo} from "../actions";

class ComPanel extends Component {

    constructor(props){
        super(props);
        this.buttonClicked = this.buttonClicked.bind(this);
        this.checkBoxClicked = this.checkBoxClicked.bind(this);
    }

    buttonClicked (event) {
        this.props.socketConnection.emit('com_button_press', event.target.id);
    }

    checkBoxClicked () {
        if(this.props.displayTime === false){
            this.props.displayTE(true);
            this.props.socketConnection.emit('com_check_clicked', this.props.displayTime);
        }
        else if (this.props.displayTime === true){
            this.props.displayTE(false);
        }

    }

    render(){
        return(
            <div id={this.props.id} className="comPanel">
                <div className="display"> {this.props.player.agentName}</div>
                <button id="1" onClick={this.buttonClicked} className="btn primary">1</button>
                <button id="2" onClick={this.buttonClicked} className="btn primary">2</button>
                <button id="3" onClick={this.buttonClicked} className="btn primary">3</button>
                <button id="4" onClick={this.buttonClicked} className="btn primary">4</button>
                <button id="5" onClick={this.buttonClicked} className="btn primary">5</button>
                <button id="6" onClick={this.buttonClicked} className="btn primary">6</button>
                <button id="7" onClick={this.buttonClicked} className="btn primary">7</button>
                <button id="8" onClick={this.buttonClicked} className="btn primary">8</button>
                <button id="9" onClick={this.buttonClicked} className="btn primary">9</button>
                <input  onClick={this.checkBoxClicked} type="checkbox" name="timeElapsed" value="on" />Time Elapsed
            </div>
        )
    }
}

function mapStateToProps(state){
    return{
        player: state.playerInformation.playerObject,
        displayTime: state.userInterface.displayTime,
        socketConnection: state. socketConnection.setConn,
    };
}

export default connect(mapStateToProps, {displayTE, setConn, playerInfo})(ComPanel);