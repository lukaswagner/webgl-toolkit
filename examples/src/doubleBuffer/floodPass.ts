import { FullscreenPass, GL, SizeListenerPass, Texture2D } from '@lukaswagner/webgl-toolkit';
import { vec2 } from 'gl-matrix';

const tracked = {
    Target: true,
    Input: true,
    Step: true,
    Size: false,
};

export class FloodPass extends FullscreenPass<typeof tracked> implements SizeListenerPass {
    protected _inputTex: Texture2D;
    protected _step: number;
    protected _size: vec2;

    public constructor(gl: GL, name?: string) {
        super(gl, tracked, name);
    }

    public initialize(): boolean {
        const fragSrc = require('./flood.frag') as string;
        const valid = super.initialize({ fragSrc });

        this._gl.useProgram(this._program);
        this._gl.uniform1i(this._uniforms.get('u_input'), 0);
        this._gl.useProgram(null);

        return valid;
    }

    public prepare(): boolean {
        if (this._dirty.get('Size')) {
            this._gl.useProgram(this._program);
            this._gl.uniform2f(
                this._uniforms.get('u_resStep'), 1 / this._size[0], 1 / this._size[1]);
            this._gl.useProgram(null);
        }

        super.prepare();
        // don't trigger redraw because the step size is changed multiple times per frame
        // this would result in permanent rendering
        return false;
    }

    protected _setup(): void {
        super._setup();
        this._gl.uniform1i(this._uniforms.get('u_step'), this._step);
        this._inputTex.bind(this._gl.TEXTURE0);
    }

    protected _tearDown(): void {
        this._inputTex.unbind(this._gl.TEXTURE0);
        super._tearDown();
    }

    public set input(v: Texture2D) {
        this._inputTex = v;
        this._dirty.set('Input');
    }

    public set step(v: number) {
        this._step = v;
        this._dirty.set('Step');
    }

    public get step() {
        return this._step;
    }

    public sizeChanged(size: vec2): void {
        this._size = size;
        this._dirty.set('Size');
    }
}
