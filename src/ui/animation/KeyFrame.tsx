import { AnimationKeyFrame } from 'animation/domain/AnimationModel';
import * as React from 'react';
import { AppContext } from 'ui/AppContext';
import { movePlayHeadAction, toggleKeyFrameSelection, unselectAllKeyframesAction } from 'ui/state/AppActions';
import { COLOR_BG_0, COLOR_BG_3, COLOR_BG_4, COLOR_HIGHLIGHT } from 'ui/styles/colors';

import { TIMELINE_HEADER_WIDTH_PX } from './style';

interface KeyFrameProps {
    groupId: string;
    propertyId: string;
    keyFrame: AnimationKeyFrame;
}

export function KeyFrame(props: KeyFrameProps) {

    const { state, dispatch, animationService, multiSelectService } = React.useContext(AppContext);

    const position = props.keyFrame.time / state.timeline.msPerPx;
    const isCurrent = React.useMemo(() => state.playHead === props.keyFrame.time, [props.keyFrame, state.playHead]);
    const isSelected = state.selectedEntities?.some(e => e.type === 'keyframe' && e.id === props.keyFrame.id);

    const elementRef = React.useRef<HTMLDivElement>(null);

    multiSelectService.useKeyFrameElementRef({
        groupId: props.groupId,
        id: props.keyFrame.id,
        propId: props.propertyId
    }, elementRef);

    const onMouseDown = React.useCallback((evt: React.MouseEvent) => {
        evt.preventDefault();
        evt.stopPropagation();
        evt.nativeEvent.stopImmediatePropagation();
        const hasModifier = evt.metaKey || evt.ctrlKey;
        const deltaX = position - evt.clientX + TIMELINE_HEADER_WIDTH_PX - state.timeline.msOffset / state.timeline.msPerPx;

        let startTime: number = props.keyFrame.time;
        let hasMoved = false;
        
        if (!isSelected) {
            if (!hasModifier) {
                dispatch(unselectAllKeyframesAction());
            }
            dispatch(toggleKeyFrameSelection({
                groupId: props.groupId,
                propertyId: props.propertyId,
                keyFrame: props.keyFrame
            }));
        } else if (hasModifier) {
            dispatch(toggleKeyFrameSelection({
                groupId: props.groupId,
                propertyId: props.propertyId,
                keyFrame: props.keyFrame
            }));
        }
        const movement = animationService.beginKeyFrameMove();

        window.addEventListener('mousemove', mouseMove);
        window.addEventListener('mouseup', mouseUp);

        function move(pos: number) {
            hasMoved = true;
            const currentTime = animationService.getSnappedTimeAtPixelOffset(pos + deltaX);
            console.log(deltaX);
            console.log(currentTime - startTime);
            movement.setOffset(currentTime - startTime);
        }
        function mouseMove(evt: MouseEvent) {
            move(evt.clientX);
        }
        function mouseUp() {
            if (!hasMoved && !hasModifier) {
                dispatch(movePlayHeadAction(props.keyFrame.time));
                if (isSelected) {
                    dispatch(unselectAllKeyframesAction());
                    dispatch(toggleKeyFrameSelection({
                        groupId: props.groupId,
                        propertyId: props.propertyId,
                        keyFrame: props.keyFrame
                    }));
                }
            }
            window.removeEventListener('mousemove', mouseMove);
            window.removeEventListener('mouseup', mouseUp);
        }
    }, [position, props.groupId, props.propertyId, props.keyFrame, isSelected, state.timeline]);

    const style = React.useMemo((): React.CSSProperties => ({
        position: 'absolute',
        cursor: 'pointer',
        border: `1px ${COLOR_BG_4} solid`,
        width: '14px',
        height: '14px',
        backgroundColor: isSelected ? COLOR_HIGHLIGHT : isCurrent ? COLOR_BG_3 : COLOR_BG_0,
        transform: 'rotate(45deg)',
        left: `${position - 8}px`
    }), [position, isCurrent, isSelected])
    return <div style={style} onMouseDown={onMouseDown} ref={elementRef}></div>;
}