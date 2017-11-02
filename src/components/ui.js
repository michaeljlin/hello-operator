import React, {Component} from 'react';
import './ui.css';

class UI extends Component {

    // componentDidMount () {
    //     this.createDisplay()
    // }

    // createDisplay(){
    //     const canvas = this.refs.canvas;
    //     const ctx = canvas.getContext("2d");
    //     ctx.beginPath();
    //     ctx.arc(150, 190, 150, 1.1*Math.PI, 1.5*Math.PI);
    //     ctx.stroke();
    // }


    render(){
        return (
            <div className="ui" id="spymasterUi">
                <div className="uiCanvas">
                    <canvas ref="canvas" />
                </div>
                <div className = "display"> </div>
                <div className="terminal" id="terminalTop"> </div>
                <div className="terminal" id="terminalFront"> </div>
            </div>
        )
    }
}

export default UI