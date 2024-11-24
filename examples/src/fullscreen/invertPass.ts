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

        this._gl.useProgram(this._program);
        this._gl.uniform1i(this._uniforms.get('u_input'), 0);
        this._gl.useProgram(null);

        return valid;
    }

    protected _setup(): void {
        super._setup();
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
}
