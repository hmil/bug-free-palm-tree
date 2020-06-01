import * as rt from 'runtypes';
import { Animations } from './Animations';

export interface Project {
    metadata: ProjectMetadata;
    svgSource: string;
}

export const ProjectMetadata = rt.Record({
    version: rt.Literal(1),
    animations: Animations
});
export type ProjectMetadata = rt.Static<typeof ProjectMetadata>;
