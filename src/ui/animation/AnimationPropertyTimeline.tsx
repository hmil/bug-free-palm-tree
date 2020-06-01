import { AnimationProperty } from 'animation/domain/AnimationModel';
import * as React from 'react';
import { uniqId } from 'std/uid';
import { AppContext } from 'ui/AppContext';
import { addKeyFrameAction, toggleKeyFrameSelection } from 'ui/state/AppActions';

import { KeyFrame } from './KeyFrame';

interface AnimationPropertyTimelineProps {
    id: string;
    groupId: string;
    property: AnimationProperty;
    onChange: (previous: AnimationProperty, next: AnimationProperty) => void;
}

export function AnimationPropertyTimeline(props: AnimationPropertyTimelineProps) {

    const { state, dispatch, animationService } = React.useContext(AppContext);

    const onDoubleClick = React.useCallback((evt: React.MouseEvent) => {
        const keyFrame = {
            id: uniqId(),
            time: animationService.getSnappedTimeAtPixelOffset(evt.clientX),
            value: 0
        };
        dispatch(addKeyFrameAction({
            groupId: props.groupId,
            propertyId: props.property.id,
            keyFrame
        }));
        dispatch(toggleKeyFrameSelection({
            groupId: props.groupId,
            propertyId: props.property.id,
            keyFrame
        }));
    }, [props.property, props.onChange, state.timeline.msPerPx]);

    return <div style={{paddingTop: '5px', height: '29px'}} onDoubleClick={onDoubleClick}>
        {props.property.keyFrames.map(k => <KeyFrame groupId={props.groupId} propertyId={props.id} keyFrame={k} key={k.id} />)}
    </div>;
}