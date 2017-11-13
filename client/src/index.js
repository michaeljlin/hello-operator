import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
// import io from 'socket.io-client';
// let socket = io('http://localhost:8000');
import rootReducer from './reducers/index'
import { BrowserRouter as Router } from 'react-router-dom';

const store = createStore(rootReducer);

import App from './components/app';

ReactDOM.render(
    <Provider store = {store}>
        <Router>
            <App />
        </Router>
    </Provider>,
    document.getElementById('root')
);

// export  default store;
