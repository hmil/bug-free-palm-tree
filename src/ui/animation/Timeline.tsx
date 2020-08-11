import * as React from 'react';
import { AppServices } from 'ui/AppContext';
import { TIMELINE_DURATION_MS } from 'ui/constants';
import {
    selectKeyFrameAction,
    timelineSetOffsetAction,
    timelineZoomAction,
    unselectAllKeyframesAction,
    unSelectKeyFrameAction,
} from 'ui/state/AppActions';
import { COLOR_BG_1, COLOR_BG_2, COLOR_BG_3, COLOR_BG_DELIMITER, COLOR_HIGHLIGHT } from 'ui/styles/colors';

import { AnimationGroupHeader } from './AnimationGroupHeader';
import { AnimationGroupTimeline } from './AnimationGroupTimeline';
import { TIMELINE_HEADER_WIDTH_PX, TIMELINE_HEADER_HEIGHT } from './style';
import { TimelineHeader } from './TimelineHeader';
import { TimelineRuler } from './TimelineRuler';
import { useStateDispatch, useStateSelector } from 'ui/state/AppReducer';
import { TimelineBar } from './TimelineBar';
import { KeyFrameId } from './MultiSelectService';

const TIMELINE_STYLE: React.CSSProperties = {
    backgroundColor: COLOR_BG_1,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
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

    const { animationService, multiSelectService } = React.useContext(AppServices);

    const dispatch = useStateDispatch();
    const timeline = useStateSelector(s => s.timeline);
    const selectedEntities = useStateSelector(s => s.selectedEntities);
    const animations = useStateSelector(s => s.animations);

    function startDrag(evt: React.MouseEvent) {
        if (evt.button !== 0) return;
        evt.preventDefault();
        const startY = evt.clientY;

        function onMove(evt: MouseEvent) {
            setHeight(Math.max(height - evt.clientY + startY, TIMELINE_HEADER_HEIGHT));
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

    const [selectBox, setSelectBox] = React.useState<SelectBox | null>(null);
    // const [pendingSelection, setPendingSelection] = React.useState<KeyFrameId[]>([]);

    const onMouseDownTimeline = React.useCallback((evt: React.MouseEvent) => {
        let pendingSelection: KeyFrameId[] = [];
        if (evt.button !== 0) {
            return;
        }
        evt.preventDefault();

        if (!evt.ctrlKey) {
            dispatch(unselectAllKeyframesAction());
        }

        const origin = {
            x: evt.clientX - (timelineRef.current?.getBoundingClientRect().x ?? 0) - timeline.msOffset / timeline.msPerPx,
            y: evt.clientY - (timelineRef.current?.getBoundingClientRect().y ?? 0)
        };

        setSelectBox({
            x1: origin.x,
            y1: origin.y,
            x2: origin.x,
            y2: origin.y
        });
        pendingSelection = [];

        function mouseMove(evt: MouseEvent) {
            const dx = (timelineRef.current?.getBoundingClientRect().x ?? 0);
            const dy = (timelineRef.current?.getBoundingClientRect().y ?? 0);
            const dest = {
                x: evt.clientX - dx - timeline.msOffset / timeline.msPerPx,
                y: evt.clientY - dy
            };
            setSelectBox({
                x1: origin.x,
                y1: origin.y,
                x2: dest.x,
                y2: dest.y
            });
            const current = multiSelectService.getKeyFramesInArea(
                    origin.x + dx + timeline.msOffset / timeline.msPerPx, origin.y + dy,
                    dest.x + dx + timeline.msOffset / timeline.msPerPx, dest.y + dy);

            const added = current.filter(c => !pendingSelection.includes(c));
            added.forEach((keyFrameId) => {
                    dispatch(selectKeyFrameAction({keyFrameId}));
                });
            const removed = pendingSelection.filter(p => !current.includes(p));
            removed.forEach((keyFrameId) => {
                dispatch(unSelectKeyFrameAction({keyFrameId}));
            });
            pendingSelection = current;
        }
        function mouseUp() {
            setSelectBox(null);
            window.removeEventListener('mousemove', mouseMove);
            window.removeEventListener('mouseup', mouseUp);
        }
        window.addEventListener('mousemove', mouseMove);
        window.addEventListener('mouseup', mouseUp);
    }, [timeline, animationService, selectedEntities]);

    const timelineRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        // Must manually bind wheel event in order to use preventDefault()
        function onWheel(evt: WheelEvent) {
            const direction = Math.abs(evt.deltaX) > Math.abs(evt.deltaY) ? 'x' : 'y';

            if (evt.shiftKey && direction === 'y') {
                evt.preventDefault();
                const factor = 1 + evt.deltaY * 0.01;
                const center = (evt.clientX - TIMELINE_HEADER_WIDTH_PX) * timeline.msPerPx + timeline.msOffset;
                dispatch(timelineZoomAction({ factor, center }));
            } else if (direction === 'x') {
                evt.preventDefault();
                dispatch(timelineSetOffsetAction({ msOffset: timeline.msOffset + evt.deltaX * timeline.msPerPx }))
            }
        }
        const el = timelineRef.current;
        el?.addEventListener('wheel', onWheel);
        return () => {
            el?.removeEventListener('wheel', onWheel);
        }
    }, [timeline]);

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
            <div style={{
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
                    border: `1px ${COLOR_BG_DELIMITER} solid`,
                    borderTop: 0,
                    backgroundColor: COLOR_BG_3,
                    flexShrink: 0
                }}>
                    { animations.groups.map(g => <AnimationGroupHeader key={g.id} group={g} />)}
                </div>
                <div onMouseDown={onMouseDownTimeline} style={{
                    backgroundColor: COLOR_BG_2,
                    flexGrow: 1,
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div ref={timelineRef} style={{
                        position: 'absolute',
                        left: `${-timeline.msOffset / timeline.msPerPx}px`,
                        width: TIMELINE_DURATION_MS / timeline.msPerPx + (timelineRef.current?.parentElement?.clientWidth ?? 0)
                    }}>
                        { animations.groups.map(g => <AnimationGroupTimeline key={g.id} group={g} />)}
                        <TimelineBar />
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
