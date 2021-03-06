import { combineReducers } from 'redux';
import uiReducer from './user_interface';
import connReducer from './socket_connection';
import playerInfo from './player_info';
import {reducer as formReducer} from 'redux-form';
import comInfo from './communication_panel';
import loginInfo from './login';
import gameInfo from './open_game';
import userAuth from './user_auth';

export default combineReducers(
    {
        userInterface: uiReducer,
        socketConnection: connReducer,
        playerInformation: playerInfo,
        // comInformation: comInfo,
        loginInfo: loginInfo,
        form: formReducer,
        gameInformation: gameInfo,
        userAuthorization: userAuth,
    }
);