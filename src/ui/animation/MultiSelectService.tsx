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
        let ret: KeyFrameId[] = [];
        for (const [id, ref] of this.elements.entries()) {
            if (ref.current == null) {
                console.warn('null element ref');
                continue;
            }
            const clientRect = ref.current.getBoundingClientRect();
            if (clientRect.x > x1 && clientRect.x < x2 && clientRect.y > y1 && clientRect.y < y2) {
                ret.push(id);
            }
        }
        return ret;
    }
}
