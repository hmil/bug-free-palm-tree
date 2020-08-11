import * as React from 'react';
import { useStateSelector } from 'ui/state/AppReducer';

export function TimelineBar() {
    const playHead = useStateSelector(s => s.playHead);
    const timeline = useStateSelector(s => s.timeline);

    return <div style={{
        backgroundColor: 'red',
        position: 'absolute',
        top: '0',
        width: '1px',
        height: '100%',
        left: `${playHead / timeline.msPerPx}px`,
        pointerEvents: 'none'
    }}></div>;
}