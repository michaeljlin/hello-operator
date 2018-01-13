import types from '../actions/types';

const DEFAULT_STATE = {displayText: null, displayTime: false, modalActions: {modalVisibility: 'none', glyphiconVisibility: 'inline-block'}, signUpClick: 'false', playerMessages: []};

export default function (state=DEFAULT_STATE, action){
    switch(action.type){
        case types.DISPLAYTE:
            return{...state, displayTime: action.payload};
        case types.MODALACTIONS:
            return{...state, modalActions: action.payload};
        case types.SIGNUPCLICKED:
            return{...state, signUpClick: action.payload};
        case types.PLAYERMESSAGES:
            return{...state, playerMessages: action.payload};
        default:
            return state
    }
}
