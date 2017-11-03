import React, {Component} from 'react';
import './ui.css';
import SpymasterUI from './spymaster_ui';

class UI extends Component {

    render(){

        return (
            <div className="ui" id="spymasterUi">
                <div className="uiCanvas">
                    <canvas ref="canvas" />
                </div>
                <SpymasterUI />
            </div>
        )
    }
}

export default UI