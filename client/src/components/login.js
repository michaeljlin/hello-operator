import React, {Component} from 'react';
import './login.css';
import {connect} from 'react-redux';
import {setConn, loginInput, playerInfo} from '../actions';
import {Field, reduxForm} from 'redux-form';

class SignUp extends Component {
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
        const id = this.props.socketConnection.id;
        this.props.socketConnection.emit('login_submit', inputValues, id);
        this.props.history.push('/lobby')
    }

    render() {
        const {handleSubmit, authError} = this.props;
        return (
            <div id="login_container">
                <div id="login_signup_container">
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
                        <Field id="input_password" component={this.checkInput} className="login_field" type="password" name="password"/>
                        <h4>Confirm Password:</h4>
                        <Field id="input_confirm_password" component={this.checkInput} className="login_field" type="password" name="confirm_password"/>
                        <button className="login_button" type="submit">Submit</button>
                    </form>
                </div>
                <div id="login_signin_container">
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
        error.last_name = 'Please enter your last name'
    }
    if(!values.username ){
        error.username = 'Please enter your username'
    }

    if( values.username !== undefined && !(values.username).match(/(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)){
        error.username = 'Your username does not meet the requirements: At least 8 characters, include a number, include a special character (!, @, #, $, %, ^, &, or *), include a capital letter, include a lowercase letter'
    }

    if(!values.email){
        error.email = 'Please enter your email'
    }
    if(!values.password){
        error.password = 'Please enter your password'
    }

    //Implement after talking to Saeed about regex expression
    // if( values.password !== undefined && !((values.password).match(/(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/))){
    //     error.password = 'Your password does not meet the requirements'
    // }

    if(!values.confirm_password){
        error.confirm_password = 'Please confirm your password'
    }
    if(values.password !== values.confirm_password){
        error.confirm_password = 'Passwords do not match'
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

// function mapDispatchToProps(dispatch){
//     console.log(dispatch);
//     return{
//         loginInput: inputValues => {
//             dispatch(loginInput(inputValues))
//         }
//     }
// }

// export default connect(mapStateToProps, mapDispatchToProps, {setConn})(SignUp);

export default connect(mapStateToProps, {playerInfo})(SignUp);