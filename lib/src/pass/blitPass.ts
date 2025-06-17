import { drawBuffer, Framebuffer } from '../framebuffer';
import { GL } from '../types';
import { RenderPass } from './renderPass';

const tracked = {
    ReadTarget: true,
    ReadBuffer: true,
    DrawTarget: true,
    DrawBuffer: true,
};

export class BlitPass extends RenderPass<typeof tracked> {
    public constructor(gl: GL, name?: string) {
        super(gl, tracked, name);
    }

    protected _readTarget: Framebuffer;
    public set readTarget(value: Framebuffer) {
        this._readTarget = value;
        this._dirty.set('ReadTarget');
    }
    public get readTarget() {
        return this._readTarget;
    }

    protected _readBuffer: number;
    public set readBuffer(value: number) {
        this._readBuffer = value;
        this._dirty.set('ReadBuffer');
    }
    public get readBuffer() {
        return this._readBuffer;
    }

    protected _drawTarget: Framebuffer;
    public set drawTarget(value: Framebuffer) {
        this._drawTarget = value;
        this._dirty.set('DrawTarget');
    }
    public get drawTarget() {
        return this._drawTarget;
    }

    protected _drawBuffer: number;
    public set drawBuffer(value: number) {
        this._drawBuffer = value;
        this._dirty.set('DrawBuffer');
    }
    public get drawBuffer() {
        return this._drawBuffer;
    }

    public override initialize(): void { }

    protected override _setup(): void {
        this._readTarget.bind(this._gl.READ_FRAMEBUFFER);
        this._gl.readBuffer(this._readBuffer);

        this._drawTarget.bind(this._gl.DRAW_FRAMEBUFFER);
        drawBuffer(this._gl, this._drawBuffer);

        this._dirty.reset();
    }

    protected override _draw(): void {
        const readSize = this._readTarget.size;
        const writeSize = this._drawTarget.size;
        this._gl.blitFramebuffer(
            0, 0, readSize[0], readSize[1],
            0, 0, writeSize[0], writeSize[1],
            this._gl.COLOR_BUFFER_BIT, this._gl.NEAREST);
    }

    protected override _tearDown(): void {
        this._readTarget.unbind(this._gl.READ_FRAMEBUFFER);
        this._drawTarget.unbind(this._gl.DRAW_FRAMEBUFFER);
    }
}
