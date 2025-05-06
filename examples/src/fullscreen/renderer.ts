import {
    Renderer as BaseRenderer, CanvasFramebuffer, Framebuffer, TextureFormats,
} from '@lukaswagner/webgl-toolkit';
import { InvertPass } from './invertPass';
import { mat4 } from 'gl-matrix';
import { TrianglePass } from '../triangle/trianglePass';

export class Renderer extends BaseRenderer {
    public initialize(): void {
        const triangleFbo = new Framebuffer(this._gl, 'Triangle');
        const triangleTex = this._createTex(TextureFormats.RGBA);
        triangleFbo.initialize([
            { slot: this._gl.COLOR_ATTACHMENT0, texture: triangleTex },
            { slot: this._gl.DEPTH_ATTACHMENT, texture: this._createTex(TextureFormats.Depth) },
        ]);
        this._framebuffers.push(triangleFbo);

        const trianglePass = new TrianglePass(this._gl, 'Triangle');
        trianglePass.initialize();
        trianglePass.target = triangleFbo;
        trianglePass.model = mat4.create();
        trianglePass.preDraw = () => triangleFbo.clear();
        this._passes.push(trianglePass);

        const canvasFbo = CanvasFramebuffer.getInstance(this._gl);
        this._framebuffers.push(canvasFbo);

        const invertPass = new InvertPass(this._gl, 'Invert');
        invertPass.initialize();
        invertPass.target = canvasFbo;
        invertPass.input = triangleTex;
        this._passes.push(invertPass);

        super.initialize();
    }
}
