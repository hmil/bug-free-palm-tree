import { App } from 'ui/App';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import gsap from 'gsap';
import { DrawSVGPlugin }  from 'gsap/DrawSVGPlugin';

gsap.registerPlugin(DrawSVGPlugin);

// Module entry point
ReactDOM.render(
    React.createElement(App, null),
    document.getElementById('app')
);
