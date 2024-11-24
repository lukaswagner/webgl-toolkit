import { AccumulatePass, isJitterPass } from '../pass';
import { Framebuffer } from '../framebuffer';
import { halton2d } from '../data';
import { Renderer } from './renderer';
import { Texture2D } from '../texture';
import { vec2 } from 'gl-matrix';

const tracked = {
    Size: true,
    TaaEnabled: true,
    TaaFrame: true,
    TaaNumFrames: true,
    TaaHaltonBase1: true,
    TaaHaltonBase2: true,
};
type Tracked = typeof tracked;

export class TaaRenderer<T extends Tracked = Tracked> extends Renderer<T> {
    protected _taaEnabled = true;
    protected _taaFrame = 0;
    protected _taaNumFrames = 64;
    protected _taaHaltonBase1 = 2;
    protected _taaHaltonBase2 = 3;
    protected _taaKernel: vec2[];

    public constructor(gl: WebGL2RenderingContext, trackedMembers: T = tracked as any as T) {
        super(gl, trackedMembers);
    }

    protected _setupTaa(input: Texture2D) {
        const buffer = this._setupSingleTexBuffer('TAA');

        const pass = new AccumulatePass(this._gl, 'TAA Accumulate');
        pass.initialize();
        pass.target = buffer.fbo;

        input.minFilter = this._gl.NEAREST;
        input.magFilter = this._gl.NEAREST;
        pass.input = input;

        pass.preDraw = () => {
            this._gl.enable(this._gl.BLEND);
            this._gl.blendFunc(this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA);
        };
        pass.postDraw = () => {
            this._gl.disable(this._gl.BLEND);
        };

        return { buffer, pass };
    }

    protected _prepareTaa(requestRedraw: boolean, buffer: Framebuffer, pass: AccumulatePass) {
        const taaSettingsChanged =
            this._dirty.get('TaaEnabled') ||
            this._dirty.get('TaaNumFrames') ||
            this._dirty.get('TaaHaltonBase1') ||
            this._dirty.get('TaaHaltonBase2');
        if (taaSettingsChanged) {
            this._taaKernel = halton2d(
                this._taaHaltonBase1,
                this._taaHaltonBase2,
                this._taaNumFrames);
        }

        const cameraChanged = this._camera.timestamp > this._lastFrame;
        if (taaSettingsChanged || cameraChanged || requestRedraw) {
            if (this._taaFrame > 0)
                this._dirty.set('TaaFrame');
            this._taaFrame = 0;
            buffer.clear();
        }

        if (this._dirty.get('TaaFrame')) {
            const ndcOffset = this._taaFrame === 0 ?
                vec2.create() :
                vec2.clone(this._taaKernel[this._taaFrame - 1]);

            // loop around at 0.5 to -0.5
            if (ndcOffset[0] > 0.5) ndcOffset[0] -= 1;
            if (ndcOffset[1] > 0.5) ndcOffset[1] -= 1;

            for (const pass of this._passes) {
                if (isJitterPass(pass)) {
                    pass.ndcOffset = ndcOffset;
                }
            }

            pass.frame = this._taaFrame;
        }
    }

    public draw(time: number) {
        super.draw(time);

        if (this._taaEnabled) {
            this._taaFrame++;
            if (this._taaFrame < this._taaNumFrames)
                this._dirty.set('TaaFrame');
        }
    }

    public set taaEnabled(v: boolean) {
        this._taaEnabled = v;
        this._dirty.set('TaaEnabled');
    }

    public set taaNumFrames(v: number) {
        this._taaNumFrames = v;
        this._dirty.set('TaaNumFrames');
    }

    public set taaHaltonSequence(v: [number, number]) {
        this._taaHaltonBase1 = v[0];
        this._dirty.set('TaaHaltonBase1');
        this._taaHaltonBase2 = v[1];
        this._dirty.set('TaaHaltonBase2');
    }

    public get taaFrame() {
        return this._taaFrame;
    }
}
