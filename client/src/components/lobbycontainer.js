import React from 'react';
import Lobby from './lobby';
import Player from './player';

export default ()=>{
    return(
        <div>
            {/*<Player />*/}
            <Lobby history={this.props.history}/>
        </div>
    )
}