import { Renderer as BaseRenderer, CanvasFramebuffer } from '@lukaswagner/webgl-toolkit';
import { mat4 } from 'gl-matrix';
import { TrianglePass } from './trianglePass';

export class Renderer extends BaseRenderer {
    public initialize(): void {
        const canvasFbo = new CanvasFramebuffer(this._gl);
        this._framebuffers.push(canvasFbo);

        const trianglePass = new TrianglePass(this._gl, 'Triangle');
        trianglePass.initialize();
        trianglePass.target = canvasFbo;
        trianglePass.model = mat4.create();
        this._passes.push(trianglePass);

        super.initialize();
    }
}
