import {
    CameraListenerPass, CameraMatrices, Framebuffer, GL, Program, RenderPass,
} from '@lukaswagner/webgl-toolkit';
import { mat4 } from 'gl-matrix';

const tracked = {
    Target: true,
    Model: true,
    ViewProjection: true,
};

export class TrianglePass extends RenderPass<typeof tracked> implements CameraListenerPass {
    protected _target: Framebuffer;
    protected _model: mat4;
    protected _viewProjection: mat4;
    protected _geometry: WebGLVertexArrayObject;
    protected _program: Program;

    public constructor(gl: GL, name?: string) {
        super(gl, tracked, name);
    }

    public initialize() {
        this._geometry = this._createTriangle();

        this._program = new Program(this._gl, 'points');
        this._program.vertSrc = require('./triangle.vert') as string;
        this._program.fragSrc = require('./triangle.frag') as string;
        this._program.compile();

        this._dirty.setAll();
        return true;
    }

    protected _createTriangle() {
        const vao = this._gl.createVertexArray();
        this._gl.bindVertexArray(vao);

        const position = this._gl.createBuffer();
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, position);

        const positionData = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
        this._gl.bufferData(this._gl.ARRAY_BUFFER, positionData.buffer, this._gl.STATIC_DRAW);

        this._gl.vertexAttribPointer(0, 3, this._gl.FLOAT, false, 0, 0);
        this._gl.enableVertexAttribArray(0);

        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, undefined);
        this._gl.bindVertexArray(undefined);
        return vao;
    }

    protected _setup(): void {
        this._program.bind();

        if (this._dirty.get('Model'))
            this._program.setUniform('u_model', this._model);

        if (this._dirty.get('ViewProjection'))
            this._program.setUniform('u_viewProjection', this._viewProjection);

        this._target.bind();

        this._dirty.reset();
    }

    protected _draw(): void {
        this._gl.bindVertexArray(this._geometry);
        this._gl.drawArrays(this._gl.TRIANGLES, 0, 3);
        this._gl.bindVertexArray(undefined);
    }

    protected _tearDown(): void {
        this._target.unbind();
        this._program.unbind();
    }

    public set target(v: Framebuffer) {
        this._target = v;
        this._dirty.set('Target');
    }

    public set model(v: mat4) {
        this._model = v;
        this._dirty.set('Model');
    }

    public cameraChanged(v: CameraMatrices) {
        this._viewProjection = v.viewProjection;
        this._dirty.set('ViewProjection');
    }
}
