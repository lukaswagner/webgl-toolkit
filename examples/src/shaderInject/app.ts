import { Camera, setupFullscreen, Turntable } from '@lukaswagner/webgl-toolkit';
import { Renderer } from './renderer';

class App {
    protected _canvas: HTMLCanvasElement;
    protected _renderer: Renderer;
    protected _camera: Camera;

    public constructor(canvasId: string, containerId?: string) {
        this._canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        const contextAttributes: WebGLContextAttributes = { antialias: false, alpha: false };
        const gl = this._canvas.getContext('webgl2', contextAttributes);
        if (!gl) throw new Error('Could not acquire WebGL context');

        this._camera = new Camera();
        this._camera.eye = [1, 1, 2];
        new Turntable(this._canvas, this._camera);

        this._renderer = new Renderer(gl);
        this._renderer.camera = this._camera;
        this._renderer.initialize();

        setupFullscreen(containerId);

        requestAnimationFrame((t) => this.draw(t));
    }

    protected draw(time: number) {
        const shouldDraw = this._renderer.prepare(time);
        if (shouldDraw) this._renderer.draw(time);
        requestAnimationFrame((t) => this.draw(t));
    }
}

new App('canvas', 'container');
