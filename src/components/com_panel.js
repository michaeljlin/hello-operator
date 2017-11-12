import React, {Component} from 'react';
import './ui.css'
import SpyUI from './spy_ui';
import Player from './player';
import { connect } from 'react-redux';
// import {setConn, displayTE, playerParent} from "../actions";
import {setConn, displayTE} from "../actions";

class ComPanel extends Component {

    constructor(props){
        super(props);
        // this.state = {
        //     displayText: null,
        //     displayTimeElapsed: 'off',
        // };
        // this.state = {
        //     displayText: null,
        // };
        this.buttonClicked = this.buttonClicked.bind(this);
        this.checkBoxClicked = this.checkBoxClicked.bind(this);
    }

    // componentWillMount(){
    //     switch(this.props.comParent){
    //         case 'spy_ui':
    //             this.props.playerParent('spy_ui');
    //             break;
    //         default:
    //             return ""
    //     }
    // }

    buttonClicked (event) {
        // switch(event.target.id){
        //     case '1':
        //         console.log('button 1 was clicked');
        //
        //        break;
        //     case '2':
        //         console.log('button 2 was clicked');
        //         break;
        //     case '3':
        //         console.log('button 3 was clicked');
        //         break;
        //     case '4':
        //         console.log('button 4 was clicked');
        //         break;
        //     case '5':
        //         console.log('button 5 was clicked');
        //         break;
        //     case '6':
        //         console.log('button 6 was clicked');
        //         break;
        //     case '7':
        //         console.log('button 7 was clicked');
        //         break;
        //     case '8':
        //         console.log('button 8 was clicked');
        //         break;
        //     case '9':
        //         console.log('button 9 was clicked');
        //         break;
        // }
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

    // componentDidUpdate() {
    //     if (this.props.displayTime === 'inline-block') {
    //         this.props.conn.conn.conn.conn.emit('com_check_clicked', this.state.displayTimeElapsed);
    //
    //     }
    // }

    render(){
        return(
            <div id={this.props.id} className="comPanel">
                <div className="display"> {this.props.displayText}
                    {/*<Player />*/}
                </div>
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
        displayTime: state.userInterface.displayTime,
        socketConnection: state. socketConnection.setConn,
    };
}

// export default connect(mapStateToProps, {displayTE, setConn, playerParent})(ComPanel);
export default connect(mapStateToProps, {displayTE, setConn})(ComPanel);