import { Renderer as BaseRenderer, CanvasFramebuffer } from '@lukaswagner/webgl-toolkit';
import { mat4, vec3 } from 'gl-matrix';
import { BoxPass } from './boxPass';

export class Renderer extends BaseRenderer {
    protected _boxPass: BoxPass;

    public initialize(): void {
        const canvasFbo = new CanvasFramebuffer(this._gl);
        this._framebuffers.push(canvasFbo);

        this._boxPass = new BoxPass(this._gl, 'Box');
        this._boxPass.initialize();
        this._boxPass.target = canvasFbo;
        this._boxPass.model = mat4.create();
        this._passes.push(this._boxPass);

        this._gl.enable(this._gl.DEPTH_TEST);

        super.initialize();
    }

    public set translation(v: vec3) {
        this._boxPass.model = mat4.fromTranslation(mat4.create(), v);
    }
}
