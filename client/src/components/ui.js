import React, {Component} from 'react';
import './ui.css';
import SpymasterUI from './spymaster_ui';
import SpyUI from './spy_ui';
import {connect} from 'react-redux';
import {setConn, playerRole} from "../actions"

class UI extends Component {

    constructor(props){
        super(props);

        this.state = {
            userRole: this.props.role,
            lobbyConn: this.props.socketConnection
        };

        console.log('ui state: ', this.state);

        this.whichUI = this.whichUI.bind(this);
    }

    componentWillReceiveProps(nextProps){
        const currentState = {...this.state};
        currentState.userRole = nextProps.role;

        this.setState(currentState);
    }

    whichUI(userRole) {

        if(userRole === 'Handler'){
            return (<SpymasterUI gameSocket={this.props.gameSocket} history={this.props.history}/>);
        }
        else if(userRole === 'Agent'){
            return (<SpyUI gameSocket={this.props.gameSocket} history={this.props.history}/>);
        }
    };

    render(){
        const userRole = this.state.userRole;
        return (
            <div className="ui" id="ui_container">
                {this.whichUI(userRole)}
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
