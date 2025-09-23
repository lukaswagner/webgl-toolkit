import { fullscreenFrag, fullscreenVert, Program } from '../shader';
import { Framebuffer } from '../framebuffer';
import { GL } from '../types';
import { RenderPass } from './renderPass';

const tracked = {
    Target: true,
};
type Tracked = typeof tracked;

export enum FragmentLocation {
    Color,
}

type Options = {
    fragSrc?: string | string[];
};

export class FullscreenPass<T extends Tracked = Tracked> extends RenderPass<T> {
    protected _buffer: WebGLBuffer;
    protected _target: Framebuffer;
    protected _program: Program;

    public constructor(gl: GL, trackedMembers: T = tracked as any as T, name?: string) {
        super(gl, trackedMembers, name);
    }

    public initialize(options?: Options) {
        this._program = new Program(this._gl, 'points');
        this._program.setDefine('COLOR_LOCATION', FragmentLocation.Color);
        this._program.vertSrc = fullscreenVert;
        this._program.fragSrc = options?.fragSrc ?? fullscreenFrag;
        this._program.compile();

        this._buffer = this._gl.createBuffer();
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._buffer);
        const positionData = new Float32Array([0, 0, 0, 2, 2, 0]);
        this._gl.bufferData(this._gl.ARRAY_BUFFER, positionData.buffer, this._gl.STATIC_DRAW);
        this._gl.vertexAttribPointer(0, 2, this._gl.FLOAT, false, 0, 0);
        this._gl.enableVertexAttribArray(0);
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);

        this._dirty.setAll();
        return true;
    }

    protected _setup(): void {
        this._target.bind();
        this._program.bind();

        this._dirty.reset();
    }

    protected _draw(): void {
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._buffer);
        this._gl.drawArrays(this._gl.TRIANGLES, 0, 3);
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);
    }

    protected _tearDown(): void {
        this._target.unbind();
        this._program.unbind();
    }

    public set target(v: Framebuffer) {
        this._target = v;
        this._dirty.set('Target');
    }
}
