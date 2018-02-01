import React, {Component} from 'react';
import {connect} from 'react-redux';
import domain from '../../domain';

export default function(WrappedComponent){
    class Auth extends Component{

        tokenAuthorization(){
            fetch('http://'+domain+'8000/secret',{
                method: 'POST',
                body: JSON.stringify('test'),
                headers: new Headers({
                    'Content-Type': 'application/json'
                })
            }).then((response)=>{
                console.log('got response from authentication!');
                return response.json();
            });
        }

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