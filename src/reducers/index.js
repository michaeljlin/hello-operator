import { combineReducers } from 'redux';
import uiReducer from './user_interface';
import connReducer from './socket_connection';
import playerInfo from './player_info'
import comInfo from './communication_panel';

export default combineReducers(
    {
        userInterface: uiReducer,
        socketConnection: connReducer,
        playerInformation: playerInfo,
        // comInformation: comInfo,
    }
);