import { combineReducers } from 'redux';
import uiReducer from './user_interface';

export default combineReducers(
    {
        userInterface: uiReducer
    }
);