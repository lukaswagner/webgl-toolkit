import { mat4, vec2 } from "gl-matrix";
import { Dirty } from "../data";
import { Camera } from "../camera";
import { Framebuffer } from "../framebuffer";
import { BlitPass, isCameraPass, RenderPass } from "../pass";
import { Texture2D, TextureFormat, TextureFormats } from "../texture";

const tracked = {
    Size: true,
}
type Tracked = typeof tracked;

export class Renderer<T extends Tracked = Tracked> {
    protected _gl: WebGL2RenderingContext;
    protected _canvas: HTMLCanvasElement;
    protected _resizeObserver: ResizeObserver;
    protected _size: vec2;
    protected _sizeFactor = 1;

    protected _dirty: Dirty<T>;
    protected _camera: Camera;
    protected _lastFrame = 0;

    protected _framebuffers: Framebuffer[] = [];
    protected _passes: RenderPass<any>[] = [];

    public constructor(gl: WebGL2RenderingContext, trackedMembers: T = tracked as any as T) {
        this._gl = gl;
        this._canvas = gl.canvas as HTMLCanvasElement;
        this._dirty = new Dirty(trackedMembers);
    }

    public initialize() {
        this._resize();
        this._watchResize();
    };

    public prepare(time: number) {
        let shouldRun = this._dirty.any();

        if (this._dirty.get('Size')) {
            this._gl.viewport(0, 0, this._size[0], this._size[1]);
            for (const fbo of this._framebuffers) {
                fbo.size = this._size;
            }
        }

        const cameraChanged = this._camera.timestamp > this._lastFrame;
        if (cameraChanged) {
            const view = this._camera.view;
            const projection = this._camera.projection;
            const viewProjection = mat4.mul(mat4.create(), projection, view);
            const viewInverse = mat4.invert(mat4.create(), view);
            const projectionInverse = mat4.invert(mat4.create(), projection);
            const viewProjectionInverse = mat4.invert(mat4.create(), viewProjection);
            for (const pass of this._passes) {
                if (isCameraPass(pass)) {
                    pass.view = view;
                    pass.projection = projection;
                    pass.viewProjection = viewProjection;
                    pass.viewInverse = viewInverse;
                    pass.projectionInverse = projectionInverse;
                    pass.viewProjectionInverse = viewProjectionInverse;
                }
            }
            shouldRun = true;
        }

        for (const pass of this._passes) {
            if (pass.prepare()) shouldRun = true;
        }

        this._dirty.reset();
        return shouldRun;
    }

    public draw(time: number) {
        for (const pass of this._passes) {
            pass.draw();
        }

        this._lastFrame = time;
    }

    protected _resize() {
        const newSize = vec2.fromValues(
            Math.floor(this._canvas.clientWidth * window.devicePixelRatio * this._sizeFactor),
            Math.floor(this._canvas.clientHeight * window.devicePixelRatio * this._sizeFactor)
        );

        this._size = newSize;
        this._camera.aspect = this._size[0] / this._size[1];
        this._dirty.set('Size');
    }

    protected _watchResize() {
        this._resizeObserver =
            new ResizeObserver(this._resize.bind(this) as ResizeObserverCallback);
        this._resizeObserver.observe(this._canvas);
    }

    protected _setupSingleTexBuffer(name: string, format = TextureFormats.RGBA) {
        const fbo = new Framebuffer(this._gl, name);
        const texture = this._createTex(format);
        texture.minFilter = this._gl.NEAREST;
        texture.magFilter = this._gl.NEAREST;
        const c0 = this._gl.COLOR_ATTACHMENT0;
        fbo.initialize([
            { slot: c0, texture },
        ]);
        this._framebuffers.push(fbo);
        return { fbo, texture };
    }

    protected _createTex(format: TextureFormat) {
        const tex = new Texture2D(this._gl);
        tex.initialize(format);
        return tex;
    }

    protected _setupBlitPass(srcFbo: Framebuffer, srcBuffer: GLenum, dstFbo: Framebuffer, dstBuffer: GLenum) {
        const pass = new BlitPass(this._gl);
        pass.readTarget = srcFbo;
        pass.readBuffer = srcBuffer;
        pass.drawTarget = dstFbo;
        pass.drawBuffer = dstBuffer;
        this._passes.push(pass);
        return pass;
    }

    public set camera(v: Camera) {
        this._camera = v;
    }

    public set sizeFactor(v: number) {
        this._sizeFactor = v;
        this._resize();
    }
}
