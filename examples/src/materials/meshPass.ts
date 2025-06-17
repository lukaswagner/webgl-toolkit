import {
    CameraListenerPass, CameraMatrices, Framebuffer, GL, Program, RenderPass,
    UniformBlock,
} from '@lukaswagner/webgl-toolkit';
import { mat4, vec3 } from 'gl-matrix';

const tracked = {
    Target: true,
    Model: true,
    Camera: true,
    Mesh: false,
    MaterialCount: false,
    Materials: false,
};

export type Mesh = {
    positions: Float32Array;
    normals: Float32Array;
    material: number;
};

export type Material = {
    ambient: vec3;
    diffuse: vec3;
    specular: vec3;
    shininess: number;
};

export class MeshPass extends RenderPass<typeof tracked> implements CameraListenerPass {
    protected _target: Framebuffer;
    protected _model: mat4;
    protected _viewProjection: mat4;
    protected _eye: vec3;
    protected _program: Program;

    protected _geometry: WebGLVertexArrayObject;
    protected _vertexCount: number;
    protected _positions: WebGLBuffer;
    protected _positionData: Float32Array;
    protected _normals: WebGLBuffer;
    protected _normalData: Float32Array;
    protected _materialIndices: WebGLBuffer;
    protected _materialIndexData: Uint16Array;

    protected _materialCount: number;
    protected _materials: Material[];
    protected _materialUniform: UniformBlock;

    public constructor(gl: GL, name?: string) {
        super(gl, tracked, name);
    }

    public initialize() {
        this._geometry = this._createVAO();

        this._program = new Program(this._gl, 'mesh');
        this._program.vertSrc = require('./mesh.vert') as string;
        this._program.fragSrc = [
            require('./mesh.frag') as string,
            require('./lighting.glsl') as string,
        ];
        this._program.compile();

        return true;
    }

    protected _createArrayBuffer(
        index: number, size: number, type: number, int: boolean, data?: ArrayBufferView
    ) {
        const buffer = this._gl.createBuffer();
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffer);
        if (data)
            this._gl.bufferData(this._gl.ARRAY_BUFFER, data.buffer, this._gl.STATIC_DRAW);
        if (int)
            this._gl.vertexAttribIPointer(index, size, type, 0, 0);
        else
            this._gl.vertexAttribPointer(index, size, type, false, 0, 0);
        this._gl.enableVertexAttribArray(index);
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, undefined);
        return buffer;
    }

    protected _createVAO() {
        const vao = this._gl.createVertexArray();
        this._gl.bindVertexArray(vao);

        this._vertexCount = 3;
        this._positions = this._createArrayBuffer(
            0, 3, this._gl.FLOAT, false,
            new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]));
        this._normals = this._createArrayBuffer(
            1, 3, this._gl.FLOAT, false,
            new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]));
        this._materialIndices = this._createArrayBuffer(
            2, 1, this._gl.UNSIGNED_SHORT, true,
            new Uint16Array([0, 0, 0]));

        this._gl.bindVertexArray(undefined);
        return vao;
    }

    protected _upload(buffer: WebGLBuffer, data: ArrayBufferView) {
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffer);
        this._gl.bufferData(this._gl.ARRAY_BUFFER, data.buffer, this._gl.STATIC_DRAW);
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, undefined);
    }

    protected _setup(): void {
        if (this._dirty.get('Mesh')) {
            if (this._positionData) {
                this._upload(this._positions, this._positionData);
                this._vertexCount = this._positionData.length / 3;
            }
            if (this._normalData)
                this._upload(this._normals, this._normalData);
            if (this._materialIndexData)
                this._upload(this._materialIndices, this._materialIndexData);
        }

        if (this._dirty.get('MaterialCount')) {
            if (this._materialUniform) this._materialUniform.delete();
            this._program.setDefine('MATERIAL_COUNT', this._materialCount);
            this._program.compile();
            this._materialUniform = this._program.createUniformBlock('Materials');
        }

        if (this._dirty.get('Materials')) {
            const data = this._materialUniform.data as Float32Array;
            this._materials.forEach((material, materialIndex) => {
                const offset = (memberIndex: number): number => {
                    const m = this._materialUniform.members[memberIndex];
                    return (m.offset + materialIndex * m.stride) / Float32Array.BYTES_PER_ELEMENT;
                };
                data.set(material.ambient, offset(0));
                data.set(material.diffuse, offset(1));
                data.set(material.specular, offset(2));
                data[offset(2) + 3] = material.shininess;
            });

            this._materialUniform.upload();
        }

        this._program.bind();

        if (this._dirty.get('Model'))
            this._program.setUniform('u_model', this._model);

        if (this._dirty.get('Camera')) {
            this._program.setUniform('u_viewProjection', this._viewProjection);
            this._program.setUniform('u_eye', this._eye);
        }

        this._target.bind();
        this._materialUniform.bind();
        this._dirty.reset();
    }

    protected _draw(): void {
        this._gl.bindVertexArray(this._geometry);
        this._gl.drawArrays(this._gl.TRIANGLES, 0, this._vertexCount);
        this._gl.bindVertexArray(undefined);
    }

    protected _tearDown(): void {
        this._materialUniform.unbind();
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
        this._eye = v.eye;
        this._dirty.set('Camera');
    }

    public set meshes(meshes: Mesh[]) {
        const vertexCount = meshes.reduce((prev, m) => prev + m.positions.length, 0);

        const positions = new Float32Array(vertexCount);
        const normals = new Float32Array(vertexCount);
        const materials = new Uint16Array(vertexCount);

        let vertexOffset = 0;
        for (const mesh of meshes) {
            const count = mesh.positions.length / 3;
            positions.set(mesh.positions, vertexOffset * 3);
            normals.set(mesh.normals, vertexOffset * 3);
            materials.fill(mesh.material, vertexOffset, vertexOffset + count);
            vertexOffset += count;
        }

        this._positionData = positions;
        this._normalData = normals;
        this._materialIndexData = materials;
        this._dirty.set('Mesh');
    }

    public set materials(materials: Material[]) {
        if (materials.length !== this._materialCount) {
            this._materialCount = materials.length;
            this._dirty.set('MaterialCount');
        }

        this._materials = materials;
        this._dirty.set('Materials');
    }
}
