import types from '../actions/types';
import openSocket from 'socket.io-client';

const socket = openSocket('http://localhost:8000');

const DEFAULT_STATE = {setConn: socket};

export default function (state=DEFAULT_STATE, action){
    switch(action.type){
        case types.setConn:
            return{...state, socketConnection: action.payload};
        default:
            return state
    }
}