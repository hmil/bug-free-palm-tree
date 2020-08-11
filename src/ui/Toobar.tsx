import * as React from 'react';

import { COLOR_BG_2 } from './styles/colors';
import { Button } from './widgets/Button';
import { DomainSerializationService } from 'animation/domain/DomainSerializationService';
import { useStateSelector } from './state/AppReducer';
import { AppServices } from './AppContext';

export interface ToolbarProps {
    title: string;
}

export function Toolbar(props: ToolbarProps) {

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const focksSinkRef = React.useRef<HTMLButtonElement>(null);

    const { loadSaveService, exportService } = React.useContext(AppServices);

    const svgSource = useStateSelector(s => s.svgSource);
    const animations = useStateSelector(s => s.animations);

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
        focksSinkRef.current?.focus();
    }, [fileInputRef]);

    const onSave = () => {
        loadSaveService.save({
            metadata: {
                animations: domainSerializationService.serialize(animations),
                version: 1
            },
            svgSource: svgSource || ''
        });
        focksSinkRef.current?.focus();
    };

    const onExport = () => {
        exportService.exportAnimation(animations, {
            durationSeconds: 1.5,
            frameRate: 30
        });
        focksSinkRef.current?.focus();
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
            <button style={{ display: 'none' }} ref={focksSinkRef} />
            <input type="file" accept="image/svg+xml" style={{ display: 'none' }} ref={fileInputRef} value=""/>
            <div>
                <Button value="Open" onClick={onOpen} />
                <Button value="Save" onClick={onSave} disabled={svgSource == null} />
                <Button value="Export" onClick={onExport} disabled={svgSource == null} />
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
