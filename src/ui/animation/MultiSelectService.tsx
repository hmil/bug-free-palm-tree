import * as React from 'react';

export interface KeyFrameId {
    groupId: string;
    propId: string;
    id: string;
}

export class MultiSelectService {
    
    private elements: Map<KeyFrameId, React.RefObject<HTMLElement>> = new Map();

    public useKeyFrameElementRef(keyFrameId: KeyFrameId, elementRef: React.RefObject<HTMLElement>) {
        React.useEffect(() => {
            this.elements.set(keyFrameId, elementRef);
            return () => {
                this.elements.delete(keyFrameId);
            };
        }, []);
    }

    public getKeyFramesInArea(x1: number, y1: number, x2: number, y2: number): KeyFrameId[] {
        const [startX, endX] = x1 > x2 ? [x2, x1] : [x1, x2];
        const [startY, endY] = y1 > y2 ? [y2, y1] : [y1, y2];

        let ret: KeyFrameId[] = [];
        for (const [id, ref] of this.elements.entries()) {
            if (ref.current == null) {
                console.warn('null element ref');
                continue;
            }
            const clientRect = ref.current.getBoundingClientRect();
            if (clientRect.x + clientRect.width > startX && clientRect.x < endX && clientRect.y + clientRect.height > startY && clientRect.y < endY) {
                ret.push(id);
            }
        }
        return ret;
    }
}
