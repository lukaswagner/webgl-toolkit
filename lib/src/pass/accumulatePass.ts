import { accumulateFrag } from '../shader';
import { FullscreenPass } from './fullscreenPass';
import { GL } from '../gl';
import { Texture2D } from '../texture';

const tracked = {
    Target: true,
    Frame: true,
    Input: true,
};

export class AccumulatePass extends FullscreenPass<typeof tracked> {
    protected _frame: number;
    protected _inputTex: Texture2D;

    public constructor(gl: GL, name?: string) {
        super(gl, tracked, name);
    }

    public initialize(): boolean {
        const fragSrc = accumulateFrag;
        const valid = super.initialize({ fragSrc });

        this._gl.useProgram(this._program);
        this._gl.uniform1i(this._uniforms.get('u_input'), 0);
        this._gl.useProgram(null);

        return valid;
    }

    public prepare(): boolean {
        if (this._dirty.get('Frame')) {
            this._gl.useProgram(this._program);
            this._gl.uniform1f(this._uniforms.get('u_alpha'), 1 / (this._frame + 1));
            this._gl.useProgram(null);
        }
        return super.prepare();
    }

    protected _setup(): void {
        super._setup();

        this._inputTex.bind(this._gl.TEXTURE0);
    }

    protected _tearDown(): void {
        this._inputTex.unbind(this._gl.TEXTURE0);
        super._tearDown();
    }

    public set frame(v: number) {
        this._frame = v;
        this._dirty.set('Frame');
    }

    public set input(v: Texture2D) {
        this._inputTex = v;
        this._dirty.set('Input');
    }
}
