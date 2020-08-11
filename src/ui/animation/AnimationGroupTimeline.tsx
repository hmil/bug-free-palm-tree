import { AnimationGroup, AnimationProperty } from 'animation/domain/AnimationModel';
import * as React from 'react';
import { arrayReplace } from 'std/readonly-arrays';
import { editGroupAction, selectElementAction, unselectAllElementsAction } from 'ui/state/AppActions';
import { useStateDispatch, useStateSelector } from 'ui/state/AppReducer';
import { COLOR_BG_0, COLOR_BG_3 } from 'ui/styles/colors';

import { AnimationPropertyTimeline } from './AnimationPropertyTimeline';

export interface AnimationGroupProps {
    group: AnimationGroup;
}

const CONTAINER_STYLE: React.CSSProperties = {
    paddingTop: '5px',
    paddingBottom: '5px',
    width: '100%',
    borderBottom: `1px ${COLOR_BG_0} solid`,
};

export function AnimationGroupTimeline(props: AnimationGroupProps) {

    const dispatch = useStateDispatch();

    const selectedEntities = useStateSelector(s => s.selectedEntities);
    const timeline = useStateSelector(s => s.timeline);

    const onPropertyChange = React.useCallback((previous: AnimationProperty, next: AnimationProperty) => {
        const idx = props.group.properties.indexOf(previous);
        if (idx < 0) {
            throw new Error('Cannot find property');
        }
        dispatch(editGroupAction({...props.group, properties: arrayReplace(props.group.properties, idx, next) }))
    }, [dispatch, props.group]);

    const onClick = React.useCallback(() => {
        dispatch(unselectAllElementsAction());
        dispatch(selectElementAction({
            path: props.group.elementSelectors[0]
        }));
    }, []);

    const isSelected = selectedEntities.some(s => s.type === 'element' && props.group.elementSelectors.indexOf(s.path) >= 0);

    const style = React.useMemo(() => ({
        ...CONTAINER_STYLE,
        backgroundColor: isSelected ? COLOR_BG_3 : undefined
    }), [isSelected, timeline.msPerPx]);

    return <div style={style} onClick={onClick}>
        <div style={{height: '24px'}}></div>
        {props.group.properties.map(p => <AnimationPropertyTimeline key={p.id} groupId={props.group.id} id={p.id} property={p} onChange={onPropertyChange}/>)}
    </div>;
}
