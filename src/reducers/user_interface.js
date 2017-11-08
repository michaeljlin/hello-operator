import types from '../actions/types';

const DEFAULT_STATE = {displayText: null, displayTime: false};

export default function (state=DEFAULT_STATE, action){
    switch(action.type){
        case types.DISPLAYTE:
            return{...state, displayTime: action.payload};
        default:
            return state
    }
}
