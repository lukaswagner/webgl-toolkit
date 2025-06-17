import { Framebuffer } from './framebuffer';
import { GL } from '../types';
import { vec2 } from 'gl-matrix';

/**
 * Proxy framebuffer targeting the canvas.
 */
export class CanvasFramebuffer extends Framebuffer {
    protected _canvas: HTMLCanvasElement | OffscreenCanvas;

    public constructor(gl: GL) {
        super(gl, 'Canvas');
        this._handle = null;
        this._canvas = gl.canvas;
    }

    public override initialize(): void { }

    public override clear(): void {
        this.bind();
        this._gl.clear(
            this._gl.COLOR_BUFFER_BIT |
            this._gl.DEPTH_BUFFER_BIT |
            this._gl.STENCIL_BUFFER_BIT);
    }

    public override swap(): void { }

    public override set size(v: vec2) {
        this._size = v;
        this._canvas.width = this._size[0];
        this._canvas.height = this._size[1];
    }

    public override get size() {
        return this._size ?? [this._canvas.width, this._canvas.height];
    }
}
