import { FullscreenPass, GL, Texture2D } from '@lukaswagner/webgl-toolkit';

const tracked = {
    Target: true,
    Input: true,
};

export class InvertPass extends FullscreenPass<typeof tracked> {
    protected _inputTex: Texture2D;

    public constructor(gl: GL, name?: string) {
        super(gl, tracked, name);
    }

    public initialize(): boolean {
        const fragSrc = require('./invert.frag') as string;
        const valid = super.initialize({ fragSrc });

        this._program.bind();
        this._program.setUniform('u_input', 0);
        this._program.unbind();

        return valid;
    }

    protected _setup(): void {
        super._setup();
        this._inputTex.bind(this._gl.TEXTURE0);

        this._dirty.reset();
    }

    protected _tearDown(): void {
        this._inputTex.unbind(this._gl.TEXTURE0);
        super._tearDown();
    }

    public set input(v: Texture2D) {
        this._inputTex = v;
        this._dirty.set('Input');
    }
}
