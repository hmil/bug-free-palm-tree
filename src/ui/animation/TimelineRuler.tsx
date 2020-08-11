import * as React from 'react';
import { AppServices } from 'ui/AppContext';
import { movePlayHeadAction } from 'ui/state/AppActions';
import { useStateDispatch, useStateSelector } from 'ui/state/AppReducer';
import { COLOR_BG_3, COLOR_BG_DELIMITER, COLOR_TEXT_MAIN } from 'ui/styles/colors';

import { TIMELINE_HEADER_HEIGHT } from './style';

const CONTAINER_STYLE: React.CSSProperties = {
    backgroundColor: COLOR_BG_3,
    height: TIMELINE_HEADER_HEIGHT,
    whiteSpace: 'nowrap',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'default',
    border: `1px ${COLOR_BG_DELIMITER} solid`,
    borderLeft: 0
};

const SPACING = 60;


const TICKER_STYLE: React.CSSProperties = {
    borderLeft: `1px ${COLOR_TEXT_MAIN} solid`,
    height: '9px',
    width: `${SPACING}px`,
    position: 'absolute',
    bottom: '0'
};

export const TimelineRuler = React.memo(function _TimelineRuler() {

    const [width, setWidth] = React.useState(0);

    const { animationService } = React.useContext(AppServices);

    const dispatch = useStateDispatch();
    const timeline = useStateSelector(s => s.timeline);
    const selectedEntities = useStateSelector(s => s.selectedEntities);

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


    const onMouseDownRuler = React.useCallback((evt: React.MouseEvent) => {
        if (evt.button !== 0) {
            return;
        }
        evt.preventDefault();
        function move(pos: number) {
            dispatch(movePlayHeadAction(animationService.getSnappedTimeAtPixelOffset(pos)));
        }
        move(evt.clientX);
        function mouseMove(evt: MouseEvent) {
            move(evt.clientX);
        }
        function mouseUp() {
            window.removeEventListener('mousemove', mouseMove);
            window.removeEventListener('mouseup', mouseUp);
        }
        window.addEventListener('mousemove', mouseMove);
        window.addEventListener('mouseup', mouseUp);
    }, [timeline, animationService, selectedEntities]);

    const elRef = React.useRef<HTMLDivElement | null>(null);
    
    const measuredRef = React.useCallback((node: HTMLDivElement | null) => {
        elRef.current = node;
        if (node !== null) {
            setWidth(node.getBoundingClientRect().width);
        }
    }, []);

    const minIncrementMs = timeline.msPerPx * SPACING * 10;
    const minIncrementMsOom = Math.pow(10, Math.floor(Math.log(minIncrementMs) / Math.LN10));

    const increment = minIncrementMsOom ; //Math.ceil(state.timeline.msPerPx * SPACING / 5) * 5;
    const incrementPx = increment / timeline.msPerPx;
    const start = Math.floor(timeline.msOffset / minIncrementMsOom);
    const total = Math.ceil(width / incrementPx) + 1;
    const pixelOffset = timeline.msOffset / timeline.msPerPx;

    const ticks = [];
    for (let i = start ; i < start + total ; i++) {
        const time = i * increment;
        ticks.push(
            <div key={i} style={{ position: 'absolute', height: '100%', left: i * incrementPx - pixelOffset, paddingTop: '3px'}}>
                <span style={{paddingLeft: '1px'}}>
                    {animationService.formatTime(time)}
                </span>
                <div style={TICKER_STYLE}></div>
            </div>);
    }
    

    return <div ref={measuredRef} style={CONTAINER_STYLE} onMouseDown={onMouseDownRuler}>
        {ticks}
    </div>;
});
