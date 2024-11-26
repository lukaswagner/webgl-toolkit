import { FullscreenPass, GL, replaceDefines, Texture2D } from '@lukaswagner/webgl-toolkit';

const tracked = {
    Target: true,
    Input: true,
    Radius: true,
};

export class BlurPass extends FullscreenPass<typeof tracked> {
    protected _inputTex: Texture2D;
    protected _radius = 1;
    protected _fragSrc: string;

    public constructor(gl: GL, name?: string) {
        super(gl, tracked, name);
    }

    public initialize(): boolean {
        this._fragSrc = require('./blur.frag') as string;
        const valid = super.initialize({ fragSrc: this._getFragSrc() });
        this._initUniforms();
        return valid;
    }

    protected _getFragSrc() {
        return replaceDefines(this._fragSrc, [{ key: 'RADIUS', value: this._radius }]);
    }

    protected _initUniforms() {
        this._gl.useProgram(this._program);
        this._gl.uniform1i(this._uniforms.get('u_input'), 0);
        this._gl.useProgram(null);
    }

    public prepare(): boolean {
        if (this._dirty.get('Radius')) {
            this.compileFrag(this._getFragSrc());
            this.linkProgram();
            this._initUniforms();
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

    public set input(v: Texture2D) {
        this._inputTex = v;
        this._dirty.set('Input');
    }

    public set radius(v: number) {
        this._radius = v;
        this._dirty.set('Radius');
    }
}
