import React, {Component} from 'react';
import './ui.css'

class ComPanel extends Component {

    constructor(props){
        super(props);
        this.state = {
            displayText: null,
        }
    }

    render(){
        return(
            <div id={this.props.id} className="comPanel">
                <div className="display"> {this.props.displayText}</div>
                <button className="btn primary"> </button>
                <button className="btn primary"> </button>
                <button className="btn primary"> </button>
                <button className="btn primary"> </button>
                <button className="btn primary"> </button>
                <button className="btn primary"> </button>
                <button className="btn primary"> </button>
                <button className="btn primary"> </button>
                <button className="btn primary"> </button>
            </div>
        )
    }
}

export default ComPanel