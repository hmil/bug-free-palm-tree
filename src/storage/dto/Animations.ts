import * as rt from 'runtypes';

export const Animations = rt.Array(
    rt.Record({
        selectors: rt.Array(rt.String),
        properties: rt.Array(rt.Record({
            name: rt.String,
            keyframes: rt.Array(rt.Record({
                value: rt.Unknown,
                time: rt.Number
            }))
        }))
    })
);
export type Animations = rt.Static<typeof Animations>;
