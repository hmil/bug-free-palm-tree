import { GsapAnimationService } from 'animation/gsap/GsapAnimationService';
import * as React from 'react';

import { AppContext } from './AppContext';
import { selectElementAction, unselectAllElementsAction } from './state/AppActions';
import { isElementSelection } from './state/AppState';
import { COLOR_HIGHLIGHT, COLOR_TEXT_MAIN } from './styles/colors';
import { defined } from 'std/null-utils';

const CANVAS_STYLE: React.CSSProperties = {
    height: '100%',
    position: 'relative'
};

const IMG_STYLE: React.CSSProperties = {
    height: '100%'
};

export function Canvas() {

    const { state, exportService, dispatch } = React.useContext(AppContext);
    const [canvas, setCanvas] = React.useState<HTMLDivElement | null>(null);

    const canvasRef = React.useCallback((el: HTMLDivElement) => {
        setCanvas(el);
        exportService.setRenderer(el);
    }, []);

    const gsapService = React.useMemo(() => new GsapAnimationService(), []);

    const [version, setVersion] = React.useState(0);

    React.useEffect(() => {
        let aborted = false;

        async function perform() {
            if (state.svgSource == null) {
                return;
            }
            const res = await fetch(state.svgSource);
            const txt = await res.text();

            if (canvas != null && !aborted) {
                canvas.innerHTML = txt;
                setVersion(version + 1);
            }
        }

        perform();

        return () => {
            aborted = true;
        };
    }, [state.svgSource, canvas]);

    const [tl, setTl] = React.useState<gsap.core.Timeline | null>(null);
    React.useEffect(() => {
        const tl = gsapService.convertToGsap(state.animations);
        setTl(tl);
        return () => {
            tl.pause(0);
            tl.kill();
        }
    }, [version, state.animations]);

    React.useEffect(() => {
        if (!tl) {
            return;
        }
        tl.pause(state.playHead / 1000);
    }, [state.playHead, tl]);

    const [canvasRect, setCanvasRect] = React.useState<DOMRect>();
    const measuredRef = React.useCallback((node: HTMLDivElement | null) => {
        if (node !== null) {
            setCanvasRect(node.getBoundingClientRect());
        }
    }, []);

    const [hoverBox, setHoverBox] = React.useState<React.CSSProperties | null>(null);

    const selectedNodes = React.useMemo(() => state.selectedEntities?.filter(isElementSelection)
                .map(e => document.querySelector(e.path))
                .filter(defined) ?? [],
    [state.selectedEntities]);


    const onMouseOver = React.useCallback((evt: React.MouseEvent) => {
        if (evt.target instanceof SVGElement && canvasRect != null && !(evt.target instanceof SVGSVGElement)) {
            let current: SVGElement | HTMLElement | null | undefined = evt.target;
            while (current?.parentElement != null && !(current?.parentElement instanceof SVGSVGElement) && selectedNodes.indexOf(current.parentElement) < 0) {
                current = current?.parentElement;
            }
            if (current == null) {
                throw new Error('Could not walk the tree');
            }
            console.log(getPathTo(current));
            const rect = current.getBoundingClientRect();
            setHoverBox({
                left: `${rect.x - canvasRect.x}px`,
                top: `${rect.y - canvasRect.y}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
            });
        } else {
            setHoverBox(null);
        }
    }, [canvasRect, selectedNodes]);

    const selectBox = React.useMemo(() => computeSelectBox(selectedNodes), [selectedNodes, canvasRect]);
    function computeSelectBox(nodes: Array<Element>) {
        if (nodes.length === 0 || canvasRect == null) {
            return undefined;
        }

        const rect = selectedNodes.map(n => n.getBoundingClientRect()).reduce((acc, curr) => ({
            left: Math.min(acc.left, curr.left),
            top: Math.min(acc.top, curr.top),
            bottom: Math.max(acc.bottom, curr.bottom),
            right: Math.max(acc.right, curr.right)
        }), {
            left: Number.MAX_VALUE,
            top: Number.MAX_VALUE,
            bottom: Number.MIN_VALUE,
            right: Number.MIN_VALUE
        });
        return {
            left: `${rect.left - canvasRect.x}px`,
            top: `${rect.top - canvasRect.y}px`,
            width: `${rect.right - rect.left}px`,
            height: `${rect.bottom - rect.top}px`,
        };
    }

    const onClick = React.useCallback((evt: React.MouseEvent) => {
        dispatch(unselectAllElementsAction());
        if (evt.target instanceof SVGElement && canvasRect != null && !(evt.target instanceof SVGSVGElement)) {
            let current: SVGElement | HTMLElement | null | undefined = evt.target;
            while (current?.parentElement != null && !(current?.parentElement instanceof SVGSVGElement) && selectedNodes.indexOf(current.parentElement) < 0) {
                current = current?.parentElement;
            }
            if (current == null) {
                throw new Error('Could not walk the tree');
            }
            dispatch(selectElementAction({path: getPathTo(current) }));
        }
    }, [canvasRect, selectedNodes]);

    return <div style={CANVAS_STYLE} ref={measuredRef}>
        { hoverBox != null ? <div style={{
            position: 'absolute',
            border: `1px ${COLOR_TEXT_MAIN} solid`,
            pointerEvents: 'none',
            ...hoverBox
        }}></div> : <></>}
        { selectBox != null ? <div style={{
            position: 'absolute',
            border: `2px ${COLOR_HIGHLIGHT} solid`,
            pointerEvents: 'none',
            ...selectBox
        }}></div> : <></>}
        <div ref={canvasRef} style={IMG_STYLE} className="canvas" onMouseOver={onMouseOver} onClick={onClick} id="hmil-anim-canvas"></div>
    </div>;
}


function getPathTo(element: any): string {
    if (element.id!=='')
        return '#'+element.id+'';
    if (element === document.body)
        return element.tagName;

    var ix= 0;
    var siblings= element.parentNode.childNodes;
    for (var i= 0; i < siblings.length; i++) {
        var sibling= siblings[i];
        if (sibling===element)
            return getPathTo(element.parentNode)+'>'+element.tagName+':nth-of-type('+(ix+1)+')';
        if (sibling.nodeType===1 && sibling.tagName===element.tagName)
            ix++;
    }
    return '';
}
