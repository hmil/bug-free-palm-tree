import { TIMELINE_HEADER_WIDTH_PX } from './style';
import { AppState, isKeyFrameSelection } from 'ui/state/AppState';
import { AppActions } from 'ui/state/AppReducer';
import { updateKeyFrameAction } from 'ui/state/AppActions';
import { defined } from 'std/null-utils';
import { AnimationKeyFrame } from 'animation/domain/AnimationModel';

export class AnimationService {

    constructor(private readonly getState: () => AppState,
            private readonly dispatch: React.Dispatch<AppActions>) {}

    /**
     * Returns the time corresponding to a given pixel offset on the timeline, rounded to the nearest frame.
     */
    getSnappedTimeAtPixelOffset(pos: number): number {
        const state = this.getState();
        let offset = pos - TIMELINE_HEADER_WIDTH_PX;
        if (offset < 0) {
            offset = 0;
        }
        const time = offset * state.timeline.msPerPx + state.timeline.msOffset;
        return this.snapTimeToFrame(time);
    }

    snapTimeToFrame(time: number): number {
        const state = this.getState();
        const frame = Math.round(time * state.animations.framesPerSecond / 1000);
        return frame / state.animations.framesPerSecond * 1000;
    }

    moveSelectedKeyFrames(offset: number): void {
        const state = this.getState();
        state.selectedEntities.filter(isKeyFrameSelection).forEach(e => {
            const kf = state.animations.groups.find(g => g.id === e.groupId)?.properties.find(p => p.id === e.propId)?.keyFrames.find(k => k.id === e.id);
            if (kf) {
                this.dispatch(updateKeyFrameAction({
                    groupId: e.groupId,
                    propertyId: e.propId,
                    keyFrame: {
                        ...kf,
                        time: this.snapTimeToFrame(kf.time + offset)
                    }
                }));
            }
        });
    }

    /**
     * Starts moving keyframes around.
     */
    beginKeyFrameMove(): KeyFrameMovement {
        const getKeyFrames = (() => {
            let mem: { kf: AnimationKeyFrame, groupId: string, propId: string }[] | null = null;
            return () => {
                if (!mem) {
                    mem = this.getState().selectedEntities.filter(isKeyFrameSelection)
                    .map(e => {
                        const kf = this.getState().animations.groups.find(g => g.id === e.groupId)?.properties.find(p => p.id === e.propId)?.keyFrames.find(k => k.id === e.id)
                        if (kf != null) {
                            return {
                                kf,
                                groupId: e.groupId,
                                propId: e.propId
                            };
                        }
                    })
                    .filter(defined)
                }
                return mem;
            };
        })();
        return new KeyFrameMovement(this, getKeyFrames, this.dispatch);
    }
}

class KeyFrameMovement {

    constructor(
            private readonly animationService: AnimationService,
            private readonly getKeyFrames: () => Array<{ kf: AnimationKeyFrame, groupId: string, propId: string}>,
            private readonly dispatch: React.Dispatch<AppActions>) {}

    setOffset(offset: number) {
        this.getKeyFrames().forEach(kf => {
            this.dispatch(updateKeyFrameAction({
                groupId: kf.groupId,
                propertyId: kf.propId,
                keyFrame: {
                    ...kf.kf,
                    time: this.animationService.snapTimeToFrame(kf.kf.time + offset)
                }
            }));
        });
    }
}
