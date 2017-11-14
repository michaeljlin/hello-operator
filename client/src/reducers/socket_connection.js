import types from '../actions/types';
// import openSocket from 'socket.io-client';
//
// const socket = openSocket('http://localhost:8000');

const DEFAULT_STATE = {setConn: null};

export default function (state=DEFAULT_STATE, action){
    switch(action.type){
        case types.SETCONN:
            return{...state, setConn: action.payload};
        case types.CON_ON:
            return{...state, setConn: action.payload};
        default:
            return state
    }
}