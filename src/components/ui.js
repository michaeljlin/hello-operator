import React, {Component} from 'react';
import './ui.css';
import SpymasterUI from './spymaster_ui';
import SpyUI from './spy_ui';

class UI extends Component {
    constructor(props){
        super(props);

        console.log(props.conn);
    }

    render(){
        return (
            <div className="ui" id="spymasterUi">
                <div className="uiCanvas">
                    <canvas ref="canvas"/>
                </div>
                {/*<SpymasterUI />*/}
                <SpyUI conn={this.props}/>
            </div>
        )
    }
}

export default UI