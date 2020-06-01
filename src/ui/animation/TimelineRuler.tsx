import * as React from 'react';
import { COLOR_BG_3, COLOR_TEXT_MAIN } from 'ui/styles/colors';

import { TIMELINE_HEADER_HEIGHT } from './style';
import { AppContext } from 'ui/AppContext';

const CONTAINER_STYLE: React.CSSProperties = {
    backgroundColor: COLOR_BG_3,
    height: TIMELINE_HEADER_HEIGHT,
    whiteSpace: 'nowrap',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'default'
};

const SPACING = 60;


const TICKER_STYLE: React.CSSProperties = {
    borderLeft: `1px ${COLOR_TEXT_MAIN} solid`,
    height: '9px',
    width: `${SPACING}px`,
    position: 'absolute',
    bottom: '0'
};

export function TimelineRuler() {

    const [width, setWidth] = React.useState(0);

    const { state } = React.useContext(AppContext);

    React.useEffect(() => {
        function onResize() {
            console.log('recomputing');
            if (elRef.current != null) {
                setWidth(elRef.current.getBoundingClientRect().width);
            }
        }
        window.addEventListener('resize', onResize, { passive: true });

        return () => {
            window.removeEventListener('resize', onResize);
        };
    }, []);

    const elRef = React.useRef<HTMLDivElement | null>(null);
    
    const measuredRef = React.useCallback((node: HTMLDivElement | null) => {
        elRef.current = node;
        if (node !== null) {
            setWidth(node.getBoundingClientRect().width);
        }
    }, []);

    const minIncrementMs = state.timeline.msPerPx * SPACING * 10;
    const minIncrementMsOom = Math.pow(10, Math.floor(Math.log(minIncrementMs) / Math.LN10));

    const increment = minIncrementMsOom ; //Math.ceil(state.timeline.msPerPx * SPACING / 5) * 5;
    const incrementPx = increment / state.timeline.msPerPx;
    const start = Math.floor(state.timeline.msOffset / minIncrementMsOom);
    const total = Math.ceil(width / incrementPx) + 1;
    const pixelOffset = state.timeline.msOffset / state.timeline.msPerPx;

    const ticks = [];
    for (let i = start ; i < start + total ; i++) {
        const time = i * increment / 1000;
        const second = Math.floor(time);
        const secondMs = time - second;
        ticks.push(
            <div key={i} style={{ position: 'absolute', height: '100%', left: i * incrementPx - pixelOffset, paddingTop: '3px'}}>
                <span style={{paddingLeft: '1px'}}>
                    {`${second}.${Math.round(secondMs * state.animations.framesPerSecond) + 1}`}
                </span>
                <div style={TICKER_STYLE}></div>
            </div>);
    }
    

    return <div ref={measuredRef} style={CONTAINER_STYLE}>
        {ticks}
    </div>;
}