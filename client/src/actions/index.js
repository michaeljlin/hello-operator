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
    return {
        type: types.SETCONN,
        payload: socket
    }
}

export function reconnectOn(socket){
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

export function playerRole(role, agentName, playerId){
    let playerRoles = {
        spymaster: {
            agentName: '',
            playerId: '',
        },
        spy: {
            agentName: '',
            playerId: '',
        },
    };
    if(role === 'spymaster'){
        playerRoles.spymaster.agentName = agentName;
        playerRoles.spymaster.playerId = playerId;
    }
    else if(role === 'spy') {
        playerRoles.spy.agentName = agentName;
        playerRoles.spy.playerId = playerId;
    }
    return{
        type: types.PLAYERROLE,
        payload: playerRoles
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

export function userAuth(boolean){
    return {
        type: types.USER_AUTH,
        payload: boolean
    }
}

export function signUp(boolean){
    return {
        type: types.SIGNUPCLICKED,
        payload: boolean
    }
}

export function makePlayerArrays(playerTracker){
    return {
        type: types.PLAYERARRAYS,
        payload: {
            playerTracker
            // agentNames: playerTracker.playerAgentNames,
            // profilePics: playerTracker.playerProfilePics,
            // usernames: playerTracker.playerUsernames
        }
    }
}

export function makeGameArrays(gameTracker){
    return {
        type: types.GAMEARRAYS,
        payload: {
            gameTracker
        }
    }
}

export function storePlayerMessages(message){
    return {
        type: types.PLAYERMESSAGES,
        payload: {
            message
        }
    }
}

export function playerLoggedOut(logStatus){
    return {
        type: types.PLAYERLOGGEDOUT,
        payload: logStatus
    }
}