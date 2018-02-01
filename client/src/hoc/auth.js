import React, {Component} from 'react';
import {connect} from 'react-redux';
import domain from '../../domain';

export default function(WrappedComponent){
    class Auth extends Component{

        tokenAuthorization(){
            let token = sessionStorage.getItem('jwt');
            token = 'JWT '+token;
            console.log('sending token: ', token);

            fetch('http://'+domain+'8000/api/auth',{
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/json',
                    'Authorization': token
                })
            }).then((response)=>{
                console.log('got response from authentication: ', response);
                return response.json();
            });
        }

        componentWillMount(){
            let authStatus = this.tokenAuthorization();

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