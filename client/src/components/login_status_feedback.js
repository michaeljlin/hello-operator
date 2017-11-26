import React from 'react';

const LoginStatusMessage = props => {

        const message = () => {
            // if(this.props.status === 'success'){
            //     return <p>Login succeeded</p>
            // }
            if(props.status === 'failed') {
                return <p>Login attempt failed, please try again</p>
            }
        };
        return (
            <div>
                {message()}
            </div>
        )
};

export default LoginStatusMessage;