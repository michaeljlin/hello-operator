import { combineReducers } from 'redux';
import uiReducer from './user_interface';
import connReducer from './socket_connection';
import playerInfo from './player_info'

export default combineReducers(
    {
        userInterface: uiReducer,
        socketConnection: connReducer,
        playerInformation: playerInfo
    }
);