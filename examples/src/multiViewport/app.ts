import { Camera } from '@lukaswagner/webgl-toolkit';
import { Renderer } from './renderer';
import { vec3 } from 'gl-matrix';

class App {
    protected _canvas0: HTMLCanvasElement;
    protected _renderer0: Renderer;
    protected _canvas1: HTMLCanvasElement;
    protected _renderer1: Renderer;

    public constructor(canvasId0: string, canvasId1: string) {
        const contextAttributes: WebGLContextAttributes = { antialias: false, alpha: false };

        this._canvas0 = document.getElementById(canvasId0) as HTMLCanvasElement;
        const gl0 = this._canvas0.getContext('webgl2', contextAttributes);
        if (!gl0) throw new Error('Could not acquire WebGL context');

        const camera0 = new Camera();
        camera0.eye = [0, 0, 10];

        this._renderer0 = new Renderer(gl0);
        this._renderer0.camera = camera0;
        this._renderer0.initialize();

        this._canvas1 = document.getElementById(canvasId1) as HTMLCanvasElement;
        const gl1 = this._canvas1.getContext('webgl2', contextAttributes);
        if (!gl1) throw new Error('Could not acquire WebGL context');

        const camera1 = new Camera();
        camera1.eye = [0, 10, 0];
        camera1.up = [0, 0, -1];

        this._renderer1 = new Renderer(gl1);
        this._renderer1.camera = camera1;
        this._renderer1.initialize();

        const modeScale = 10;
        this._canvas0.onmousemove = (ev) => {
            const xRatio = ev.offsetX / this._canvas0.clientWidth;
            const yRatio = ev.offsetY / this._canvas0.clientHeight;
            const translation = vec3.fromValues(
                xRatio * modeScale - modeScale / 2,
                -(yRatio * modeScale - modeScale / 2),
                0,
            );
            this._renderer0.translation = translation;
            this._renderer1.translation = translation;
        };
        this._canvas1.onmousemove = (ev) => {
            const xRatio = ev.offsetX / this._canvas1.clientWidth;
            const yRatio = ev.offsetY / this._canvas1.clientHeight;
            const translation = vec3.fromValues(
                xRatio * modeScale - modeScale / 2,
                0,
                yRatio * modeScale - modeScale / 2,
            );
            this._renderer0.translation = translation;
            this._renderer1.translation = translation;
        };

        requestAnimationFrame((t) => this._draw(t));
    }

    protected _draw(time: number) {
        const shouldDraw0 = this._renderer0.prepare(time);
        if (shouldDraw0) this._renderer0.draw(time);

        const shouldDraw1 = this._renderer1.prepare(time);
        if (shouldDraw1) this._renderer1.draw(time);

        requestAnimationFrame((t) => this._draw(t));
    }
}

new App('canvas0', 'canvas1');
