import { GL, TypedArray } from '../types';

type View = DataView | TypedArray;

export class UniformBlock {
    protected _gl: GL;
    protected _program: WebGLProgram;

    // defined by user
    public name: string;
    public members: string[];
    public binding: number;

    // derived / generated
    public data: View;
    public location: number;
    public buffer: WebGLBuffer;
    public bytes: number;
    public indices: number[];
    public offsets: number[];

    public constructor(
        gl: GL, program: WebGLProgram,
        name: string, members: string[], binding: number,
        data?: View,
        log = false,
    ) {
        // store given values
        this._gl = gl;
        this._program = program;
        this.name = name;
        this.members = members.map((member) => `${name}.${member}`);
        this.binding = binding;

        // derive / generate members
        this.location = gl.getUniformBlockIndex(program, name);

        this.bytes = gl.getActiveUniformBlockParameter(
            program, this.location, gl.UNIFORM_BLOCK_DATA_SIZE);

        this.data = data ?? new Float32Array(this.bytes / 4);

        const b = gl.createBuffer();
        if (b === null) throw new Error('Could not create buffer.');
        this.buffer = b;

        const i = gl.getUniformIndices(program, this.members);
        if (i === null) throw new Error('Could not fetch indices.');
        this.indices = i;

        const o = gl.getActiveUniforms(program, i, gl.UNIFORM_OFFSET);
        if (o === null) throw new Error('Could not fetch offsets.');
        this.offsets = o;

        // configure
        this._gl.uniformBlockBinding(program, this.location, binding);

        if (log) {
            console.log('name:', name);
            console.log('members:', this.members);
            console.log('binding:', binding);
            console.log('location:', this.location);
            console.log('bytes:', this.bytes);
            console.log('data:', this.data);
            console.log('buffer:', this.buffer);
            console.log('indices:', this.indices);
            console.log('offsets:', this.offsets);
        }
    }

    protected _uploadDataView(d: DataView) {
        if (this.data.byteLength !== this.bytes) {
            console.warn(`Invalid data length: expected ${this.bytes}, received ${this.data.byteLength}`);
            return;
        }

        this._gl.bindBuffer(this._gl.UNIFORM_BUFFER, this.buffer);
        this._gl.bufferData(this._gl.UNIFORM_BUFFER, d, this._gl.STATIC_DRAW, 0, 0);
        this._gl.bindBuffer(this._gl.UNIFORM_BUFFER, null);
    }

    protected _uploadTypedArray(d: TypedArray, offset: number = 0, length?: number) {
        if (length === undefined) {
            length = Math.min(d.length - offset, this.bytes / d.BYTES_PER_ELEMENT);
        }

        const byteLength = length * d.BYTES_PER_ELEMENT;
        if (byteLength !== this.bytes) {
            console.warn(`Invalid data length: expected ${this.bytes}, received ${byteLength}`);
            return;
        }

        console.log(`uploading ${d.byteLength}/${this.bytes}`);

        this._gl.bindBuffer(this._gl.UNIFORM_BUFFER, this.buffer);
        this._gl.bufferData(
            this._gl.UNIFORM_BUFFER, this.data,
            this._gl.STATIC_DRAW, offset, length);
        this._gl.bindBuffer(this._gl.UNIFORM_BUFFER, null);
    }

    public upload(offset: number = 0, length?: number): void {
        if (this.data instanceof DataView) {
            if (offset !== 0 || (length !== undefined && length > 0)) {
                console.warn('Can\'t use offset or length with DataView');
                return;
            }
            this._uploadDataView(this.data);
        } else {
            this._uploadTypedArray(this.data);
        }
    }

    public bind(): void {
        this._gl.bindBufferBase(this._gl.UNIFORM_BUFFER, this.binding, this.buffer);
    }

    public unbind(): void {
        this._gl.bindBufferBase(this._gl.UNIFORM_BUFFER, this.binding, null);
    }

    public delete(): void {
        this._gl.deleteBuffer(this.buffer);
    }
}
