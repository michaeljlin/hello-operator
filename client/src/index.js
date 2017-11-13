import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import rootReducer from './reducers/index';

const store = createStore(rootReducer);

import App from './components/app';

ReactDOM.render(
    <Provider store = {store}>
        {/*<App conn={socket}/>*/}
        <App />
    </Provider>,
    document.getElementById('root')
);

// export  default store;
