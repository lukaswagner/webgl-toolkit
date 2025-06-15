import { FullscreenPass, GL, Texture2D } from '@lukaswagner/webgl-toolkit';

const tracked = {
    Target: true,
    Input: true,
    Radius: true,
};

export class BlurPass extends FullscreenPass<typeof tracked> {
    protected _inputTex: Texture2D;
    protected _radius = 1;

    public constructor(gl: GL, name?: string) {
        super(gl, tracked, name);
    }

    public initialize(): boolean {
        const valid = super.initialize({ fragSrc: require('./blur.frag') as string });
        this._initUniforms();
        return valid;
    }

    protected _initUniforms() {
        this._program.bind();
        this._program.setUniform('u_input', 0);
        this._program.unbind();
    }

    protected _setup(): void {
        if (this._dirty.get('Radius')) {
            this._program.setDefine('RADIUS', this._radius);
            this._program.compile();
            this._initUniforms();
        }

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

    public set radius(v: number) {
        this._radius = v;
        this._dirty.set('Radius');
    }
}
