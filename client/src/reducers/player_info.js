import types from '../actions/types';

const DEFAULT_STATE = {playerObject: {}, playerRoles: {}, playerEvent: {}, playerArrays: {}, playerLogStatus: false};

export default function (state=DEFAULT_STATE, action){
    switch(action.type){
        case types.PLAYERINFO:
            return{...state, playerObject: action.payload};
        case types.PLAYERROLE:
            return{...state, playerRoles: action.payload};
        case types.PLAYEREVENT:
            return{...state, playerEvent: action.payload};
        case types.PLAYERARRAYS:
            return{...state, playerArrays: action.payload};
        case types.PLAYERLOGGEDOUT:
            return{...state, playerLogStatus: action.payload};
        default:
            return state
    }
}
