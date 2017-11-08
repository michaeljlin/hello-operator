import React, {Component} from 'react';
import { connect } from 'react-redux';
import { openDoor } from '../actions/index';

class Door extends Component {
    constructor(props){
        super(props);


    }
    //placeholder
    render(){
        return(
            <h1> </h1>
        )
    }
}

function mapStateToProps(state){
    return {
        open: state.door.doorOpen
    }
}

export default connect(mapStateToProps, {openDoor})(Door)
