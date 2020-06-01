import * as React from 'react';
import { LoadSaveService } from 'storage/LoadSaveService';
import { AppState, appInitialState } from './state/AppState';
import { AppActions } from './state/AppReducer';
import { ExportService } from 'export/ExportService';
import { AnimationService } from './animation/AnimationService';
import { MultiSelectService } from './animation/MultiSelectService';

export interface AppContext {
    loadSaveService: LoadSaveService;
    exportService: ExportService;
    animationService: AnimationService;
    multiSelectService: MultiSelectService;
    state: AppState;
    dispatch: React.Dispatch<AppActions>;
};

export const AppContext = React.createContext<AppContext>({
    loadSaveService: null as any as LoadSaveService,
    exportService: null as any as ExportService,
    animationService: null as any as AnimationService,
    multiSelectService: null as any as MultiSelectService,
    state: appInitialState,
    dispatch: (_action: AppActions) => {
        console.error('Context is not set!');
    }
});
