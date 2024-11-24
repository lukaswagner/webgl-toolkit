import { DirtyInit } from '../data';
import { GL } from '../gl';
import { RenderPass } from './renderPass';
import { Uniforms } from '../shader';

export abstract class ShaderRenderPass<T extends DirtyInit> extends RenderPass<T> {
    protected _vert: WebGLShader;
    protected _vertCompiled = false;
    protected _frag: WebGLShader;
    protected _fragCompiled = false;
    protected _program: WebGLProgram;
    protected _uniforms: Uniforms;

    public constructor(gl: GL, trackedMembers: T, name?: string) {
        super(gl, trackedMembers, name);
    }

    protected compileVert(src: string) {
        this._gl.shaderSource(this._vert, src);
        this._gl.compileShader(this._vert);
        this._vertCompiled = this._gl.getShaderParameter(this._vert, this._gl.COMPILE_STATUS);
        if (!this._vertCompiled) {
            console.log(this._gl.getShaderInfoLog(this._vert));
            console.log(src);
        }
    }

    protected compileFrag(src: string) {
        this._gl.shaderSource(this._frag, src);
        this._gl.compileShader(this._frag);
        this._fragCompiled = this._gl.getShaderParameter(this._frag, this._gl.COMPILE_STATUS);
        if (!this._fragCompiled) {
            console.log(this._gl.getShaderInfoLog(this._frag));
            console.log(src);
        }
    }

    protected setupProgram() {
        this._vert = this._gl.createShader(this._gl.VERTEX_SHADER);
        this._frag = this._gl.createShader(this._gl.FRAGMENT_SHADER);
        this._program = this._gl.createProgram();
        this._gl.attachShader(this._program, this._vert);
        this._gl.attachShader(this._program, this._frag);
    }

    protected linkProgram() {
        if (!this._vertCompiled)
            console.log('vertex shader not compiled, skipping linking');
        if (!this._fragCompiled)
            console.log('fragment shader not compiled, skipping linking');
        this._gl.linkProgram(this._program);
        if (!this._gl.getProgramParameter(this._program, this._gl.LINK_STATUS))
            console.log(this._gl.getProgramInfoLog(this._program));

        this._uniforms = new Uniforms(this._gl, this._program);
    }
}
