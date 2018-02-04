import React, {Component} from 'react';
import {connect} from 'react-redux';
import domain from '../../domain';
// import decode from 'jwt-decode';

export default function(WrappedComponent){
    class Auth extends Component{

        tokenAuthorization(){
            let token = sessionStorage.getItem('jwt');
            token = 'JWT '+token;
            console.log('sending token: ', token);

            // console.log('decoded token: ', decode(token));

            fetch('http://'+domain+'8000/api/auth',{
                method: 'POST',
                // mode: 'no-cors', // Only enable this for local debugging purposes
                headers: new Headers({
                    'Content-Type': 'application/json',
                    'Authorization': token
                })
            }).catch((error)=>{
                console.error('Error: ', error);
                this.props.history.push("/");
            }).then((response)=>{
                console.log('got response from authentication: ', response);
                return response.json();
            }).then((data)=>{
                console.log('data says: ', data);

                if(!data.authStatus){
                    this.props.history.push("/");
                }
            });
        }

        componentWillMount(){

            this.tokenAuthorization();

            // if(!this.props.auth){
            //     this.props.history.push("/");
            // }
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