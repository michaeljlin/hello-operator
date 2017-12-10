import types from '../actions/types';

const DEFAULT_STATE = {gameObject: "", createButtonWasClicked: 'false', joinButtonWasClicked: 'false', gameArrays:{}};

export default function (state=DEFAULT_STATE, action){
    switch(action.type){
        case types.GAMEINFO:
            return{...state, gameObject: action.payload};
        case types.CREATEBUTTONWASCLICKED:
            return{...state, createButtonWasClicked: action.payload};
        case types.JOINBUTTONWASCLICKED:
            return {...state, joinButtonWasClicked: action.payload};
        case types.PLAYERARRAYS:
            return {...state, gameArrays: action.payload};
        default:
            return state
    }
}