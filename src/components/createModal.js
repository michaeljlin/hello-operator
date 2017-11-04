import React, {Component} from 'react';
import ComPanel from './com_panel';
// import Modal from './createModal';


class CreateModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visibility: 'none',
        };

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    openModal() {
        this.setState({
            visibility: 'block',
        });

        const modalStyle = {
            display: 'block'
        }

    }

    closeModal() {
        this.setState({
            visibility: 'none',
        });

        const modalStyle = {
            display: 'none',
        }
    }

    render() {
        const modalStyle = this.state.visibility;

        return (
            <div>
                <button id="openModal" onClick={this.openModal}>
                    <img />
                </button>
                <div style={{display: modalStyle}}>
                    <h1>Modal content</h1>
                    <button onClick={this.closeModal}>Close</button>
                </div>
            </div>
        )
    }
}


export default CreateModal