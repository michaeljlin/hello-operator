import React, {Component} from 'react';
import './login.css';

class Login extends Component {
    render() {
        return (
            <div>
                <div id="login_signin">
                    <h1>Sign In</h1>
                    <h4>First Name:</h4>
                    <input className="name" type="text" name="first_name"/>
                    <h4>Last Name:</h4>
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
            </div>
        )

    }
}

export default Login