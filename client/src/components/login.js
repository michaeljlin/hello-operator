import React, {Component} from 'react';
import './login.css';

class Login extends Component {
    render() {
        return (
            <div id="login_container">
                <div id="login_signin_container">
                    <h1>Sign In</h1>
                    <h4 className="name_title">First Name:</h4>
                    <input className="name" type="text" name="first_name"/>
                    <h4 className="name_title" id="last_name">Last Name:</h4>
                    <input className="name" type="text" name="last_name"/>
                    <h4>Username:</h4>
                    <input className="login_field" type="text" name="username"/>
                    <h4>Email:</h4>
                    <input className="login_field" type="text" name="email"/>
                    <h4>Password:</h4>
                    <input className="login_field" type="text" name="password"/>
                    <h4>Confirm Password:</h4>
                    <input className="login_field" type="text" name="confirm_password"/>
                </div>
                <div id="login_signup_container">
                    <h1>Sign Up</h1>
                    <button className="login_button">Hello Operator,</button>
                    <button className="login_button">Facebook</button>
                </div>
            </div>
        )

    }
}

export default Login