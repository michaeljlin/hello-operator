import types from './types';
import openSocket from 'socket.io-client';
// import { subscribeToTimer } from "../api";
import {connect} from 'react-redux';
import {store} from '../index';

export function displayTE (boolean) {
    return {
        type: types.DISPLAYTE,
        payload: boolean
    }
}

debugger;

export function setConn () {
    const socket = openSocket('http://localhost:8000');
    console.log(socket.on(message));
    return {
        type: types.SETCONN,
        payload: socket
    }
}

export function serverData(data) {
    // const data = subscribeToTimer;
    return {
        type: types.SERVERDATA,
        payload: data
    }
}