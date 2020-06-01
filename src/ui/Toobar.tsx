import * as React from 'react';

import { COLOR_BG_2 } from './styles/colors';
import { Button } from './widgets/Button';
import { AppContext } from './AppContext';
import { DomainSerializationService } from 'animation/domain/DomainSerializationService';

export interface ToolbarProps {
    title: string;
}

export function Toolbar(props: ToolbarProps) {

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const { loadSaveService, exportService, state } = React.useContext(AppContext);

    const domainSerializationService = React.useMemo(() => new DomainSerializationService(), []);

    const onOpen = React.useCallback(() => {
        const input = fileInputRef.current;
        if (input == null) {
            throw new Error('Input not available');
        }
        input.onchange = () => {
            if (input.files == null || input.files.length < 0) {
                throw new Error('No files');
            }
            const item = input.files.item(0);
            if (item == null) {
                throw new Error('No file');
            }
            loadSaveService.load(item);
        };
        fileInputRef.current?.click();
    }, [fileInputRef]);

    const onSave = () => {
        loadSaveService.save({
            metadata: {
                animations: domainSerializationService.serialize(state.animations),
                version: 1
            },
            svgSource: state.svgSource || ''
        })
    };

    const onExport = () => {
        exportService.exportAnimation(state.animations, {
            durationSeconds: 3.5,
            frameRate: 30
        });
    };

    return <div
        style={{
            backgroundColor: COLOR_BG_2,
            padding: '5px',
            height: '30px',
            boxShadow: 'rgba(0, 0, 0, 0.29) 0px 6px 7px 0px',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            fontSize: '14px'
        }}>
            <input type="file" accept="image/svg+xml" style={{ display: 'none' }} ref={fileInputRef} value=""/>
            <div>
                <Button value="Open" onClick={onOpen} />
                <Button value="Save" onClick={onSave} disabled={state.svgSource == null} />
                <Button value="Export" onClick={onExport} disabled={state.svgSource == null} />
                {/* actions */}
            </div>
            <div style={{
                padding: '4px'
            }}>{props.title}</div>
            <div>
                {/* {spacer} */}
            </div>
    </div>;
}
