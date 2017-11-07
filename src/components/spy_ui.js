import React, {Component} from 'react';
import ComPanel from "./com_panel";
import CreateModal from "./createModal";
import TimeElapsed from "./timeElapsed";

class spyUI extends Component {
    constructor (props){
        console.log(props.conn);
        super(props);
        this.state = {
            comPanel: new ComPanel().state,
            modal: new CreateModal().state,
            timeElapsed: new TimeElapsed().state,
        };
    }

    componentDidMount(){
        this.setState({
            comPanel:{
                displayText: 165280576
            }
        });
        debugger;
        if(this.state.comPanel.displayTimeElapsed === 'on'){
            this.setState({
                timeElapsed:{
                    visibility: 'inline-block'
                }
            })
        }
        else if (this.state.comPanel.displayTimeElapsed === 'off'){
            this.setState({
                timeElapsed: {
                    visibility: 'none'
                }
            })
        }
    }

    render () {
        debugger;
        const statsAreaStyle = this.state.timeElapsed.visibility;
        return (
            <div id="spyUiContainer">
                {/*<ComPanel id="spyCom" displayText={this.state.comPanel.displayText}/>*/}
                <CreateModal conn={this.props} visibility= "false"/>
                <TimeElapsed style={{display: statsAreaStyle}} />
            </div>
        )
    }
}

export default spyUI;