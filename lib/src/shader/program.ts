import {
    getUniformSetFuncMap,
    MultiSetFunc,
    MultiSetParam,
    SingleSetFunc,
    SingleSetParam,
    UniformSetFuncMap,
} from './uniformSetFunctionMap';
import { GL } from '../types';
import { replaceDefines } from './defines';
import { UniformBlock } from './uniformBlock';

type UniformInfo = {
    type: number;
    size: number;
    location: WebGLUniformLocation;
    singleSetFunc: SingleSetFunc;
    multiSetFunc: MultiSetFunc;
};

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

    protected _attributeLocations = new Map<string, GLint>();

    protected _uniformSetFuncMap: UniformSetFuncMap;
    protected _uniformInfo = new Map<string, UniformInfo>();

    protected _nextBlockBinding = 0;

    public constructor(gl: GL, name = 'unnamed program') {
        this._gl = gl;
        this._name = name;
        this._uniformSetFuncMap = getUniformSetFuncMap(gl);
    }

    public set vertSrc(v: string | string[]) {
        if (Array.isArray(v))
            this._vertSrc = v.join('\n');
        else
            this._vertSrc = v;
        this._vertCompiled = false;
    }

    public set fragSrc(v: string | string[]) {
        if (Array.isArray(v))
            this._fragSrc = v.join('\n');
        else
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

        let src = replaceDefines(this._vertSrc, this._getDefines());
        if(!src.startsWith('#version'))
            src = '#version 300 es\n' + src;
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

        let src = replaceDefines(this._fragSrc, this._getDefines());
        if(!src.startsWith('#version'))
            src = '#version 300 es\n' + src;
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

        this._getUniformInfo();
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
        return this._uniformInfo.get(key)?.location;
    }

    public getAttributeLocation(key: string): GLint {
        let location = this._attributeLocations.get(key);
        if (location === undefined) {
            location = this._gl.getAttribLocation(this._program, key);
            this._attributeLocations.set(key, location);
        }
        return location;
    }

    protected _getUniformInfo() {
        this._uniformInfo = new Map<string, UniformInfo>();
        const activeCount = this._gl.getProgramParameter(this._program, this._gl.ACTIVE_UNIFORMS);

        for (let i = 0; i < activeCount; i++) {
            const info = this._gl.getActiveUniform(this._program, i);
            const loc = this._gl.getUniformLocation(this._program, info.name);
            const setFuncs = this._uniformSetFuncMap.get(info.type);

            this._uniformInfo.set(info.name, {
                type: info.type,
                size: info.type,
                location: loc,
                singleSetFunc: setFuncs[0],
                multiSetFunc: setFuncs[1],
            });
        }
    }

    /** set a uniform by passing the values individually */
    public setUniform(name: string, v0: number, v1?: number, v2?: number, v3?: number): void;
    public setUniform(name: string, v0: boolean, v1?: boolean, v2?: boolean, v3?: boolean): void;
    /** set a uniform by passing the values as an array */
    public setUniform(name: string, values: ArrayBufferView | number[]): void;
    public setUniform(name: string, ...values: (SingleSetParam | MultiSetParam)[]) {
        const info = this._uniformInfo.get(name);
        if (!info) return;
        const firstArgIsArray = Array.isArray(values[0]) || ArrayBuffer.isView(values[0]);
        if (arguments.length > 2 || !firstArgIsArray) {
            info.singleSetFunc(info.location, ...(values as SingleSetParam[]));
        } else {
            info.multiSetFunc(info.location, (values as MultiSetParam[])[0]);
        }
    }

    public createUniformBlock(
        name: string, data?: Float32Array, logInfo = false
    ) {
        return new UniformBlock(
            this._gl, this._program, name, this._nextBlockBinding++, data, logInfo);
    }
}
