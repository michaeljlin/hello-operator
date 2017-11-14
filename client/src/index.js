import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
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

