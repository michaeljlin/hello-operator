import React, {Component} from 'react';
import './login.css';
import {connect} from 'react-redux';
import {setConn, loginInput, playerInfo, userAuth, signUp} from '../actions';
import {Field, reduxForm} from 'redux-form';


class SignUp extends Component {
    constructor(props){
        super(props);

        this.state = {
            signUpMessage: '',
            signUpSuccess: '',
            loader: false,
        };

        this.submitButtonClicked = this.submitButtonClicked.bind(this);
        this.checkInput = this.checkInput.bind(this);
    }

    checkInput({input, type, meta:{touched, error}}){
        let inputHolder = "Null";
        let inputStyle = {
            width: '100%'
        };

        switch(input.name){
            case 'first_name':
                inputHolder = "First Name";
                inputStyle.width = '95%';
                break;
            case 'last_name':
                inputHolder = "Last Name";
                break;
            case 'username':
                inputHolder = "Username";
                break;
            case 'email':
                inputHolder = "Email";
                break;
            case 'password':
                inputHolder = "Password";
                break;
            case 'confirm_password':
                inputHolder = "Confirm Password";
                break;
            default:
        }

        return (
            <div>
                <input style={inputStyle} placeholder={inputHolder} {...input} type={type} />
                {touched && (error && <p>{error}</p>)}
            </div>
        )
    }

    submitButtonClicked(inputValues){

        // Must transform input into JSON before sending
        // Then define header to recognize JSON
        fetch('/signmeup', {
            method: 'POST',
            body: JSON.stringify(inputValues),
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        }).then((response)=>{
            return response.json();
        }).then((data)=>{

            // Need to build error handling based on response
            // Need to rework authentication to not use auth wrapper

           this.setState({loader: true});

            let authStatus = data.authStatus;

            if(authStatus === 'true'){
                this.props.userAuth(true);
                this.setState({loader: false});
                this.setState({
                    signUpSuccess: 'Sign Up successful, please sign in',
                });
            }
            else {
                this.setState({loader: false});
                this.setState({
                    signUpMessage: 'Sign Up failed, please try again'
                });
            }

        });
    }

    render() {
        const {handleSubmit, authError} = this.props;
        return (
            <div id="login_container">
                <div id="login_signup_container">
                    <form id="signUpForm" onSubmit={handleSubmit((vals) => this.submitButtonClicked(vals))}>
                        <div className="nameInputContainer">
                            <Field id="input_first_name" component={this.checkInput} type="text" name="first_name"/>
                        </div>
                        <div className="nameInputContainer">
                            <Field id="input_last_name" component={this.checkInput}  type="text" name="last_name"/>
                        </div>
                        <div className="inputContainer">
                            <Field id="input_username" component={this.checkInput} className="login_field" type="text" name="username"/>
                        </div>
                        <div className="inputContainer">
                            <Field id="input_email" component={this.checkInput} className="login_field" type="text"  name="email"/>
                        </div>
                        <div className="inputContainer">
                            <Field id="input_password" component={this.checkInput} className="login_field" type="password" name="password"/>
                        </div>
                        <div className="inputContainer">
                            <Field id="input_confirm_password" component={this.checkInput} className="login_field" type="password" name="confirm_password"/>
                        </div>
                        <button id='signUpSubmit' className="login_button" type="submit">Submit</button>
                    </form>
                    <p>{this.state.signUpMessage}</p>
                    <p id="loader" className={this.state.loader ? 'loader' : 'hide'} style={{top: '30%', right: '-6%'}}>Please wait...</p>
                    <p id="signUpSuccess" >{this.state.signUpSuccess}</p>

                </div>
            </div>
        )

    }
}

function validate(values) {
    const error = {};
    if(!values.first_name){
        error.first_name = 'Please enter your first name';
    }
    if(!values.last_name){
        error.last_name = 'Please enter your last name';
    }
    if(!values.username ){
        error.username = 'Please enter your username';
    }

    if( values.username !== undefined && !(values.username).match(/^(?![_\d])[\-\w!@#$%^&*]{6,}$/)){
        error.username = 'Your username must have at least 6 characters and cannot start with an underscore or number.';
    }

    if(!values.email){
        error.email = 'Please enter your email';
    }

    if(values.email !== undefined && !(values.email).match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)){
        error.email = 'Please enter a valid email address';
    }

    if(!values.password){
        error.password = 'Please enter your password';
    }

    if( values.password !== undefined && !(values.password).match(/^(?![_\d])[\-\w~!@#$%^&*]{8,}$/)){

        // if((values.password).match(/^[\-\w]{0,7}$/)){
        //     error.password = 'Your password does not have at least 8 characters.'
        // }
        error.password = 'Your password does not have at least 8 characters.';
    }

    if(!values.confirm_password){
        error.confirm_password = 'Please confirm your password';
    }
    if(values.password !== values.confirm_password){
        error.confirm_password = 'Passwords do not match';
    }

    return error;
}

SignUp = reduxForm({
    form: 'login',
    validate: validate,
})(SignUp);

function mapStateToProps(state){
    return{
        socketConnection: state.socketConnection.setConn,
        // loginInput: state.loginInfo.inputValues
        player: state.playerInformation.playerObject,
        // authError: state.user.error
    }
}

export default connect(mapStateToProps, {playerInfo, userAuth, signUp})(SignUp);