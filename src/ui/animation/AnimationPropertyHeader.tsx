import * as React from 'react';
import { AnimationProperty } from 'animation/domain/AnimationModel';
import { TextInput } from 'ui/widgets/TextInput';
import { AppContext } from 'ui/AppContext';
import { arrayReplace } from 'std/readonly-arrays';
import { addKeyFrameAction } from 'ui/state/AppActions';
import { uniqId } from 'std/uid';
import gsap from 'gsap';

interface AnimationPropertyHeaderProps {
    groupId: string;
    property: AnimationProperty;
    onChange: (previous: AnimationProperty, next: AnimationProperty) => void;
}

export function AnimationPropertyHeader(props: AnimationPropertyHeaderProps) {

    const { state, dispatch } = React.useContext(AppContext);

    const currentKf = props.property.keyFrames.find(kf => kf.time === state.playHead);
    const currentValue = currentKf != null ? (typeof currentKf.value === 'string' ? currentKf.value : JSON.stringify(currentKf.value)) :
        String(gsap.getProperty(state.animations.groups.find(g => g.id === props.groupId)?.elementSelectors.join(', ') ?? '', props.property.name));
        // (document.querySelector(state.animations.groups.find(g => g.id === props.groupId)?.elementSelectors.join(', ') ?? '') as HTMLElement)
        //     ?.style[props.property.name as any];

    if (props.property.name === 'drawSVG') {
        console.log(currentValue);
    }

    const onNameChange = React.useCallback((name: string) => {
        props.onChange(props.property, {
            ...props.property,
            name
        })
    }, [props.property, props.onChange]);

    const onValueChange = React.useCallback((value: string) => {
        try {
            value = JSON.parse(value);
        } catch (e) {
            console.warn(e);
        }
        if (value === currentValue) {
            return;
        }
        const v = value;
        const k = props.property.keyFrames.findIndex(k => k.time === state.playHead);
        if (k < 0) {
            dispatch(addKeyFrameAction({
                groupId: props.groupId,
                propertyId: props.property.id,
                keyFrame: {
                    id: uniqId(),
                    time: state.playHead,
                    value: v
                }
            }));
        } else {
            props.onChange(props.property, {
                ...props.property,
                keyFrames: arrayReplace(props.property.keyFrames, k, {
                    ...props.property.keyFrames[k], value: v
                })
            });
        }
    }, [props.property, props.onChange, state.playHead, currentValue]);

    return <div style={{padding: '5px', paddingBottom: '0'}}>
        <div style={{
            display: 'inline-block',
            width: '100px'
        }}>
            <TextInput value={props.property.name} onChange={onNameChange} />
        </div>
        <div style={{
            display: 'inline-block',
            width: '200px',
            marginLeft: '5px'
        }}>
            <TextInput value={currentValue} onChange={onValueChange} />
        </div>
    </div>;
}
