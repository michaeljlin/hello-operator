import types from '../actions/types';

const DEFAULT_STATE = {isParent: ""};

export default function (state=DEFAULT_STATE, action){
    switch(action.type){
        case types.PLAYERPARENT:
            return{...state, isParent: action.payload};
        default:
            return state
    }
}
