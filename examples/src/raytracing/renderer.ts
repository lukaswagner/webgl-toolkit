import {
    Renderer as BaseRenderer, CanvasFramebuffer,
} from '@lukaswagner/webgl-toolkit';
import { RaytracingPass } from './rtPass';

export class Renderer extends BaseRenderer {
    public initialize(): void {
        const canvasFbo = new CanvasFramebuffer(this._gl);
        this._framebuffers.push(canvasFbo);

        const rtPass = new RaytracingPass(this._gl, 'Raytracing');
        rtPass.initialize();
        rtPass.target = canvasFbo;
        this._passes.push(rtPass);

        super.initialize();
    }
}
