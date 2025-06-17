import { GL, TypedArray } from '../types';

type View = DataView | TypedArray;

type MemberInfo = {
    name: string;
    index: number;
    type: number;
    offset: number;
    stride: number;
};

export class UniformBlock {
    protected _gl: GL;

    // defined by user
    public name: string;
    public binding: number;

    // derived / generated
    public data: View;
    public blockIndex: number;
    public buffer: WebGLBuffer;
    public bytesSize: number;
    public members: MemberInfo[];

    public constructor(
        gl: GL, program: WebGLProgram,
        name: string, binding: number,
        data?: View,
        log = false,
    ) {
        // store given values
        this._gl = gl;
        this.name = name;
        this.binding = binding;

        // derive / generate members
        this.blockIndex = gl.getUniformBlockIndex(program, name);

        this.bytesSize = gl.getActiveUniformBlockParameter(
            program, this.blockIndex, gl.UNIFORM_BLOCK_DATA_SIZE);

        this.data = data ?? new Float32Array(this.bytesSize / 4);

        const b = gl.createBuffer();
        if (b === null) throw new Error('Could not create buffer.');
        this.buffer = b;

        const indices: number[] = gl.getActiveUniformBlockParameter(
            program, this.blockIndex, gl.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES);
        if (indices === null) throw new Error('Could not fetch indices.');

        const offsets: number[] = gl.getActiveUniforms(program, indices, gl.UNIFORM_OFFSET);
        const strides: number[] = gl.getActiveUniforms(program, indices, gl.UNIFORM_ARRAY_STRIDE);

        this.members = [];
        indices.forEach((unformIndex, i) => {
            const info = gl.getActiveUniform(program, unformIndex);
            this.members.push({
                index: unformIndex,
                name: info.name,
                type: info.type,
                offset: offsets[i],
                stride: strides[i],
            });
        });

        // configure
        this._gl.uniformBlockBinding(program, this.blockIndex, binding);

        if (log) {
            console.log('name:', name);
            console.log('binding:', binding);
            console.log('bytes:', this.bytesSize);
            console.log('blockIndex:', this.blockIndex);
            console.log('members:', this.members);
        }
    }

    protected _uploadDataView(d: DataView) {
        if (this.data.byteLength !== this.bytesSize) {
            console.warn(`Invalid data length: expected ${this.bytesSize}, received ${this.data.byteLength}`);
            return;
        }

        this._gl.bindBuffer(this._gl.UNIFORM_BUFFER, this.buffer);
        this._gl.bufferData(this._gl.UNIFORM_BUFFER, d, this._gl.STATIC_DRAW, 0, 0);
        this._gl.bindBuffer(this._gl.UNIFORM_BUFFER, null);
    }

    protected _uploadTypedArray(d: TypedArray, offset: number = 0, length?: number) {
        if (length === undefined) {
            length = Math.min(d.length - offset, this.bytesSize / d.BYTES_PER_ELEMENT);
        }

        const byteLength = length * d.BYTES_PER_ELEMENT;
        if (byteLength !== this.bytesSize) {
            console.warn(`Invalid data length: expected ${this.bytesSize}, received ${byteLength}`);
            return;
        }

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
