import { GL } from '../types';
import { TextureFormat } from './formats';
import { vec2 } from 'gl-matrix';

export enum BufferMode {
    Single,
    Double, // for ping-pong rendering
}

/**
 * Texture wrapper with support for ping-pong rendering
 */
export class Texture2D {
    protected _gl: GL;
    protected _format: TextureFormat;
    protected _bufferMode: BufferMode;
    protected _size: vec2;
    protected _handle: WebGLTexture;
    protected _double: WebGLTexture;

    public constructor(gl: GL) {
        this._gl = gl;
    }

    public initialize(format: TextureFormat, bufferMode = BufferMode.Single) {
        this._format = format;
        this._bufferMode = bufferMode;
        this._handle = this._gl.createTexture();
        if (this._bufferMode === BufferMode.Double)
            this._double = this._gl.createTexture();

        // set a default value to avoid incomplete framebuffers
        this.minFilter = this._gl.NEAREST;
        this.magFilter = this._gl.NEAREST;

        this.size = [1, 1];
    }

    protected _resize(handle: WebGLTexture) {
        this._gl.bindTexture(this._gl.TEXTURE_2D, handle);
        this._gl.texImage2D(
            this._gl.TEXTURE_2D, 0, this._format.internalFormat,
            this._size[0], this._size[1],
            0, this._format.format, this._format.type, undefined);
        this._gl.bindTexture(this._gl.TEXTURE_2D, null);
    }

    public set size(size: vec2) {
        this._size = size;
        this._resize(this._handle);
        if (this._bufferMode === BufferMode.Double)
            this._resize(this._double);
    }

    protected _setData(handle: WebGLTexture, data: ArrayBufferView) {
        this._gl.bindTexture(this._gl.TEXTURE_2D, handle);
        this._gl.texImage2D(
            this._gl.TEXTURE_2D, 0, this._format.internalFormat,
            this._size[0], this._size[1],
            0, this._format.format, this._format.type, data);
        this._gl.bindTexture(this._gl.TEXTURE_2D, null);
    }

    public set data(data: ArrayBufferView) {
        this._setData(this._handle, data);
        if (this._bufferMode === BufferMode.Double)
            this._setData(this._double, data);
    }

    public get readHandle() {
        return this._handle;
    }

    public get writeHandle() {
        if (this._bufferMode === BufferMode.Double)
            return this._double;
        return this._handle;
    }

    public swap() {
        if (this._bufferMode === BufferMode.Single) return;
        [this._handle, this._double] = [this._double, this._handle];
    }

    public get bufferMode() {
        return this._bufferMode;
    }

    public get format(): TextureFormat {
        return this._format;
    }

    public bind(target: GLenum = this._gl.TEXTURE0) {
        this._gl.activeTexture(target);
        this._gl.bindTexture(this._gl.TEXTURE_2D, this.readHandle);
    }

    public unbind(target: GLenum = this._gl.TEXTURE0) {
        this._gl.activeTexture(target);
        this._gl.bindTexture(this._gl.TEXTURE_2D, null);
    }

    public set minFilter(v: GLenum) {
        this.bind();
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, v);
        this.unbind();
        if (this._bufferMode === BufferMode.Double) {
            this.swap();
            this.bind();
            this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, v);
            this.unbind();
            this.swap();
        }
    }

    public set magFilter(v: GLenum) {
        this.bind();
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER, v);
        this.unbind();
        if (this._bufferMode === BufferMode.Double) {
            this.swap();
            this.bind();
            this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER, v);
            this.unbind();
            this.swap();
        }
    }
}
