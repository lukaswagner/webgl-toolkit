import { GL } from '../gl';
import { replaceDefines } from './defines';

export class Program {
    protected _gl: GL;
    protected _name: string;

    protected _defines = new Map<string, {
        value: { toString(): string };
        suffix: string;
    }>();

    protected _vertSrc: string;
    protected _vert: WebGLShader;
    protected _vertCompiled = false;

    protected _fragSrc: string;
    protected _frag: WebGLShader;
    protected _fragCompiled = false;

    protected _program: WebGLProgram;
    protected _linked = false;

    protected _uniformLocations = new Map<string, WebGLUniformLocation>();
    protected _attributeLocations = new Map<string, GLint>();

    public constructor(gl: GL, name = 'unnamed program') {
        this._gl = gl;
        this._name = name;
    }

    public set vertSrc(v: string) {
        this._vertSrc = v;
        this._vertCompiled = false;
    }

    public set fragSrc(v: string) {
        this._fragSrc = v;
        this._fragCompiled = false;
    }

    public setDefine(key: string, value: { toString(): string }, suffix?: string) {
        const changed =
            !this._defines.has(key) ||
            this._defines.get(key).value.toString() !== value.toString() ||
            this._defines.get(key).suffix !== (suffix ?? '');
        this._defines.set(key, { value, suffix: suffix ?? '' });
        if (changed) {
            this._vertCompiled = false;
            this._fragCompiled = false;
            this._linked = false;
        }
    }

    public compile() {
        if (!this._vertCompiled)
            this._compileVert();
        if (!this._vertCompiled)
            console.log(`${this._name}: vertex shader not compiled, skipping linking`);

        if (!this._fragCompiled)
            this._compileFrag();
        if (!this._fragCompiled)
            console.log(`${this._name}: fragment shader not compiled, skipping linking`);

        if (this._vertCompiled && this._fragCompiled)
            this._link();
    }

    protected _compileVert() {
        if (!this._vert)
            this._vert = this._gl.createShader(this._gl.VERTEX_SHADER);

        const src = replaceDefines(this._vertSrc, this._getDefines());
        this._gl.shaderSource(this._vert, src);
        this._gl.compileShader(this._vert);
        this._vertCompiled = this._gl.getShaderParameter(this._vert, this._gl.COMPILE_STATUS);

        if (!this._vertCompiled) {
            console.log(`${this._name}: vert compile failed`);
            console.log(this._gl.getShaderInfoLog(this._vert));
            console.log(this._addLineNumbers(src));
        }
    }

    protected _compileFrag() {
        if (!this._frag)
            this._frag = this._gl.createShader(this._gl.FRAGMENT_SHADER);

        const src = replaceDefines(this._fragSrc, this._getDefines());
        this._gl.shaderSource(this._frag, src);
        this._gl.compileShader(this._frag);
        this._fragCompiled = this._gl.getShaderParameter(this._frag, this._gl.COMPILE_STATUS);

        if (!this._fragCompiled) {
            console.log(`${this._name}: frag compile failed`);
            console.log(this._gl.getShaderInfoLog(this._frag));
            console.log(this._addLineNumbers(src));
        }
    }

    protected _link() {
        if (!this._program) {
            this._program = this._gl.createProgram();
            this._gl.attachShader(this._program, this._vert);
            this._gl.attachShader(this._program, this._frag);
        }

        this._gl.linkProgram(this._program);
        this._linked = this._gl.getProgramParameter(this._program, this._gl.LINK_STATUS);

        if (!this._linked) {
            console.log(`${this._name}: linking failed`);
            console.log(this._gl.getProgramInfoLog(this._program));
        }

        this._uniformLocations = new Map<string, WebGLUniformLocation>();
        this._attributeLocations = new Map<string, GLint>();
    }

    protected _getDefines() {
        return [...this._defines.entries()].map((v) => {
            return { key: v[0], value: v[1].value, suffix: v[1].suffix };
        });
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

    public getUniformLocation(key: string): WebGLUniformLocation {
        let location = this._uniformLocations.get(key);
        if (location === undefined) {
            location = this._gl.getUniformLocation(this._program, key);
            this._uniformLocations.set(key, location);
        }
        return location;
    }

    public getAttributeLocation(key: string): GLint {
        let location = this._attributeLocations.get(key);
        if (location === undefined) {
            location = this._gl.getAttribLocation(this._program, key);
            this._attributeLocations.set(key, location);
        }
        return location;
    }
}
