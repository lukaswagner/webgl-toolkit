import {
    Renderer as BaseRenderer, BufferMode, CanvasFramebuffer, Framebuffer, TextureFormats,
} from '@lukaswagner/webgl-toolkit';
import { BlurPass } from './blurPass';
import { mat4 } from 'gl-matrix';
import { TrianglePass } from '../triangle/trianglePass';

export class Renderer extends BaseRenderer {
    public initialize(): void {
        const triangleFbo = new Framebuffer(this._gl, 'Triangle');

        // set up texture as double buffered
        const triangleTex = this._createTex(TextureFormats.RGBA, BufferMode.Double);

        triangleFbo.initialize([
            { slot: this._gl.COLOR_ATTACHMENT0, texture: triangleTex },
            { slot: this._gl.DEPTH_ATTACHMENT, texture: this._createTex(TextureFormats.Depth) },
        ]);
        this._framebuffers.push(triangleFbo);

        const trianglePass = new TrianglePass(this._gl, 'Triangle');
        trianglePass.initialize();
        trianglePass.target = triangleFbo;
        trianglePass.model = mat4.create();
        trianglePass.preDraw = () => triangleFbo.clear(false, false);
        this._passes.push(trianglePass);

        const horizontalPass = new BlurPass(this._gl, 'Blur');
        horizontalPass.initialize();
        horizontalPass.target = triangleFbo;
        horizontalPass.input = triangleTex;
        horizontalPass.direction = [0, 1];
        // use the output of triangle pass as read handle and set the other handle as write
        horizontalPass.preDraw = () => triangleFbo.swap();
        this._passes.push(horizontalPass);

        const canvasFbo = CanvasFramebuffer.getInstance(this._gl);
        this._framebuffers.push(canvasFbo);

        const verticalPass = new BlurPass(this._gl, 'Blur');
        verticalPass.initialize();
        verticalPass.target = canvasFbo;
        verticalPass.input = triangleTex;
        verticalPass.direction = [1, 0];
        // use the output of horizontal pass as read handle again
        verticalPass.preDraw = () => triangleFbo.swap();
        this._passes.push(verticalPass);

        super.initialize();
    }
}
