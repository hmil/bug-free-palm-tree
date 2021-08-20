import * as React from 'react';
import { COLOR_BG_2 } from 'ui/styles/colors';
import { AppServices } from 'ui/AppContext';
import { useStateSelector } from 'ui/state/AppReducer';

const EXPLORER_STYLE: React.CSSProperties = {
    backgroundColor: COLOR_BG_2,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
}

interface CanvasNode {
    name: string;
    children: CanvasNode[];
}

export function ExplorerPanel() {

    const [width] = React.useState(450);

    const { exportService } = React.useContext(AppServices);

    const foo = exportService.getRenderer();

    const playHead = useStateSelector(s => s.playHead);
    
    const nodes: CanvasNode[] = React.useMemo(() => {
        if (foo == null) {
            return [];
        }
        function findChildren(el: Element): CanvasNode[] {
            return Array.from(el.children).map(n => ({
                name: n.id || n.nodeName,
                children: findChildren(n)
            }));
        }

        return findChildren(foo);
    }, [foo, playHead]);

    function renderChildren(nodes: CanvasNode[]): string[] {
        return nodes.map(n => `${n.name}\n${renderChildren(n.children)}`)
    }

    return <div style={{
        ...EXPLORER_STYLE,
        width
    }}>{renderChildren(nodes)}</div>;
}