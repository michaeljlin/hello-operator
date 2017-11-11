import React, {Component} from 'react';
import {connect} from 'react-redux';
import {setConn} from "../actions";
import {serverData} from "../actions";
import {playerParent} from "../actions"
//For testing
import fbTest from '../assets/images/test_fb_1.jpg';

class Player extends Component {
    constructor(props) {
        super(props);

    }

    render() {
        console.log('Player props', this.props.parent);

        //visibility value will be returned true from one part of a switch statement, the correct parent will make it true
        return (
            <div>

                {/*Use turnary to see which element was the parent(based on props passed in) to see which of the below needs to render*/}

                {/*//Image element for avatar to be used during game play*/}
                {/*<img src={fbTest} style={{display: visibility ? }}/>*/}
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
        // data: state,
        parent: state.playerInformation.isParent
    }
}

export default connect(mapStateToProps, {setConn, serverData, playerParent})(Player);