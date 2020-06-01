import { AnimationModel, AnimationKeyFrame } from 'animation/domain/AnimationModel';
import { gsap } from "gsap";

export class GsapAnimationService {

    convertToGsap(animation: AnimationModel): gsap.core.Timeline {
        const master = gsap.timeline();
        animation.groups.forEach(g => {
            const tl = gsap.timeline();
            g.properties.forEach(p => {
                if (g.elementSelectors.length == 0) {
                    return;
                }
                let prev: AnimationKeyFrame | null = null;
                for (const k of p.keyFrames) {
                    const insert = prev == null ? 0 : prev.time;
                    const duration = prev == null ? 0 : (k.time - prev.time);
                    try {
                        tl.to(g.elementSelectors.join(", "), {[p.name]: k.value, duration: duration / 1000}, insert / 1000);
                    } catch (e) {
                        console.error(e);
                    }
                    prev = k;
                }
            });
            master.add(tl, 0);
        });
        return master;
    }
}