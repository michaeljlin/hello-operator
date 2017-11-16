import types from '../actions/types';

const DEFAULT_STATE = {gameObject: ""};

export default function (state=DEFAULT_STATE, action){
    switch(action.type){
        case types.GAMEINFO:
            return{...state, gameObject: action.payload};
        default:
            return state
    }
}