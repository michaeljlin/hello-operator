import React, {Component} from 'react';
import {connect} from 'react-redux';

export default function(WrappedComponent){
    class Auth extends Component{

        componentWillMount(){
            if(!this.props.auth){
                this.props.history.push("/");
            }
        }

        componentWillReceiveProps(nextProps){
            if(!nextProps.auth){
                this.props.history.push("/")
            }
        }

        render(){
            return <WrappedComponent {...this.props} />
        }
    }
    
    function mapStateToProps(state){
        return {
            auth: state.userAuthorization.auth
        }
    }

    return connect(mapStateToProps)(Auth)
}