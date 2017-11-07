import React, {Component} from 'react';
import './ui.css';

class TimeElapsed extends Component {
    constructor(props){
        super(props);
        this.state = {
            visibility: 'none'
        }
    }
     render () {
        const showTimeElapsed = this.state.visibility;
        return(
            <div id="timeElapsedDisplay" style={{display: showTimeElapsed}}>
                <h1>Time Elapsed</h1>
            </div>
        )
     }
}
export default TimeElapsed