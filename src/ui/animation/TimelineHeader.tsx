import * as React from 'react';
import { COLOR_BG_4 } from 'ui/styles/colors';
import { Button } from 'ui/widgets/Button';

import { TIMELINE_HEADER_HEIGHT } from './style';
import { AppContext } from 'ui/AppContext';
import { addGroupAction, selectElementAction, loadSvgAction } from 'ui/state/AppActions';
import { uniqId } from 'std/uid';
import { isElementSelection } from 'ui/state/AppState';

export function TimelineHeader() {

    const { state, dispatch } = React.useContext(AppContext);

    const addGroup = React.useCallback(() => {
        const elementSelectors: string[] = [];

        state.selectedEntities?.forEach(e => {
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
    }, [dispatch, state.selectedEntities]);

    return <div style={{
        height: TIMELINE_HEADER_HEIGHT,
        backgroundColor: COLOR_BG_4,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
    }}>
        <div>{ state.selectedEntities?.filter(isElementSelection).map(e => e.path).join(', ') }</div>
        <Button onClick={addGroup} value="Add group"/>
    </div>;
}