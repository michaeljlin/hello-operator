import React, {Component} from 'react';
import ComPanel from "./com_panel";
import CreateModal from "./createModal";
import TimeElapsed from "./timeElapsed";
import {connect} from 'react-redux';
import {displayTE} from "../actions/index";

class spyUI extends Component {
    constructor (props){
        console.log(props.conn);
        super(props);
        // this.state = {
        //     comPanel: new ComPanel().state,
        //     modal: new CreateModal().state,
        //     timeElapsed: new TimeElapsed().state,
        // };
    }

    // componentDidMount(){
    //     this.setState({
    //         comPanel:{
    //             displayText: 165280576,
    //             // displayTimeElapsed: this.state.comPanel.displayTimeElapsed,
    //         }
    //     });
    //     // if(this.state.comPanel.displayTimeElapsed === 'on'){
    //     //     this.setState({
    //     //         timeElapsed:{
    //     //             visibility: 'inline-block'
    //     //         }
    //     //     })
    //     // }
    //     // else if (this.state.comPanel.displayTimeElapsed === 'off'){
    //     //     this.setState({
    //     //         timeElapsed: {
    //     //             visibility: 'none'
    //     //         }
    //     //     })
    //     // }
    //
    //     if(this.props.displayTime === 'on'){
    //         this.setState({
    //             timeElapsed:{
    //                 visibility: 'inline-block'
    //             }
    //         })
    //     }
    //     // else if (this.state.comPanel.displayTimeElapsed === 'off'){
    //     //     this.setState({
    //     //         timeElapsed: {
    //     //             visibility: 'none'
    //     //         }
    //     //     })
    //     // }


    render () {
        const elapsedTimeAreaStyle = this.props.displayTime;
        console.log(this.props.displayTime);
        return (
            <div id="spyUiContainer">
                {/*<ComPanel id="spyCom" displayText={this.state.comPanel.displayText}/>*/}
                <CreateModal conn={this.props} visibility= "false"/>
                <TimeElapsed className = {elapsedTimeAreaStyle ? "" : "hide"} />
            </div>
        )
    }
}

function mapStateToProps(state){
    return{
        displayTime: state.userInterface.displayTime
    }
}

export default connect(mapStateToProps, {displayTE})(spyUI);