import React, {Component} from 'react';
import './login.css';
import {connect} from 'react-redux';
import {setConn, loginInput} from '../actions';
import {Field, reduxForm} from 'redux-form';

class Login extends Component {
    constructor(props){
        super(props);
        this.submitButtonClicked = this.submitButtonClicked.bind(this);
        this.checkInput = this.checkInput.bind(this);
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
        // const inputValues = {
        //     firstName: document.getElementById("input_first_name").value,
        //     lastName: document.getElementById("input_last_name").value,
        //     username: document.getElementById("input_username").value,
        //     email: document.getElementById("input_email").value,
        //     password: document.getElementById("input_password").value,
        //     confirmPassword: document.getElementById("input_confirm_password").value,
        // };

        const id = this.props.socketConnection.id;
        this.props.socketConnection.emit('login_submit', inputValues, id);
        // this.props.history.push('/lobby')
    }

    render() {
        const {handleSubmit} = this.props;
        return (
            <div id="login_container">
                <div id="login_signin_container">
                    <form onSubmit={handleSubmit((vals) => this.submitButtonClicked(vals))}>
                        <h1>Sign Up</h1>
                        <h4>First Name:</h4>
                        <Field id="input_first_name" component={this.checkInput} type="text" name="first_name"/>
                        <h4 id="last_name">Last Name:</h4>
                        <Field id="input_last_name" component={this.checkInput}  type="text" name="last_name"/>
                        <h4>Username:</h4>
                        <Field id="input_username" component={this.checkInput} className="login_field" type="text" name="username"/>
                        <h4>Email:</h4>
                        <Field id="input_email" component={this.checkInput} className="login_field" type="text" name="email"/>
                        <h4>Password:</h4>
                        <Field id="input_password" component={this.checkInput} className="login_field" type="text" name="password"/>
                        <h4>Confirm Password:</h4>
                        <Field id="input_confirm_password" component={this.checkInput} className="login_field" type="text" name="confirm_password"/>
                        <button className="login_button" type="submit">Submit</button>
                    </form>
                </div>
                <div id="login_signup_container">
                    <h1>Sign In</h1>
                    <button className="login_button">Hello Operator,</button>
                    <button className="login_button">Facebook</button>
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
        error.lastName = 'Please enter your last name'
    }
    if(!values.username){
        error.username = 'Please enter your username'
    }
    if(!values.email){
        error.email = 'Please enter your email'
    }
    if(!values.password){
        error.password = 'Please enter your password'
    }
    if(!values.confirm_password){
        error.confirm_password = 'Please confirm your password'
    }

    return error;
}

Login = reduxForm({
    form: 'login',
    validate: validate,
})(Login);

function mapStateToProps(state){
    return{
        socketConnection: state.socketConnection.setConn,
        // loginInput: state.loginInfo.inputValues
    }
}

function mapDispatchToProps(dispatch){
    console.log(dispatch);
    return{
        loginInput: inputValues => {
            dispatch(loginInput(inputValues))
        }
    }
}

// export default connect(mapStateToProps, mapDispatchToProps, {setConn})(Login);

export default connect(mapStateToProps, mapDispatchToProps)(Login);