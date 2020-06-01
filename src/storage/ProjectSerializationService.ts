import { Project, ProjectMetadata } from './dto/Project';
import * as DOMPurify from 'dompurify';

/**
 * Security note: This uses the DOM api for xml (de)serialization, which is über-insecure.
 */
export class ProjectSerializationService {

    deserialize(unsafeUserInput: string): Project {
        const data = DOMPurify.sanitize(unsafeUserInput, {
            ADD_TAGS: [ 'hmil-anim:metadata' ],
            ADD_ATTR: [ 'xmlns:hmil-anim' ],
            USE_PROFILES: {
                svg: true
            }
        });
        const elem = document.createElement('div');
        elem.innerHTML = data;
        const root = elem.querySelector('svg');
        if (root == null) {
            throw new Error('Unable to load file');
        }

        const blob = new Blob([data], { type: 'image/svg+xml' });
        const svgSource = URL.createObjectURL(blob);

        const metaEl = root.getElementsByTagName('hmil-anim:metadata');
        if (metaEl.length > 0) {
            const meta = metaEl.item(0);
            if (meta != null) {
                const text = meta.innerHTML;
                const result = JSON.parse(atob(text.substr(text.indexOf(',') + 1)));
                const parsed = ProjectMetadata.validate(result);
                if (parsed.success) {
                    return {
                        metadata: parsed.value,
                        svgSource
                    };
                }
            }
        }


        return {
            metadata: {
                version: 1,
                animations: []
            },
            svgSource
        };
    }

    async serialize(project: Project): Promise<string> {
        const NAMESPACE = 'https://hmil.fr/animastudio';

        const svgData = await fetch(project.svgSource);
        const elem = document.createElement('div');
        elem.innerHTML = await svgData.text();
        const svg = elem.querySelector('svg');
        if (svg == null) {
            throw new Error('Unable to save file');
        }

        if (!svg.hasAttribute('xmlns:hmil-anim') || svg.getAttribute('xmlns:hmil-anim') !== NAMESPACE) {
            svg.setAttribute('xmlns:hmil-anim', NAMESPACE);
        }

        const metadataEls = svg.getElementsByTagName('hmil-anim:metadata');
        const metadata = metadataEls.length > 0 ? metadataEls.item(0)! : this.createMetadataElement(svg);

        const data = `data:application/json;base64,${btoa(JSON.stringify(project.metadata))}`;
        metadata.innerHTML = data;

        return svg.outerHTML;
    }

    private createMetadataElement(svg: SVGSVGElement) {
        const metadata = document.createElement('metadata');
        const hmilMeta = document.createElement('hmil-anim:metadata');
        metadata.append(hmilMeta);
        svg.append(metadata);
        return hmilMeta;
    }
}
