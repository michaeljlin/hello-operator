import React, {Component} from 'react';
import Player from './player';

class openGames extends Component {
    render(){
        const display = this.props.playerDisplay;
        const classProp = this.props.playerClassProp;
        return(
            <Player display = {display ? "" : display} classProp= {classProp ? "" : classProp}/>
        )
    }
}

export default openGames