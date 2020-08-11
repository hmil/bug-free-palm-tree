import * as React from 'react';
import { uniqId } from 'std/uid';
import { AppServices } from 'ui/AppContext';
import { addGroupAction, loadSvgAction, selectElementAction } from 'ui/state/AppActions';
import { useStateDispatch, useStateSelector } from 'ui/state/AppReducer';
import { isElementSelection } from 'ui/state/AppState';
import { COLOR_BG_3, COLOR_BG_DELIMITER } from 'ui/styles/colors';
import { Button } from 'ui/widgets/Button';

import { TIMELINE_HEADER_HEIGHT } from './style';

export function TimelineHeader() {

    const { animationService } = React.useContext(AppServices);
    
    const selectedEntities = useStateSelector(s => s.selectedEntities);
    const playHead = useStateSelector(s => s.playHead);
    const dispatch = useStateDispatch();

    const addGroup = React.useCallback(() => {
        const elementSelectors: string[] = [];

        selectedEntities?.forEach(e => {
            if (e.type === 'element') {
                const el = document.querySelector(e.path);
                const canvas = document.getElementById('hmil-anim-canvas');
                if (el != null && !el.id && canvas) {
                    const id = `elem-${uniqId()}`;
                    el.id = id;
                    const path = `#${id}`;
                    dispatch(selectElementAction({ path }));
                    if (canvas) {
                        const blob = new Blob([canvas?.innerHTML], { type: 'image/svg+xml' });
                        const svgSource = URL.createObjectURL(blob);
                        dispatch(loadSvgAction({ svgSource }));
                        elementSelectors.push(path);
                    }
                } else {
                    elementSelectors.push(e.path);
                }
            }
        });
        
        dispatch(addGroupAction({
            elementSelectors
        }));
    }, [dispatch, selectedEntities]);

    const masterTime = animationService.formatTime(playHead);

    return <div style={{
        height: TIMELINE_HEADER_HEIGHT,
        backgroundColor: COLOR_BG_3,
        border: `1px ${COLOR_BG_DELIMITER} solid`,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
    }}>
        <div>{ selectedEntities?.filter(isElementSelection).map(e => e.path).join(', ') }</div>
        <Button onClick={addGroup} value="Add group"/>
        <div style={{
            fontWeight: 'bold',
            fontSize: '20px'
        }}>{masterTime}</div>
    </div>;
}