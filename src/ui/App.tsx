import * as React from 'react';
import { Workbench } from './Workbench';
import { COLOR_TEXT_MAIN } from './styles/colors';
import { ProjectSerializationService } from 'storage/ProjectSerializationService';
import { LoadSaveService } from 'storage/LoadSaveService';
import { DownloadService } from 'storage/DownloadService';
import { AppContext } from './AppContext';
import { appReducer } from './state/AppReducer';
import { appInitialState } from './state/AppState';
import { DomainSerializationService } from 'animation/domain/DomainSerializationService';
import { ExportService } from 'export/ExportService';
import { GsapAnimationService } from 'animation/gsap/GsapAnimationService';
import { AnimationService } from './animation/AnimationService';
import { MultiSelectService } from './animation/MultiSelectService';

const GLOBAL_STYLES: React.CSSProperties = {
    color: COLOR_TEXT_MAIN,
    height: '100%',
    fontFamily: 'sans-serif',
}

export function App() {

    const [ state, dispatch ] = React.useReducer(appReducer, appInitialState);

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

        console.log('Regenerating services');
        return {
            loadSaveService,
            exportService,
            animationService,
            multiSelectService
        }
    }, [dispatch, stateRef]);

    const context = React.useMemo<AppContext>(() => ({
        loadSaveService: services.loadSaveService,
        exportService: services.exportService,
        animationService: services.animationService,
        multiSelectService: services.multiSelectService,
        state,
        dispatch
    }), [services, state, dispatch]);

    return <AppContext.Provider value={context}>
            <div style={GLOBAL_STYLES}>
                <Workbench />
            </div>
        </AppContext.Provider>
}