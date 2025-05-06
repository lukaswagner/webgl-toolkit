import { Framebuffer, GL, ShaderRenderPass } from '@lukaswagner/webgl-toolkit';

const tracked = {
    Target: true,
    Selected: true,
};

export class PointPass extends ShaderRenderPass<typeof tracked> {
    protected static _COUNT = 10;
    protected _target: Framebuffer;
    protected _selected = -1;
    protected _geometry: WebGLVertexArrayObject;

    public constructor(gl: GL, name?: string) {
        super(gl, tracked, name);
    }

    public initialize() {
        this._geometry = this._createPoints();

        this._setupProgram();
        this._compileVert(require('./point.vert') as string);
        this._compileFrag(require('./point.frag') as string);
        this._linkProgram();

        this._dirty.setAll();
        return true;
    }

    protected _createPoints() {
        const vao = this._gl.createVertexArray();
        this._gl.bindVertexArray(vao);

        const position = this._gl.createBuffer();
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, position);

        const positionData = new Float32Array(PointPass._COUNT * 2);
        positionData.forEach((_, i) => positionData[i] = 0.1 + Math.random() * 0.8);

        this._gl.bufferData(this._gl.ARRAY_BUFFER, positionData.buffer, this._gl.STATIC_DRAW);

        this._gl.vertexAttribPointer(0, 2, this._gl.FLOAT, false, 0, 0);
        this._gl.enableVertexAttribArray(0);

        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, undefined);
        this._gl.bindVertexArray(undefined);
        return vao;
    }

    protected _setup(): void {
        this._target.bind();
        this._gl.useProgram(this._program);

        if (this._dirty.get('Selected'))
            this._gl.uniform1i(this._uniforms.get('u_selected'), this._selected);

        this._dirty.reset();
    }

    protected _draw(): void {
        this._gl.bindVertexArray(this._geometry);
        this._gl.drawArrays(this._gl.POINTS, 0, PointPass._COUNT);
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

    public set selected(v: number) {
        this._selected = v;
        this._dirty.set('Selected');
    }
}
