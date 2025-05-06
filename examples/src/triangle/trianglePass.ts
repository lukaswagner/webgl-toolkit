import {
    CameraListenerPass, CameraMatrices, Framebuffer, GL, ShaderRenderPass,
} from '@lukaswagner/webgl-toolkit';
import { mat4 } from 'gl-matrix';

const tracked = {
    Target: true,
    Model: true,
    ViewProjection: true,
};

export class TrianglePass extends ShaderRenderPass<typeof tracked> implements CameraListenerPass {
    protected _target: Framebuffer;
    protected _model: mat4;
    protected _viewProjection: mat4;
    protected _geometry: WebGLVertexArrayObject;

    public constructor(gl: GL, name?: string) {
        super(gl, tracked, name);
    }

    public initialize() {
        this._geometry = this.createTriangle();

        this.setupProgram();
        this.compileVert(require('./triangle.vert') as string);
        this.compileFrag(require('./triangle.frag') as string);
        this.linkProgram();

        this._dirty.setAll();
        return true;
    }

    protected createTriangle() {
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
        this._gl.useProgram(this._program);

        if (this._dirty.get('Model')) {
            this._gl.uniformMatrix4fv(
                this._uniforms.get('u_model'), false, this._model);
        }

        if (this._dirty.get('ViewProjection')) {
            this._gl.uniformMatrix4fv(
                this._uniforms.get('u_viewProjection'), false, this._viewProjection);
        }

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
        this._gl.useProgram(null);
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
