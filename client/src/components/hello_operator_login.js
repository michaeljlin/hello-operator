import React, {Component} from 'react';
import './login.css';
import {setConn, playerInfo, userAuth, makePlayerArrays, makeGameArrays, playerLoggedOut} from '../actions';
import {Field, reduxForm} from 'redux-form';
import {connect} from 'react-redux';
import openSocket from 'socket.io-client';

import CreateModal from './createModal'
import domain from '../../domain';

class HelloOperatorLogin extends Component {
    constructor(props){
        super(props);
        this.submitButtonClicked = this.submitButtonClicked.bind(this);
        this.checkInput = this.checkInput.bind(this);

        this.state = {
            loginMessage: '',
            authorization: '',
            submitClicked: 'false',
            loggedInPlayers: '',
            fetchTest: 'negative, sir'
        };
    }


    checkInput({input, type, meta:{touched, error}}){
        // if(this.props.playerLog === false) {
            console.log(input);
            return (
                <div>
                    {/*<label>{label}</label>*/}
                    <input {...input} type={type}/>
                    <p>{touched && error}</p>
                </div>
            )
        // }
    }

    // componentDidMount(){
    //     fetch('http://'+domain+'8000/logmein')
    //         .then((response)=>{
    //         console.log('got a response from logmein: ', response);
    //         return response.json();
    //         }).then((data)=>{
    //             console.log('response says: ', data);
    //     });
    // }

    submitButtonClicked(inputValues) {

        console.log("input values: ",inputValues);

        // Starts with initial login request
        fetch('/logmein',{
            method: 'POST',
            body: JSON.stringify(inputValues),
            headers: new Headers({
                'Content-Type': 'application/json'
            })})
            .then((response)=>{
                // If request is successful, return the JSON result
                // JSON will include token to store in local session storage

                console.log('got a response from logmein: ', response);
                return response.json();
            }).then((data)=>{

                // Store data in local session storage here
                // Then start socket.io connection to lobbyserver
                // Use setConn to connect Redux to new openSocket

            console.log('response says: ', data);

            sessionStorage.setItem('jwt', data.token);

            if(data.authStatus === 'true' ){
                const socket = openSocket(domain+'8000', { reconnection: false });
                this.props.setConn(socket);
            }

            return data.authStatus;

            }).then((authStatus)=>{

                // After everything is connected, set up transfer to lobby page
                // Currently uses legacy socket code, but should be reduced to a push to react history

            if(authStatus === 'true'){
                const socket = this.props.socketConnection;
                socket.emit('setUsername', inputValues.username);
            }

            this.setState({
                submitClicked: 'true'
            });

            this.setState({
                authorization: authStatus
            })
        });
    }


    componentDidUpdate() {
        // if(this.props.playerLog === false){
            // Checks to see if the submitClicked is true and if the user has logged in, so the "please wait" message doesn't appear on page load but appears when the database is being accessed and checked
            if (this.state.submitClicked === 'true' && this.state.authorization === "") {
                document.getElementById('loader').classList.remove('hide');
                document.getElementById('loader').classList.add('show');
            }

            //If the login is successful, the user authentication becomes true and the user is redirected to the lobby page, the individual player information and the arrays of logged in players and open games are also retrieved
            else if (this.state.authorization === 'true') {
                this.props.userAuth(true);
                // document.getElementById('loader').classList.remove('show');
                // document.getElementById('loader').classList.add('hide');
                const socket = this.props.socketConnection;

                socket.on('updatePlayer', playerData => {
                    this.props.playerInfo(playerData);

                    sessionStorage.setItem('playerInfo', JSON.stringify(playerData))
                });

                socket.on('loadingLobby', playerTracker => {
                    this.props.makePlayerArrays(playerTracker);
                });
                //
                // socket.on('updateOpenGames', gameTracker => {
                //     this.props.makeGameArrays(gameTracker);
                // });

                //Only redirect to the lobby after the player information for all logged in players has been retrieved
                console.log('this props', this.props);
                if (this.props.loggedInPlayers.playerTracker !== undefined) {
                    console.log('logged in players', this.props.loggedInPlayers);
                    this.props.history.push('/lobby');
                }
            }

            //If the login failed, the loading comment is removed
            else if (this.state.authorization === 'false') {
                document.getElementById('loader').classList.remove('show');
                document.getElementById('loader').classList.add('hide');
            }
        // }

    }

    render() {

        const {handleSubmit} = this.props;

        if(this.state.authorization === 'false') {
            var loginMessage = 'Login failed, please try again'
        }

        return (
            <div id="login_container">
                <div id="login_signup_container">
                    <form onSubmit={handleSubmit((vals) => this.submitButtonClicked(vals))}>
                        <h1>Sign In:</h1>
                        <h4>Username:</h4>
                        <Field id="input_username" component={this.checkInput} className="login_field" type="text" name="username"/>
                        <h4>Password:</h4>
                        <Field id="input_password" component={this.checkInput} className="login_field" type="password" name="password"/>
                        <button className="login_button" id="loginSubmitButton" type="submit">Submit</button>
                    </form>
                    <p>{loginMessage}</p>
                </div>
                <p id="loader" className="hide">Please wait...</p>
            </div>
        )
    }
}

function validate(values) {
    const error = {};

    if (!values.username) {
        error.username = 'Please enter your username'
    }

    if (values.username !== undefined && !(values.username).match(/(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)) {
        error.username = 'Your username does not meet the requirements: At least 8 characters, include a number, include a special character (!, @, #, $, %, ^, &, or *), include a capital letter, include a lowercase letter'
    }

    if (!values.password) {
        error.password = 'Please enter your password'
    }

    if (values.password !== undefined && !(values.password).match(/(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)) {
        error.password = 'Your password does not meet the requirements: At least 8 characters, include a number, include a special character (!, @, #, $, %, ^, &, or *), include a capital letter, include a lowercase letter'
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