import * as React from 'react';
import { AppContext } from 'ui/AppContext';
import { movePlayHeadAction, timelineZoomAction, unselectAllKeyframesAction, timelineSetOffsetAction, selectKeyFrameAction } from 'ui/state/AppActions';
import { COLOR_BG_1, COLOR_BG_2, COLOR_BG_3, COLOR_HIGHLIGHT } from 'ui/styles/colors';

import { AnimationGroupHeader } from './AnimationGroupHeader';
import { AnimationGroupTimeline } from './AnimationGroupTimeline';
import { TIMELINE_HEADER_WIDTH_PX } from './style';
import { TimelineHeader } from './TimelineHeader';
import { TimelineRuler } from './TimelineRuler';
import { TIMELINE_DURATION_MS } from 'ui/constants';

const TIMELINE_STYLE: React.CSSProperties = {
    backgroundColor: COLOR_BG_1,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column'
}

interface SelectBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export function Timeline() {

    const [height, setHeight] = React.useState(450);

    const dockRef = React.useRef<HTMLDivElement>(null);

    const { state, dispatch, animationService, multiSelectService } = React.useContext(AppContext);

    function startDrag(evt: React.MouseEvent) {
        if (evt.button !== 0) return;
        evt.preventDefault();
        const startY = evt.clientY;

        function onMove(evt: MouseEvent) {
            setHeight(height - evt.clientY + startY);
        }

        function onUp(_evt: MouseEvent) {
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('mousemove', onMove);
            if (dockRef.current == null) {
                return;
            }
            setHeight(dockRef.current.clientHeight);
        }

        window.addEventListener('mouseup', onUp);
        window.addEventListener('mousemove', onMove);
    }

    // TODO: Move to ruler
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
    }, [state.timeline, animationService, state.selectedEntities]);

    const [selectBox, setSelectBox] = React.useState<SelectBox | null>(null);

    const onMouseDownTimeline = React.useCallback((evt: React.MouseEvent) => {
        if (evt.button !== 0) {
            return;
        }
        evt.preventDefault();

        if (!evt.shiftKey) {
            dispatch(unselectAllKeyframesAction());
        }

        const origin = {
            x: evt.clientX - (timelineRef.current?.getBoundingClientRect().x ?? 0) - state.timeline.msOffset / state.timeline.msPerPx,
            y: evt.clientY - (timelineRef.current?.getBoundingClientRect().y ?? 0)
        };

        setSelectBox({
            x1: origin.x,
            y1: origin.y,
            x2: origin.x,
            y2: origin.y
        });

        function mouseMove(evt: MouseEvent) {
            const dx = (timelineRef.current?.getBoundingClientRect().x ?? 0);
            const dy = (timelineRef.current?.getBoundingClientRect().y ?? 0);
            const dest = {
                x: evt.clientX - dx - state.timeline.msOffset / state.timeline.msPerPx,
                y: evt.clientY - dy
            };
            setSelectBox({
                x1: origin.x,
                y1: origin.y,
                x2: dest.x,
                y2: dest.y
            });
            multiSelectService.getKeyFramesInArea(origin.x + dx + state.timeline.msOffset / state.timeline.msPerPx, origin.y + dy, dest.x + dx + state.timeline.msOffset / state.timeline.msPerPx, dest.y + dy).forEach((keyFrameId) => {
                dispatch(selectKeyFrameAction({keyFrameId}));
            });
        }
        function mouseUp() {
            setSelectBox(null);
            window.removeEventListener('mousemove', mouseMove);
            window.removeEventListener('mouseup', mouseUp);
        }
        window.addEventListener('mousemove', mouseMove);
        window.addEventListener('mouseup', mouseUp);
    }, [state.timeline, animationService, state.selectedEntities]);

    const timelineRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        // Must manually bind wheel event in order to use preventDefault()
        function onWheel(evt: WheelEvent) {
            const direction = Math.abs(evt.deltaX) > Math.abs(evt.deltaY) ? 'x' : 'y';

            if (evt.shiftKey && direction === 'y') {
                evt.preventDefault();
                const factor = 1 + evt.deltaY * 0.01;
                const center = (evt.clientX - TIMELINE_HEADER_WIDTH_PX) * state.timeline.msPerPx + state.timeline.msOffset;
                dispatch(timelineZoomAction({ factor, center }));
            } else if (direction === 'x') {
                evt.preventDefault();
                dispatch(timelineSetOffsetAction({ msOffset: state.timeline.msOffset + evt.deltaX * state.timeline.msPerPx }))
            }
        }
        const el = timelineRef.current;
        el?.addEventListener('wheel', onWheel);
        return () => {
            el?.removeEventListener('wheel', onWheel);
        }
    }, [state.timeline]);

    return <div ref={dockRef} style={{
        ...TIMELINE_STYLE,
        height
    }}>
        <div style={{
            position: 'absolute',
            height: '3px',
            width: '100%',
            cursor: 'ns-resize',
            top: 0,
            marginTop: '-1px'
        }}
        onMouseDown={startDrag}></div>

        <div style={{
            display: 'flex'
        }}>
            <div style={{
                width: `${TIMELINE_HEADER_WIDTH_PX}px`,
                backgroundColor: COLOR_BG_3
            }}>
                <TimelineHeader />
            </div>
            <div onMouseDown={onMouseDownRuler} style={{
                backgroundColor: COLOR_BG_2,
                flexGrow: 1,
                position: 'relative',
                overflow: 'hidden'
            }}>
                <TimelineRuler />
            </div>
        </div>
        <div style={{
            flexGrow: 1,
            overflow: 'auto'
        }}>
            <div style={{
                display: 'flex',
                minHeight: '100%'
            }}>
                <div style={{
                    width: `${TIMELINE_HEADER_WIDTH_PX}px`,
                    backgroundColor: COLOR_BG_3,
                    flexShrink: 0
                }}>
                    { state.animations.groups.map(g => <AnimationGroupHeader key={g.id} group={g} />)}
                </div>
                <div onMouseDown={onMouseDownTimeline} style={{
                    backgroundColor: COLOR_BG_2,
                    flexGrow: 1,
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div ref={timelineRef} style={{
                        position: 'absolute',
                        left: `${-state.timeline.msOffset / state.timeline.msPerPx}px`,
                        width: TIMELINE_DURATION_MS / state.timeline.msPerPx + (timelineRef.current?.parentElement?.clientWidth ?? 0)
                    }}>
                        { state.animations.groups.map(g => <AnimationGroupTimeline key={g.id} group={g} />)}
                        <div style={{
                            backgroundColor: 'red',
                            position: 'absolute',
                            top: '0',
                            width: '1px',
                            height: '100%',
                            left: `${state.playHead / state.timeline.msPerPx}px`,
                            pointerEvents: 'none'
                        }}></div>
                    </div>
                    { selectBox && <div style={{
                        position: 'absolute',
                        pointerEvents: 'none',
                        border: `1px ${COLOR_HIGHLIGHT} solid`,
                        left: Math.min(selectBox.x1, selectBox.x2),
                        top: Math.min(selectBox.y1, selectBox.y2),
                        width: Math.abs(selectBox.x2 - selectBox.x1),
                        height: Math.abs(selectBox.y2 - selectBox.y1),
                        }}></div> }
                </div>
            </div>
        </div>
    </div>;
}