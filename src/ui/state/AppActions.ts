import { AppState, AppSelectedEntity } from './AppState';
import { AnimationGroup, AnimationModel, AnimationKeyFrame } from 'animation/domain/AnimationModel';
import { arrayReplace, arrayInsert, arrayRemove } from 'std/readonly-arrays';
import { uniqId } from 'std/uid';
import { TIMELINE_DURATION_MS } from 'ui/constants';
import { KeyFrameId } from 'ui/animation/MultiSelectService';

export interface BaseAction<Type extends string, DATA> {
    type: Type;
    data: DATA;
}

type UnknownToVoid<T> = unknown extends T ? T extends void ? T : void : T;

interface ActionFactory<Type extends string, S, D> {
    (d: UnknownToVoid<D>): BaseAction<Type, UnknownToVoid<D>>;
    reduce(s: S, a: D): S;
}

function action<T extends string, S, D>(type: T, factory: (s: S, data: D) => S): ActionFactory<T, S, D> {
    const f: ActionFactory<T, S, D> = data => ({ data, type });
    f.reduce = factory;
    return f;
}

export const loadSvgAction = action('loadSvgAction', (state: AppState, {svgSource}: {svgSource: string}): AppState => ({
    ...state,
    svgSource
}));

export const loadAnimationData = action('loadAnimationData', (state: AppState, {animations}: {animations: AnimationModel}): AppState => ({
    ...state,
    animations
}));

export const addGroupAction = action('addGroupAction', (state: AppState, {elementSelectors}: {elementSelectors: string[]}) => ({
    ...state,
    animations: {
        ...state.animations,
        groups: [...state.animations.groups, {id: uniqId(), elementSelectors, properties: []}]
    }
}));

export const removeGroupAction = action('removeGroupAction', (state: AppState, { groupId }: { groupId: string }) => ({
    ...state,
    animations: {
        ...state.animations,
        groups: state.animations.groups.filter(g => g.id !== groupId)
    }
}));

export const editGroupAction = action('editGroupAction', (state: AppState, group: AnimationGroup): AppState => {

    const index = state.animations.groups.findIndex(g => g.id === group.id);
    if (index < 0) {
        throw new Error('Could not find group');
    }

    return {
        ...state,
        animations: {
            ...state.animations,
            groups: arrayReplace(state.animations.groups, index, group)
        }
    };
});

export const movePlayHeadAction = action('movePlayHeadAction', (state: AppState, position: number): AppState => ({
    ...state,
    playHead: position
}));

export const addKeyFrameAction = action('addKeyFrameAction', (state: AppState, {groupId, propertyId, keyFrame}: {groupId: string, propertyId: string, keyFrame: AnimationKeyFrame}): AppState => {
    const group = state.animations.groups.findIndex(g => g.id === groupId);
    if (group < 0) {
        throw new Error('Cannot find group');
    }
    const prop = state.animations.groups[group].properties.findIndex(p => p.id === propertyId);
    if (prop < 0) {
        throw new Error('Cannot find prop');
    }

    const keyFrames = arrayInsert(state.animations.groups[group].properties[prop].keyFrames, state.animations.groups[group].properties[prop].keyFrames.length, keyFrame)
            .sort((a, b) => a.time < b.time ? -1 : a.time > b.time ? 1 : 0);
    return {
        ...state,
        animations: {
            ...state.animations,
            groups: arrayReplace(state.animations.groups, group, {
                ...state.animations.groups[group],
                properties: arrayReplace(state.animations.groups[group].properties, prop, {
                    ...state.animations.groups[group].properties[prop],
                    keyFrames
                })
            })
        }
    };
});

export const updateKeyFrameAction = action('updateKeyFrameAction', (state: AppState, {groupId, propertyId, keyFrame}: {groupId: string, propertyId: string, keyFrame: AnimationKeyFrame}): AppState => {
    const group = state.animations.groups.findIndex(g => g.id === groupId);
    if (group < 0) {
        throw new Error('Cannot find group');
    }
    const prop = state.animations.groups[group].properties.findIndex(p => p.id === propertyId);
    if (prop < 0) {
        throw new Error('Cannot find prop');
    }
    const key = state.animations.groups[group].properties[prop].keyFrames.findIndex(k => k.id === keyFrame.id);
    if (key < 0) {
        throw new Error('Cannot find key');
    }

    // Prevent two keyframes at same time
    if (state.animations.groups[group].properties[prop].keyFrames.find(k => k.time === keyFrame.time) != null) {
        return state;
    }

    const keyFrames = arrayReplace(state.animations.groups[group].properties[prop].keyFrames, key, keyFrame)
            .sort((a, b) => a.time < b.time ? -1 : a.time > b.time ? 1 : 0);
    return {
        ...state,
        animations: {
            ...state.animations,
            groups: arrayReplace(state.animations.groups, group, {
                ...state.animations.groups[group],
                properties: arrayReplace(state.animations.groups[group].properties, prop, {
                    ...state.animations.groups[group].properties[prop],
                    keyFrames
                })
            })
        }
    };
});

export const toggleKeyFrameSelection = action('toggleKeyFrameSelection', (state: AppState, {groupId, propertyId, keyFrame}: {groupId: string, propertyId: string, keyFrame: AnimationKeyFrame}): AppState => {
    const selectedEntities = state.selectedEntities.filter(e => e.type !== 'keyframe' || e.id !== keyFrame.id);
    if (selectedEntities.length === state.selectedEntities.length) {
        selectedEntities.push({
            type: 'keyframe',
            id: keyFrame.id,
            groupId: groupId,
            propId: propertyId
        });
    }
    return {
        ...state,
        selectedEntities: selectedEntities
    };
});

export const selectKeyFrameAction = action('selectKeyFrameAction', (state: AppState, {keyFrameId}: {keyFrameId: KeyFrameId}): AppState => {
    if (state.selectedEntities.some(e => e.type === 'keyframe' && e.id === keyFrameId.id)) {
        return state;
    }
    return {
        ...state,
        selectedEntities: [
            ...state.selectedEntities,
            {
                type: 'keyframe',
                id: keyFrameId.id,
                groupId: keyFrameId.groupId,
                propId: keyFrameId.propId
            }
        ]
    };
});

export const unselectAllKeyframesAction = action('unselectAllKeyframesAction', (state: AppState): AppState => ({
    ...state,
    selectedEntities: state.selectedEntities.filter(e => e.type !== 'keyframe')
}));

export const selectElementAction = action('selectElementAction', (state: AppState, {path}: {path: string}): AppState => {
    if (state.selectedEntities.some(s => s.type === 'element' && s.path === path)) {
        return state;
    }
    return {
        ...state,
        selectedEntities: [...state.selectedEntities, {
            type: 'element',
            path
        }]
    };
});

export const unselectAllElementsAction = action('unselectAllElementsAction', (state: AppState): AppState => ({
    ...state,
    selectedEntities: state.selectedEntities.filter(e => e.type !== 'element')
}));

export const updateSelectionAction = action('updateSelectionAction', (state: AppState, selectedEntities: AppSelectedEntity[]): AppState => ({
    ...state,
    selectedEntities
}));

export const removeKeyFrameAction = action('removeKeyFrameAction', (state: AppState, {groupId, propertyId, id}: {groupId: string, propertyId: string, id: string}): AppState => {
    const group = state.animations.groups.findIndex(g => g.id === groupId);
    if (group < 0) {
        throw new Error('Cannot find group');
    }
    const prop = state.animations.groups[group].properties.findIndex(p => p.id === propertyId);
    if (prop < 0) {
        throw new Error('Cannot find prop');
    }
    const key = state.animations.groups[group].properties[prop].keyFrames.findIndex(k => k.id === id);
    if (key < 0) {
        throw new Error('Cannot find key');
    }

    const keyFrames = arrayRemove(state.animations.groups[group].properties[prop].keyFrames, key);
    return {
        ...state,
        selectedEntities: state.selectedEntities?.filter(v => v.type !== 'keyframe' || v.id !== id),
        animations: {
            ...state.animations,
            groups: arrayReplace(state.animations.groups, group, {
                ...state.animations.groups[group],
                properties: arrayReplace(state.animations.groups[group].properties, prop, {
                    ...state.animations.groups[group].properties[prop],
                    keyFrames
                })
            })
        }
    };
});

export const timelineZoomAction = action('timelineZoomAction', (state: AppState, { factor, center }: { factor: number, center: number }): AppState => {
    const msPerPx = Math.min(Math.max(1, state.timeline.msPerPx * factor), TIMELINE_DURATION_MS / 1000);
    const msOffset = center - (center - state.timeline.msOffset) / state.timeline.msPerPx * msPerPx;
    return {
        ...state,
        timeline: {
            msOffset: Math.max(0, msOffset),
            msPerPx
        }
    };
});

export const timelineSetOffsetAction = action('timelineSetOffsetAction', (state: AppState, { msOffset }: { msOffset: number }): AppState => ({
    ...state,
    timeline: {
        ...state.timeline,
        msOffset: Math.min(Math.max(0, msOffset), TIMELINE_DURATION_MS)
    }
}));
