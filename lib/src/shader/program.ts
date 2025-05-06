import { Attributes } from './attributes';
import { GL } from '../gl';
import { Uniforms } from './uniforms';

export class Program {
    protected _gl: GL;
    protected _name: string;
    protected _vert: WebGLShader;
    protected _vertCompiled = false;
    protected _frag: WebGLShader;
    protected _fragCompiled = false;
    protected _program: WebGLProgram;
    protected _linked = false;

    public uniforms: Uniforms;
    public attributes: Attributes;

    public constructor(gl: GL, name = 'unnamed program') {
        this._gl = gl;
        this._name = name;

        this._vert = this._gl.createShader(this._gl.VERTEX_SHADER);
        this._frag = this._gl.createShader(this._gl.FRAGMENT_SHADER);
        this._program = this._gl.createProgram();
        this._gl.attachShader(this._program, this._vert);
        this._gl.attachShader(this._program, this._frag);
    }

    public compileVert(src: string) {
        this._gl.shaderSource(this._vert, src);
        this._gl.compileShader(this._vert);
        this._vertCompiled = this._gl.getShaderParameter(this._vert, this._gl.COMPILE_STATUS);
        if (!this._vertCompiled) {
            console.log(`${this._name}: vert compile failed`);
            console.log(this._gl.getShaderInfoLog(this._vert));
            console.log(this._addLineNumbers(src));
        }
    }

    public compileFrag(src: string) {
        this._gl.shaderSource(this._frag, src);
        this._gl.compileShader(this._frag);
        this._fragCompiled = this._gl.getShaderParameter(this._frag, this._gl.COMPILE_STATUS);
        if (!this._fragCompiled) {
            console.log(`${this._name}: frag compile failed`);
            console.log(this._gl.getShaderInfoLog(this._frag));
            console.log(this._addLineNumbers(src));
        }
    }

    public link() {
        if (!this._vertCompiled)
            console.log(`${this._name}: vertex shader not compiled, skipping linking`);
        if (!this._fragCompiled)
            console.log(`${this._name}: fragment shader not compiled, skipping linking`);

        if (this._vertCompiled && this._fragCompiled) {
            this._gl.linkProgram(this._program);
            this._linked = this._gl.getProgramParameter(this._program, this._gl.LINK_STATUS);
            if (!this._linked) {
                console.log(`${this._name}: linking failed`);
                console.log(this._gl.getProgramInfoLog(this._program));
            }
            this.uniforms = new Uniforms(this._gl, this._program);
            this.attributes = new Attributes(this._gl, this._program);
        }

        if (!this.uniforms)
            this.uniforms = new Uniforms(this._gl, this._program);
        if (!this.attributes)
            this.attributes = new Attributes(this._gl, this._program);
    }

    public bind() {
        this._gl.useProgram(this._program);
    }

    public unbind() {
        this._gl.useProgram(null);
    }

    protected _addLineNumbers(src: string) {
        const split = src.split('\n');
        const padding = Math.ceil(Math.log10(split.length));
        return split
            .map((v, i) => `${(i + 1).toString().padStart(padding)}: ${v}`)
            .join('\n');
    }
}
