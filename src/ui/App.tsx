import { DomainSerializationService } from 'animation/domain/DomainSerializationService';
import { GsapAnimationService } from 'animation/gsap/GsapAnimationService';
import { ExportService } from 'export/ExportService';
import * as React from 'react';
import { DownloadService } from 'storage/DownloadService';
import { LoadSaveService } from 'storage/LoadSaveService';
import { ProjectSerializationService } from 'storage/ProjectSerializationService';

import { AnimationService } from './animation/AnimationService';
import { MultiSelectService } from './animation/MultiSelectService';
import { AppServices } from './AppContext';
import { useStateDispatch, useStateSelector } from './state/AppReducer';
import { COLOR_TEXT_MAIN } from './styles/colors';
import { Workbench } from './Workbench';

const GLOBAL_STYLES: React.CSSProperties = {
    color: COLOR_TEXT_MAIN,
    height: '100%',
    fontFamily: 'sans-serif',
}

export function App() {

    const dispatch = useStateDispatch();
    const state = useStateSelector(s => s);

    const stateRef = React.useRef(state);
    stateRef.current = state;

    const services = React.useMemo(() => {
        const serilizationService = new ProjectSerializationService();
        const downloadService = new DownloadService();
        const domainSerializationService = new DomainSerializationService();
        const loadSaveService = new LoadSaveService(serilizationService, domainSerializationService, downloadService, dispatch);
        const gsapAnimation = new GsapAnimationService();
        const exportService = new ExportService(gsapAnimation);
        const multiSelectService = new MultiSelectService();
        const animationService = new AnimationService(() => stateRef.current, dispatch);
        return {
            loadSaveService,
            exportService,
            animationService,
            multiSelectService
        }
    }, [dispatch]);

    return <AppServices.Provider value={services}>
            <div style={GLOBAL_STYLES}>
                <Workbench />
            </div>
        </AppServices.Provider>
}