import { AnimationModel } from './AnimationModel';
import { Animations } from 'storage/dto/Animations';
import { uniqId } from 'std/uid';


export class DomainSerializationService {

    serialize(domain: AnimationModel): Animations {
        return domain.groups.map(g => ({
            selectors: g.elementSelectors,
            properties: g.properties.map(p => ({
                name: p.name,
                keyframes: p.keyFrames
            })),
        }));
    }

    deserialize(dto: Animations): AnimationModel {
        return {
            framesPerSecond: 30,
            groups: dto.map(a => ({
                id: uniqId(),
                elementSelectors: a.selectors,
                properties: a.properties.map(p => ({
                    id: uniqId(),
                    name: p.name,
                    keyFrames: p.keyframes.map(k => ({
                        id: uniqId(),
                        value: k.value,
                        time: k.time
                    }))
                }))
            }))
        };
    }
}