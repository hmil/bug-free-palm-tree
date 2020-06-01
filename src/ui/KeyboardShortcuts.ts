import * as React from 'react';

import { AppContext } from './AppContext';
import { movePlayHeadAction, removeKeyFrameAction, timelineZoomAction } from './state/AppActions';
import { DomainSerializationService } from 'animation/domain/DomainSerializationService';

export function useKeyboardShortcuts() {

    const { state, dispatch, loadSaveService } = React.useContext(AppContext);
    const domainSerializationService = React.useMemo(() => new DomainSerializationService(), []);


    React.useEffect(() => {
        const handler = (evt: KeyboardEvent) => {
            console.log(evt.key);
            switch (evt.key) {
                case 'ArrowLeft': {
                    let time = Math.round(state.playHead * state.animations.framesPerSecond / 1000 - 1) / state.animations.framesPerSecond * 1000;
                    if (time < 0) {
                        time = 0;
                    }
                    dispatch(movePlayHeadAction(time));
                    break;
                }
                case 'ArrowRight': {
                    let time = Math.round(state.playHead * state.animations.framesPerSecond / 1000 + 1) / state.animations.framesPerSecond * 1000;
                    if (time < 0) {
                        time = 0;
                    }
                    dispatch(movePlayHeadAction(time));
                    break;
                }
                case 'Backspace': {
                    state.selectedEntities?.forEach(e => {
                        if (e.type === 'keyframe') {
                            dispatch(removeKeyFrameAction({
                                groupId: e.groupId,
                                id: e.id,
                                propertyId: e.propId
                            }))
                        }
                    });
                    break;
                }
                case 'Home': {
                    dispatch(movePlayHeadAction(0));
                    break;
                }
                case 'End': {
                    dispatch(movePlayHeadAction(1000));
                    break;
                }
                case 's': {
                    if (evt.metaKey) {
                        evt.preventDefault();
                        loadSaveService.save({
                            metadata: {
                                animations: domainSerializationService.serialize(state.animations),
                                version: 1
                            },
                            svgSource: state.svgSource || ''
                        });
                    }
                    break;
                }
                case '+': {
                    dispatch(timelineZoomAction({ factor: 0.9, center: state.playHead}));
                    break;
                }
                case '-': {
                    dispatch(timelineZoomAction({ factor: 1.1, center: state.playHead}));
                    break;
                }
            }
        };
        
        window.addEventListener('keydown', handler);
        return () => {
            window.removeEventListener('keydown', handler);
        }
    }, [state.playHead, state.selectedEntities, state.playHead, state.svgSource]);
}
