import React, {Component} from 'react';
import {connect} from 'react-redux';
import {setConn} from "../actions";
import {serverData} from "../actions";

class Player extends Component {
    constructor(props) {
        super(props);

    }

    render() {
        // console.log('Player props', this.props);
        return (
            <div>

                {/*Use turnary to see which element was the parent(based on props passed in) to see which of the below needs to render*/}

                {/*//Image element for avatar to be used during game play*/}
                {/*<img src={this.props.socketConnection}/>*/}
                {/*//Image element for facebook profile picture to be used in lobby*/}

                {/*//Username for lobby*/}
                {/*//Agent name for spy UI*/}
                {/*//Agent name for spymaster UI*/}
            </div>
        )
    }
}

function mapStateToProps(state){
    return{
        socketConnection: state.socketConnection.setConn,
        data: state
    }
}

export default connect(mapStateToProps, {setConn, serverData})(Player);