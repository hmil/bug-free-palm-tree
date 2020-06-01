import { ProjectSerializationService } from './ProjectSerializationService';
import { Project } from './dto/Project';
import { DownloadService } from './DownloadService';
import { Dispatch } from 'react';
import { loadSvgAction, loadAnimationData } from 'ui/state/AppActions';
import { AppActions } from 'ui/state/AppReducer';
import { DomainSerializationService } from 'animation/domain/DomainSerializationService';

export class LoadSaveService {

    constructor(
            private readonly serializationService: ProjectSerializationService,
            private readonly domainSerializationService: DomainSerializationService,
            private readonly downloadService: DownloadService,
            private readonly dispatch: Dispatch<AppActions>) {

    }

    load(data: Blob): void {
        const reader = new FileReader();
        reader.onload = (e) => {
            const res = e.target?.result;
            if (typeof res !== 'string') {
                throw new Error('Invalid response type');
            }
            const des = this.serializationService.deserialize(res);
            
            this.dispatch(loadSvgAction({svgSource: des.svgSource }));
            this.dispatch(loadAnimationData({animations: this.domainSerializationService.deserialize(des.metadata.animations) }))
        };
        reader.readAsText(data);
    }

    async save(project: Project) {
        const ser = await this.serializationService.serialize(project);
        const blob = new Blob([ser], { type: 'image/svg+xml' });
        this.downloadService.download(blob, 'document.svg');
    }
}