import { accumulateFrag } from '../shader';
import { FullscreenPass } from './fullscreenPass';
import { GL } from '../types';
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

    public override initialize(): boolean {
        const fragSrc = accumulateFrag;
        const valid = super.initialize({ fragSrc });

        this._program.bind();
        this._program.setUniform('u_input', 0);
        this._program.unbind();

        return valid;
    }

    protected override _setup(): void {
        if (this._dirty.get('Frame')) {
            this._program.bind();
            this._program.setUniform('u_alpha', 1 / (this._frame + 1));
        }

        super._setup();
        this._inputTex.bind(this._gl.TEXTURE0);

        this._dirty.reset();
    }

    protected override _tearDown(): void {
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
