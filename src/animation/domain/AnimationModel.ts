export interface AnimationModel {
    framesPerSecond: number;
    groups: AnimationGroup[];
}

export interface AnimationGroup {
    id: string;
    elementSelectors: string[];
    properties: AnimationProperty[];
}

export interface AnimationProperty {
    id: string;
    name: string;
    keyFrames: AnimationKeyFrame[];
}

export interface AnimationKeyFrame {
    id: string;
    value: unknown;
    time: number;
}
