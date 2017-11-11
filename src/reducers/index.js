import { combineReducers } from 'redux';
import uiReducer from './user_interface';
import connReducer from './socket_connection';

export default combineReducers(
    {
        userInterface: uiReducer,
        socketConnection: connReducer
    }
);