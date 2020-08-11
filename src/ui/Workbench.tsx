import * as React from 'react';
import { Timeline } from 'ui/animation/Timeline';
import { COLOR_BG_0 } from './styles/colors';
import { Toolbar } from './Toobar';
import { Canvas } from './Canvas';
import { useKeyboardShortcuts } from './KeyboardShortcuts';

const CONTAINER_STYLE: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: COLOR_BG_0,
    height: '100%',
    userSelect: 'none'
};

export function Workbench() {

    useKeyboardShortcuts();

    return <div style={CONTAINER_STYLE}>
        <Toolbar title={'animastudio'}/>
        <div style={{
            flexGrow: 1,
            flexShrink: 1
        }}>
            <Canvas />
        </div>
        <Timeline />
    </div>;
}