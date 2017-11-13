import React, {Component} from 'react';
import ComPanel from './com_panel';
import cogGlyphicon from '../assets/images/cog_glyphicon.png';
import closeGlyphicon from '../assets/images/close_glyphicon.png';


class CreateModal extends Component {
    constructor(props) {
        super(props);
        //**********Change this state to redux actions*********
        this.state = {
            modalVisibility: 'none',
            glyphiconVisibility: 'inline-block'
        };

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    openModal() {
        this.setState({
            modalVisibility: 'block',
            glyphiconVisibility: 'none',
        });
    }

    closeModal() {
        this.setState({
            modalVisibility: 'none',
            glyphiconVisibility: 'inline-block'
        });
    }

    render() {
        const modalStyle = this.state.modalVisibility;
        const modalButtonStyle = this.state.glyphiconVisibility;
        return (
            <div>
                <button id="openModal" onClick={this.openModal}>
                    <img draggable="false" id="glyphicon" src={cogGlyphicon} style={{display: modalButtonStyle, userSelect:'none'}}/>
                </button>
                <div id="spyModal" style={{display: modalStyle}}>
                    <ComPanel  id="spyModalComPanel"/>
                    <img draggable="false" id="spyModalClose" src={closeGlyphicon} onClick={this.closeModal} style={{display: modalStyle}}/>
                </div>
            </div>
        )
    }
}


export default CreateModal