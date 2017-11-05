import React, {Component} from 'react';
import './ui.css';
import SpymasterUI from './spymaster_ui';
import SpyUI from './spy_ui';

class UI extends Component {

    render(){

        return (
            <div className="ui" id="spymasterUi">
                <div className="uiCanvas">
                    <canvas ref="canvas"/>
                </div>
                {/*<SpymasterUI />*/}
                <SpyUI/>
            </div>
        )
    }
}

export default UI