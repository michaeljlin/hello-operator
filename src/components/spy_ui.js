import React, {Component} from 'react';
import ComPanel from "./com_panel";
import CreateModal from "./createModal";

class spyUI extends Component {
    constructor (props){
        console.log(props.conn);
        super(props);
        this.state = {
            comPanel: new ComPanel().state,
            modal: new CreateModal().state
        };
    }

    componentDidMount(){
        this.setState({
            comPanel:{
                displayText: 165280576
            }
        })
    }




    render () {
        return (
            <div id="spyUiContainer">
                {/*<ComPanel id="spyCom" displayText={this.state.comPanel.displayText}/>*/}
                <CreateModal conn={this.props} visibility= "false"/>
            </div>
        )
    }
}

export default spyUI;