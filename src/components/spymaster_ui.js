import React, {Component} from 'react';
import './ui.css'
import monitor from '../assets/images/monitor.png';

class spymasterUI extends Component {
    render(){
        return (
            <div id="spymasterUiContainer">
                <img id="monitor" src={monitor}/>
                {/*<img id="metalBackground" src={metalBackground}/>*/}
                <div id="leftPanel">
                    <div className="display"> 6482046</div>
                    <button className="btn primary"> </button>
                    <button className="btn primary"> </button>
                    <button className="btn primary"> </button>
                    <button className="btn primary"> </button>
                    <button className="btn primary"> </button>
                    <button className="btn primary"> </button>
                    <button className="btn primary"> </button>
                    <button className="btn primary"> </button>
                    <button className="btn primary"> </button>
                </div>
                <div id="rightPanel">
                    <div className="display">26072548 </div>
                    <button className="btn primary"> </button>
                    <button className="btn primary"> </button>
                    <button className="btn primary"> </button>
                    <button className="btn primary"> </button>
                    <button className="btn primary"> </button>
                    <button className="btn primary"> </button>
                    <button className="btn primary"> </button>
                    <button className="btn primary"> </button>
                    <button className="btn danger"> </button>
                </div>
            </div>
            )
    }
}

export default spymasterUI
