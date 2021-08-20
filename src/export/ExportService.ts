import { AnimationModel } from 'animation/domain/AnimationModel';
import { GsapAnimationService } from 'animation/gsap/GsapAnimationService';

import { TarFile } from './TarFile';


interface ExportSettings {
    durationSeconds: number;
    frameRate: number;
}

export class ExportService {

    private ctx: CanvasRenderingContext2D;

    private renderer: HTMLDivElement | null = null;

    private width = 1920;
    private height = 1080;

    constructor(private readonly gsapAnimation: GsapAnimationService) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx == null) {
            throw new Error('Canvas is not supported!');
        }
        this.ctx = ctx;
    }

    setRenderer(renderer: HTMLDivElement | null) {
        this.renderer = renderer;
    }

    getRenderer(): HTMLDivElement | null {
        return this.renderer;
    }

    async exportAnimation(animation: AnimationModel, settings: ExportSettings) {

        if (this.renderer == null) {
            throw new Error('Renderer is not set');
        }

        this.ctx.canvas.width = this.width;
        this.ctx.canvas.height = this.height;

        const tl = this.gsapAnimation.convertToGsap(animation);

        const total = Math.ceil(settings.durationSeconds * settings.frameRate);

        const archive = new TarFile();

        for (let i = 0 ; i < total ; i ++) {
            tl.pause(i / settings.frameRate);

            const text = this.renderer.innerHTML;
            const blob = new Blob([text], { type: 'image/svg+xml' });
            const data = window.URL.createObjectURL(blob);
            const img = await this.renderImage(data);
            window.URL.revokeObjectURL(data);

            const fileName = `img-${i.toString(10).padStart(6, '0')}.png`;
            archive.add(img, `export/${fileName}`);
        }

        this.download(await archive.toDataURL(), 'archive.tar');
    }

    private renderImage(data: string): Promise<Uint8Array> {
        const img = new Image();
        return new Promise(resolve => {
            img.onload = () => {
                this.ctx.drawImage(img, 0, 0, this.width, this.height);
                this.ctx.canvas.toBlob(async (blob) => {
                    if (blob == null) {
                        throw new Error('Failed to render blob');
                    }
                    resolve(new Uint8Array(await blob.arrayBuffer()));
                });
            }
            img.src = data;
        });
    }

    private download(data: string, name: string) {
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        a.href = data;
        a.download = name;
        a.click();
    }
}