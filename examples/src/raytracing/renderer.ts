import {
    Renderer as BaseRenderer, CanvasFramebuffer, Framebuffer, TextureFormats,
} from '@lukaswagner/webgl-toolkit';
import { RaytracingPass } from './raytracingPass';

export class Renderer extends BaseRenderer {
    public initialize(): void {
        const canvasFbo = new CanvasFramebuffer(this._gl);
        this._framebuffers.push(canvasFbo);

        const raytracingPass = new RaytracingPass(this._gl, 'Raytracing');
        raytracingPass.initialize();
        raytracingPass.target = canvasFbo;
        this._passes.push(raytracingPass);

        super.initialize();
    }
}
