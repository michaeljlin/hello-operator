import types from '../actions/types';

const DEFAULT_STATE = {playerObject: ""};

export default function (state=DEFAULT_STATE, action){
    debugger;
    switch(action.type){
        case types.PLAYERINFO:
            return{...state, playerObject: action.payload};
        default:
            return state
    }
}
