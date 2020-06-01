import { AnimationModel } from 'animation/domain/AnimationModel';

export interface KeyFrameSelectedEntity {
    type: 'keyframe';
    id: string;
    propId: string;
    groupId: string;
}

export interface ElementSelectedEntity {
    type: 'element';
    path: string;
}

export function isElementSelection(e: AppSelectedEntity): e is ElementSelectedEntity {
    return e.type === 'element';
}

export function isKeyFrameSelection(e: AppSelectedEntity): e is KeyFrameSelectedEntity {
    return e.type === 'keyframe';
}

export type AppSelectedEntity = KeyFrameSelectedEntity | ElementSelectedEntity;

export interface AppState {
    svgSource: string | null;
    animations: Readonly<AnimationModel>;
    playHead: number;
    selectedEntities: AppSelectedEntity[];
    timeline: {
        msPerPx: number;
        msOffset: number;
    }
}

export const appInitialState: AppState = {
    svgSource: null,
    animations: {
        framesPerSecond: 30,
        groups: []
    },
    playHead: 0,
    timeline: {
        msPerPx: 5,
        msOffset: 0
    },
    selectedEntities: []
};
