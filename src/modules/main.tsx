import { App } from 'ui/App';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import gsap from 'gsap';
import { DrawSVGPlugin }  from 'gsap/DrawSVGPlugin';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { appReducer } from 'ui/state/AppReducer';
import { appInitialState } from 'ui/state/AppState';

gsap.registerPlugin(DrawSVGPlugin);

const store = createStore(appReducer, appInitialState);

// Module entry point
ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('app')
);
