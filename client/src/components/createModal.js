import React, {Component} from 'react';
import ComPanel from './com_panel';
import cogGlyphicon from '../assets/images/cog_glyphicon.png';
import closeGlyphicon from '../assets/images/close_glyphicon.png';
import {connect} from 'react-redux';
import{modalActions, gameInfo} from "../actions";
import {Link} from 'react-router-dom'
import './ui.css';


class CreateModal extends Component {
    constructor(props) {
        super(props);
        //**********Change this state to redux actions*********
        // this.state = {
        //     modalVisibility: 'none',
        //     glyphiconVisibility: 'inline-block'
        // };

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    openModal() {
        // this.setState({
        //     modalVisibility: 'block',
        //     glyphiconVisibility: 'none',
        // });
        this.props.modalActions('block', 'none')
    }

    closeModal() {
        // this.setState({
        //     modalVisibility: 'none',
        //     glyphiconVisibility: 'inline-block'
        // });
        this.props.modalActions('none', 'inline-block')
    }

    render() {
        // const modalStyle = this.props.modalVisibility;
        // const modalButtonStyle = this.state.glyphiconVisibility;
        const modalStyle = this.props.modalDisplay.modalVisibility;
        const modalButtonStyle = this.props.modalDisplay.glyphiconVisibility;

        if(this.props.parent==="spy_ui"){
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
        if(this.props.parent==="open_game"){
            const gameId = this.props.openGame;
            return (
                <div>
                    {/*<button id="openModal" onClick={this.openModal}>*/}
                        {/*<img draggable="false" id="glyphicon" src={cogGlyphicon} style={{display: modalButtonStyle, userSelect:'none'}}/>*/}
                    {/*</button>*/}
                    <div id="joinGameModal" style={{display: modalStyle}}>
                        <p>Are you sure that you want to join this game?</p>
                        <button className="joinButton joinGameButton" onClick={this.closeModal}>No</button>
                        {/*<Link className="joinButton" to={"/game" + gameId}>Yes</Link>*/}
                        <button className="joinLink">
                            <Link to={"/game"} style={{color: 'white', textDecoration: 'none'}}>Yes</Link>
                        </button>
                        {/*<Link className="joinLink" to={"/game"} >Yes</Link>*/}
                        <img draggable="false" id="spyModalClose" src={closeGlyphicon} onClick={this.closeModal} style={{display: modalStyle}}/>
                    </div>
                </div>
            )
        }
    }
}

function mapStateToProps(state){
    return{
        modalDisplay: state.userInterface.modalActions,
        openGame: state.gameInformation.gameObject,
    }
}

export default connect(mapStateToProps, {modalActions, gameInfo})(CreateModal)