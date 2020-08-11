import * as React from 'react';

import { movePlayHeadAction, removeKeyFrameAction, timelineZoomAction } from './state/AppActions';
import { DomainSerializationService } from 'animation/domain/DomainSerializationService';
import { useStateDispatch, useStateSelector } from './state/AppReducer';
import { AppServices } from './AppContext';

export function useKeyboardShortcuts() {

    const { loadSaveService, animationService } = React.useContext(AppServices);
    const domainSerializationService = React.useMemo(() => new DomainSerializationService(), []);

    const dispatch = useStateDispatch();
    const playHead = useStateSelector(s => s.playHead);
    const animations = useStateSelector(s => s.animations);
    const selectedEntities = useStateSelector(s => s.selectedEntities);
    const svgSource = useStateSelector(s => s.svgSource);

    React.useEffect(() => {
        const handler = (evt: KeyboardEvent) => {
            console.log(evt.key);
            switch (evt.key) {
                case 'ArrowLeft': {
                    let time = Math.round(playHead * animations.framesPerSecond / 1000 - 1) / animations.framesPerSecond * 1000;
                    if (time < 0) {
                        time = 0;
                    }
                    dispatch(movePlayHeadAction(time));
                    break;
                }
                case 'ArrowRight': {
                    let time = Math.round(playHead * animations.framesPerSecond / 1000 + 1) / animations.framesPerSecond * 1000;
                    if (time < 0) {
                        time = 0;
                    }
                    dispatch(movePlayHeadAction(time));
                    break;
                }
                case 'Backspace': {
                    selectedEntities?.forEach(e => {
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
                                animations: domainSerializationService.serialize(animations),
                                version: 1
                            },
                            svgSource: svgSource || ''
                        });
                    }
                    break;
                }
                case '+': {
                    dispatch(timelineZoomAction({ factor: 0.9, center: playHead}));
                    break;
                }
                case '-': {
                    dispatch(timelineZoomAction({ factor: 1.1, center: playHead}));
                    break;
                }
                case ' ': {
                    animationService.togglePlay();
                    break;
                }
            }
        };
        
        window.addEventListener('keydown', handler);
        return () => {
            window.removeEventListener('keydown', handler);
        }
    }, [selectedEntities, playHead, svgSource, animations]);
}
