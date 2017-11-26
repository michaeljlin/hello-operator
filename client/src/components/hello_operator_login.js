import React, {Component} from 'react';
import './login.css';
import {setConn, playerInfo, userAuth} from '../actions';
import {Field, reduxForm} from 'redux-form';
import {connect} from 'react-redux';


class HelloOperatorLogin extends Component {
    constructor(props){
        super(props);
        this.submitButtonClicked = this.submitButtonClicked.bind(this);
        this.checkInput = this.checkInput.bind(this);

        this.state = {
            loginMessage: ''
        }
    }

    checkInput({input, type, meta:{touched, error}}){
        console.log(input);
        return (
            <div>
                {/*<label>{label}</label>*/}
                <input {...input} type={type} />
                <p>{touched&&error}</p>
            </div>
        )
    }

    submitButtonClicked(inputValues){
        const id = this.props.socketConnection.id;
        const socket = this.props.socketConnection;
        socket.emit('hello_operator_login_submit', inputValues, id);

        socket.on('hello_operator_login_status', (authStatus) => {
            if(authStatus === 'true'){
                this.props.userAuth(true);
                this.props.history.push('/lobby')
            }
            else {
                this.setState({
                    loginMessage: 'Login failed, please try again'
                });
            }
        });


    }

    render() {
        const {handleSubmit, authError} = this.props;
        return (
            <div id="login_container">
                <div id="login_signup_container">
                    <form onSubmit={handleSubmit((vals) => this.submitButtonClicked(vals))}>
                        <h1>Sign In:</h1>
                        <h4>Username:</h4>
                        <Field id="input_username" component={this.checkInput} className="login_field" type="text" name="username"/>
                        <h4>Password:</h4>
                        <Field id="input_password" component={this.checkInput} className="login_field" type="password" name="password"/>
                        <h4>Confirm Password:</h4>
                        <Field id="input_confirm_password" component={this.checkInput} className="login_field" type="password" name="confirm_password"/>
                        <button className="login_button" type="submit">Submit</button>
                    </form>
                    <p>{this.state.loginMessage}</p>
                </div>
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
        error.password = 'Your username does not meet the requirements: At least 8 characters, include a number, include a special character (!, @, #, $, %, ^, &, or *), include a capital letter, include a lowercase letter'
    }

    //Implement after talking to Saeed about regex expression
    // if( values.password !== undefined && !((values.password).match(/(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/))){
    //     error.password = 'Your password does not meet the requirements'
    // }

    if (!values.confirm_password) {
        error.confirm_password = 'Please confirm your password'
    }
    if (values.password !== values.confirm_password) {
        error.confirm_password = 'Passwords do not match'
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
        // authError: state.user.error
        auth: state.userAuthorization.auth
    }
}

export default connect(mapStateToProps, {playerInfo, userAuth})(HelloOperatorLogin);