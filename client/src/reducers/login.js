import types from '../actions/types';

const DEFAULT_STATE = {inputValues: ""};

export default function (state=DEFAULT_STATE, action){
    switch(action.type){
        case types.LOGININPUT:
            return{...state, inputValues: action.payload};
        default:
            return state
    }
}
