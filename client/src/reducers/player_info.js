import types from '../actions/types';

const DEFAULT_STATE = {playerObject: "", playerRole: null};

export default function (state=DEFAULT_STATE, action){
    switch(action.type){
        case types.PLAYERINFO:
            return{...state, playerObject: action.payload};
        case types.PLAYERROLE:
            return{...state, playerRole: action.payload};
        default:
            return state
    }
}
