import types from '../actions/types';
import openSocket from 'socket.io-client';
import { subscribeToTimer } from "../api";

const socket = openSocket('http://localhost:8000');
const data = subscribeToTimer;

const DEFAULT_STATE = {setConn: socket, socketData: data};

export default function (state=DEFAULT_STATE, action){
    switch(action.type){
        case types.setConn:
            return{...state, socketConnection: action.payload};
        case types.socketData:
            return{...state, serverData: action.payload};
        default:
            return state
    }
}