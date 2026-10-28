import { CameraListenerPass, CameraMatrices, FullscreenPass, GL } from '@lukaswagner/webgl-toolkit';
import { mat4, vec2, vec3 } from 'gl-matrix';

const tracked = {
    Target: true,
    ViewInverse: false,
    NearPlane: false,
    Eye: false,
    Size: false,
};

export class RaytracingPass extends FullscreenPass<typeof tracked> implements CameraListenerPass {
    protected _viewProjection: mat4;
    protected _nearPlane: vec3;
    protected _eye: vec3;
    protected _size: vec2;

    public constructor(gl: GL, name?: string) {
        super(gl, tracked, name);
    }

    public initialize(): boolean {
        const fragSrc = require('./rt.frag') as string;
        const valid = super.initialize({ fragSrc });

        return valid;
    }

    protected _setup(): void {
        super._setup();

        if (this._dirty.get(TrackedMembers.ViewInverse)) {
            this._gl.useProgram(this._program);
            this._gl.uniformMatrix4fv(this._uniforms.get('u_viewInverse'), false, this._viewInverse);
        }

        if (this._dirty.get(TrackedMembers.NearPlane)) {
            this._gl.useProgram(this._program);
            this._gl.uniform3fv(this._uniforms.get('u_nearPlane'), this._nearPlane);
        }

        if (this._dirty.get(TrackedMembers.Eye)) {
            this._gl.useProgram(this._program);
            this._gl.uniform3fv(this._uniforms.get('u_eye'), this._eye);
        }

        if (this._dirty.get(TrackedMembers.Size)) {
            this._gl.useProgram(this._program);
            this._gl.uniform2fv(this._uniforms.get('u_resolution'), this._size);
        }

        this._dirty.reset();
    }

    protected _tearDown(): void {
        super._tearDown();
    }

    cameraChanged(m: CameraMatrices): void {
        throw new Error('Method not implemented.');
    }
}
