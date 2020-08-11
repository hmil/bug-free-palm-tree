import { AnimationGroup, AnimationProperty } from 'animation/domain/AnimationModel';
import * as React from 'react';
import { arrayInsert, arrayReplace } from 'std/readonly-arrays';
import { uniqId } from 'std/uid';
import { editGroupAction, removeGroupAction, selectElementAction, unselectAllElementsAction } from 'ui/state/AppActions';
import { useStateDispatch, useStateSelector } from 'ui/state/AppReducer';
import { COLOR_BG_0, COLOR_BG_4 } from 'ui/styles/colors';
import { Button } from 'ui/widgets/Button';
import { TextInput } from 'ui/widgets/TextInput';

import { AnimationPropertyHeader } from './AnimationPropertyHeader';


export interface AnimationGroupProps {
    group: AnimationGroup;
}

const CONTAINER_STYLE: React.CSSProperties = {
    paddingTop: '5px',
    paddingBottom: '5px',
    borderBottom: `1px ${COLOR_BG_0} solid`,
};


export const AnimationGroupHeader = React.memo(function _AnimationGroupHeader(props: AnimationGroupProps) {

    const dispatch = useStateDispatch();
    const selectedEntities = useStateSelector(s => s.selectedEntities);

    const value = props.group.elementSelectors.join(', ');

    const onSelectorChange = React.useCallback((newValue: string) => {
        dispatch(editGroupAction({...props.group, elementSelectors: newValue.split(',').map(s => s.trim()).filter(s => s.length > 0) }))
    }, [dispatch, props.group]);

    const onAddProperty = React.useCallback(() => {
        dispatch(editGroupAction({...props.group, properties: arrayInsert(props.group.properties, props.group.properties.length, { id: uniqId(), name: 'opacity', keyFrames: [] }) }))
    }, [dispatch, props.group]);

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

    const onTrash = React.useCallback(() => {
        dispatch(removeGroupAction({ groupId: props.group.id }));
    }, []);

    const isSelected = selectedEntities.some(s => s.type === 'element' && props.group.elementSelectors.indexOf(s.path) >= 0);
    const style = React.useMemo(() => ({
        ...CONTAINER_STYLE,
        backgroundColor: isSelected ? COLOR_BG_4 : undefined
    }), [isSelected]);

    return <div style={style} onClick={onClick}>
        <div style={{display: 'inline-block'}}>Selectors&nbsp;</div>
        <div style={{ width: '300px', display: 'inline-block' }}>
            <TextInput value={value} onChange={onSelectorChange} />
        </div>
        <div style={{display: 'inline-block', paddingLeft: '10px' }}>
            <Button value="+" onClick={onAddProperty} />
            <Button value="rm" onClick={onTrash} />
        </div>
        <div>
            { props.group.properties.map((p, i) => <AnimationPropertyHeader key={i} property={p} groupId={props.group.id} onChange={onPropertyChange} />)}
        </div>
    </div>;
});
