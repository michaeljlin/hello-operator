import types from './types';
// import openSocket from 'socket.io-client';
// import { subscribeToTimer } from "../api";

export function displayTE (boolean) {
    return {
        type: types.DISPLAYTE,
        payload: boolean
    }
}

export function setConn (socket) {
    // const socket = openSocket('http://localhost:8000');
    // console.log(socket.on(message));
    return {
        type: types.SETCONN,
        payload: socket
    }
}

export function reconnectOn(socket){
    console.log("inside reconnectOn:",socket);
    socket.io._reconnection = true;
    return {
        type: types.CON_ON,
        payload: socket
    }
}

// export function serverData(data) {
//     // const data = subscribeToTimer;
//     return {
//         type: types.SERVERDATA,
//         payload: data
//     }
// }

// export function playerParent(parent){
//     return {
//         type: types.PLAYERPARENT,
//         payload: parent
//     }
// }
//
// export function comParent(parent){
//     return {
//         type: types.COMPARENT,
//         payload: parent
//     }
// }

export function playerInfo(playerData){
    return{
        type: types.PLAYERINFO,
        payload: playerData
    }
}

export function playerRole(role){
    return{
        type: types.PLAYERROLE,
        payload: role
    }
}

export function loginInput(inputValues){
    return{
        type: types.LOGININPUT,
        payload: inputValues
    }
}

export function gameInfo(gameData){
    return{
        type: types.GAMEINFO,
        payload: gameData
    }
}

export function createButton(boolean){
    return{
        type: types.CREATEBUTTONWASCLICKED,
        payload: boolean
    }
}

export function joinButton(boolean){
    return{
        type: types.JOINBUTTONWASCLICKED,
        payload: boolean
    }
}

export function modalActions(modalVisibility, glyphiconVisibility){
    return{
        type: types.MODALACTIONS,
        payload: {
            modalVisibility: modalVisibility,
            glyphiconVisibility: glyphiconVisibility,
        }
    }
}

export function playerEvent(event, icon){
    return {
        type: types.PLAYEREVENT,
        payload: {
            event: event,
            icon: icon,
        }
    }
}