import React, {Component} from 'react';
// import './ui.css';
import monitor from '../assets/images/monitor.png';
import ComPanel from './com_panel';

class spymasterUI extends Component {
    constructor(props){
        super(props);
        this.state = {
            leftComPanel: new ComPanel().state,
            rightComPanel: new ComPanel().state,
        };
    }

    componentDidMount(){
        this.setState ({
            leftComPanel: {
                displayText: 267884005
            },
            rightComPanel: {
                displayText: 748716483
            }
        })
    }

    render(){

        return (
            <div id="spymasterUiContainer">
                <img id="monitor" src={monitor}/>
                <ComPanel id="leftPanel"  displayText={this.state.leftComPanel.displayText} />
                <ComPanel id="rightPanel" displayText={this.state.rightComPanel.displayText} />
            </div>
            )
    }
}

export default spymasterUI
