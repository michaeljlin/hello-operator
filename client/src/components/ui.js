import React, {Component} from 'react';
import './ui.css';
import SpymasterUI from './spymaster_ui';
import SpyUI from './spy_ui';
import {connect} from 'react-redux';
import {setConn, playerRole} from "../actions"

class UI extends Component {

    render(){
        const whichUI = () => {
            if(this.props.userRole === 'spymaster'){
                return (
                    <SpymasterUI/>
                )
            }
            if(this.props.userRole === 'spy'){
                return (
                    <SpyUI/>
                )
            }
        };

        return (
            <div className="ui" id="ui_container">
                <div className="uiCanvas">
                    <canvas ref="canvas"/>
                </div>
                {/*<SpymasterUI/>*/}
                {/*<SpyUI/>*/}
                {whichUI()}
            </div>
        )
    }
}

function mapStateToProps(state){
    return{
        socketConnection: state.socketConnection.setConn,
        userRole: state.playerInformation.playerRole,
    }
}

export default connect(mapStateToProps, {setConn, playerRole})(UI);
