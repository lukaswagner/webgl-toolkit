import {
    Renderer as BaseRenderer,
    BufferMode,
    CanvasFramebuffer,
    drawBuffers,
    Framebuffer,
    TextureFormats,
} from '@lukaswagner/webgl-toolkit';
import { FloodPass } from './floodPass';
import { PointPass } from './pointPass';
import { vec2 } from 'gl-matrix';

const tracked = {
    Size: true,
    PickPos: false,
};

export class Renderer extends BaseRenderer<typeof tracked> {
    protected _pointFbo: Framebuffer;
    protected _pickPos = vec2.fromValues(-1, -1);
    protected _range = 128;

    public constructor(gl: WebGL2RenderingContext) {
        super(gl, tracked);
    }

    public initialize(): void {
        this._pointFbo = new Framebuffer(this._gl, 'Points');
        const pointFloodTex = this._createTex(TextureFormats.RGBA, BufferMode.Double);

        this._pointFbo.initialize([
            { slot: this._gl.COLOR_ATTACHMENT0, texture: this._createTex(TextureFormats.RGBA) },
            { slot: this._gl.COLOR_ATTACHMENT1, texture: pointFloodTex },
            { slot: this._gl.DEPTH_ATTACHMENT, texture: this._createTex(TextureFormats.Depth) },
        ]);
        this._framebuffers.push(this._pointFbo);

        const pointPass = new PointPass(this._gl, 'Points');
        pointPass.initialize();
        pointPass.target = this._pointFbo;
        pointPass.selected = 0;
        pointPass.preDraw = () => {
            this._pointFbo.bind();
            drawBuffers(this._gl, 0b11);
            this._pointFbo.clear();
        };
        pointPass.postDraw = () => {
            floodPass.step = this._range;
            this._pointFbo.swap();
        };
        this._passes.push(pointPass);

        const floodPass = new FloodPass(this._gl, 'Flood');
        floodPass.initialize();
        floodPass.input = pointFloodTex;
        floodPass.target = this._pointFbo;
        floodPass.preDraw = () => {
            this._pointFbo.bind();
            drawBuffers(this._gl, 0b10);
        };
        floodPass.postDraw = () => {
            floodPass.step /= 2;
            this._pointFbo.swap();
        };

        for (let i = 0; i < Math.log2(this._range) + 1; i++)
            this._passes.push(floodPass);

        const canvasFbo = new CanvasFramebuffer(this._gl);
        this._framebuffers.push(canvasFbo);

        const blit = this._setupBlitPass(
            this._pointFbo, this._gl.COLOR_ATTACHMENT0, canvasFbo, this._gl.BACK);
        blit.postDraw = () => {
            const id = this._pick();
            pointPass.selected = id;
        };

        super.initialize();
    }

    // todo: move this to specialized pass?
    protected _pick() {
        if (this._pickPos[0] < 0 || this._pickPos[1] < 0 ||
            this._pickPos[0] > this._size[0] || this._pickPos[1] > this._size[1])
            return -1;
        const data = new Uint8Array(4);
        this._pointFbo.bind(this._gl.READ_FRAMEBUFFER);
        this._gl.readBuffer(this._gl.COLOR_ATTACHMENT1);
        this._gl.readPixels(
            this._pickPos[0], this._pickPos[1], 1, 1,
            TextureFormats.RGBA.format, TextureFormats.RGBA.type,
            data);
        this._pointFbo.unbind(this._gl.READ_FRAMEBUFFER);
        const id = data[2] - 1;
        return id;
    }

    public set pickPos(v: vec2) {
        vec2.set(this._pickPos,
            v[0] * window.devicePixelRatio,
            this._size[1] - v[1] * window.devicePixelRatio);
        this._dirty.set('PickPos');
    }
}
