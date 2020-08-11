import * as React from 'react';

import { AnimationService } from './animation/AnimationService';
import { MultiSelectService } from './animation/MultiSelectService';
import { ExportService } from 'export/ExportService';
import { LoadSaveService } from 'storage/LoadSaveService';

export interface AppServices {
    animationService: AnimationService;
    multiSelectService: MultiSelectService;
    exportService: ExportService;
    loadSaveService: LoadSaveService;
}

export const AppServices = React.createContext<AppServices>({
    animationService: null as any as AnimationService,
    multiSelectService: null as any as MultiSelectService,
    exportService: null as any as ExportService,
    loadSaveService: null as any as LoadSaveService,
});