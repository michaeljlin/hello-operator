import React, {Component} from 'react';
import monitor from '../assets/images/monitor_frame.svg';
import ComPanel from './com_panel';
import {connect} from 'react-redux';
import {setConn} from "../actions";
import  {displayTE} from "../actions";
import Player from './player';

class spymasterUI extends Component {
    constructor(props){
        super(props);
        // this.state = {
        //     leftComPanel: new ComPanel().state,
        //     rightComPanel: new ComPanel().state,
        // };
    }

    componentDidMount(){
        this.setState ({
            // leftComPanel: {
            //     displayText: 2678840
            // },
            // rightComPanel: {
            //     displayText: 7487164
            // }
        })
    }


    //Include spymaster agent name somewhere

    render(){

        return (
            <div id="spymasterUiContainer">

                {/*Check to see if props are being passed correctly here*/}
                <Player parent="spymaster_ui"/>

                <img id="monitor" src={monitor}/>
                {/*<ComPanel id="leftPanel"  displayText={this.state.leftComPanel.displayText} />*/}
                {/*<ComPanel id="rightPanel" displayText={this.state.rightComPanel.displayText} />*/}
                <ComPanel id="leftPanel" />
                <ComPanel id="rightPanel"/>
            </div>
            )
    }
}

function mapStateToProps(state){
    return{
        displayTime: state.userInterface.displayTime,
        socketConnection: state.socketConnection.setConn
    }
}

export default connect(mapStateToProps, {displayTE, setConn})(spymasterUI);
