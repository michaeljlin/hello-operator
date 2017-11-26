import types from '../actions/types';

const DEFAULT_STATE = {displayText: null, displayTime: false, modalActions: {modalVisibility: 'none', glyphiconVisibility: 'inline-block'}};

export default function (state=DEFAULT_STATE, action){
    switch(action.type){
        case types.DISPLAYTE:
            return{...state, displayTime: action.payload};
        case types.MODALACTIONS:
            return{...state, modalActions: action.payload};
        default:
            return state
    }
}