import React, {Component} from 'react';
import './ui.css';
import {connect} from 'react-redux';
import {displayTE} from "../actions/index";

class TimeElapsed extends Component {
    constructor(props){
        super(props);
        // this.state = {
        //     visibility: 'none'
        // }
    }
     render () {
        // debugger;
        // const showTimeElapsed = this.state.visibility;
         const elapsedTimeAreaStyle = this.props.displayTime;
        return(
            <div id="timeElapsedDisplay" >
                <h1 className={elapsedTimeAreaStyle ? "" : "hide"}>Time Elapsed</h1>
            </div>
        )
     }
}

function mapStateToProps(state){
    return{
        displayTime: state.userInterface.displayTime
    }
}

export default connect(mapStateToProps, {displayTE})(TimeElapsed);
