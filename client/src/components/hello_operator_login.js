import React, {Component} from 'react';
import './login.css';
import {setConn, playerInfo, userAuth, makePlayerArrays, makeGameArrays, playerLoggedOut} from '../actions';
import {Field, reduxForm} from 'redux-form';
import {connect} from 'react-redux';
import openSocket from 'socket.io-client';
import domain from '../../domain';

class HelloOperatorLogin extends Component {
    constructor(props){
        super(props);
        this.submitButtonClicked = this.submitButtonClicked.bind(this);
        this.checkInput = this.checkInput.bind(this);

        this.state = {
            loginFeedback: false,
            failedLogin: false,
            authorization: '',
            submitClicked: 'false',
            loggedInPlayers: '',
            fetchTest: 'negative, sir',
        };
    }

    componentWillMount(){
        if(this.props.socketConnection !== null && this.props.socketConnection !== undefined){
            this.props.socketConnection.disconnect();
            sessionStorage.clear();
        }
    }

    checkInput({input, type, meta:{touched, error}}){
        return (
            <div>
                {/*<label>{label}</label>*/}
                <input {...input} type={type}/>
                {touched && (error && <p>{error}</p>)}
            </div>
        )
    }

    submitButtonClicked(inputValues) {



        this.setState({loginFeedback: true, submitClicked: true});

        // Starts with initial login request
        fetch('/logmein',{
            method: 'POST',
            // mode: 'no-cors', // Only enable this for local debugging purposes
            body: JSON.stringify(inputValues),
            headers: new Headers({
                'Content-Type': 'application/json'
            })})
            .then((response)=>{

                return response.json();
            }).then((data)=>{

            sessionStorage.setItem('jwt', data.token);

            if(data.authStatus === 'true' ){
                const socket = openSocket(domain+'8000', { reconnection: false });
                socket.emit('setUsername', inputValues.username);

                this.props.setConn(socket);
            }

            return data.authStatus;

            }).then((authStatus)=>{

            this.setState({
                authorization: authStatus,
            });

            if(authStatus === 'true'){

                const socket = this.props.socketConnection;

                socket.on('updatePlayer', playerData => {
                        this.props.playerInfo(playerData);

                        sessionStorage.setItem('playerInfo', JSON.stringify(playerData));

                        this.props.userAuth(true);
                        this.props.history.push('/lobby');
                });

                socket.emit('setUsername', inputValues.username);
            }

            else if (authStatus === 'false') {
                this.setState({loginFeedback: false, failedLogin: true,})
            }

        });
    }

    render() {

        const {handleSubmit} = this.props;

        return (
            <div id="login_container">
                <div id="login_signup_container">
                    <form id="signInForm" onSubmit={handleSubmit((vals) => this.submitButtonClicked(vals))}>
                        <h1>Sign In:</h1>
                        <h4>Username:</h4>
                        <Field id="input_username" component={this.checkInput} className="login_field" type="text" name="username"/>
                        <h4>Password:</h4>
                        <Field id="input_password" component={this.checkInput} className="login_field" type="password" name="password"/>
                        <button className="login_button" id="loginSubmitButton" type="submit">Submit</button>
                    </form>
                    <p id="successMessage" className= {this.state.failedLogin ? "show" : "hide"}>Login failed, please try again</p>
                </div>
                <p id="loader" className= {this.state.loginFeedback ? "show" : "hide"}>Please wait...</p>
            </div>
        )
    }
}

function validate(values) {
    const error = {};

    if (!values.username) {
        error.username = 'Please enter your username'
    }

    if (values.username !== undefined && !(values.username).match(/^(?![_\d])[\-\w!@#$%^&*]{6,}$/)) {

        error.username = 'This is not a valid username.'

    }

    if (!values.password) {
        error.password = 'Please enter your password'
    }

    if (values.password !== undefined && !(values.password).match(/^(?![_\d])[\-\w~!@#$%^&*]{8,}$/)) {

        error.password = 'This is not a valid password.'

    }

    return error;
}

HelloOperatorLogin = reduxForm({
    form: 'Hello Operator login',
    validate: validate,
})(HelloOperatorLogin);

function mapStateToProps(state){
    return{
        socketConnection: state.socketConnection.setConn,
        // loginInput: state.loginInfo.inputValues
        player: state.playerInformation.playerObject,
        auth: state.userAuthorization.auth,
        loggedInPlayers: state.playerInformation.playerArrays,
        openGames: state.gameInformation.gameArrays,
        // playerLog: state.playerInformation.playerLogStatus,
    }
}

export default connect(mapStateToProps, {setConn, playerInfo, userAuth, makePlayerArrays, makeGameArrays, playerLoggedOut})(HelloOperatorLogin);