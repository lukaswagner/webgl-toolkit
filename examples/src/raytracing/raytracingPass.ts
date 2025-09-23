import { CameraListenerPass, CameraMatrices, FullscreenPass, GL, UniformBlock } from '@lukaswagner/webgl-toolkit';
import { mat4, vec3 } from 'gl-matrix';

const tracked = {
    Target: true,
    Camera: false,
};

type Sphere = {
    position: vec3;
    radius: number;
    diffuseColor?: vec3;
    roughness?: number;
    emissiveColor?: vec3;
    emissiveStrength?: number;
}

const spheres: Sphere[] = [
    { position: [0, 0, 0], radius: 0.25, emissiveColor: [1, 1, 1], emissiveStrength: 1 },
    { position: [1, 0, 0], radius: 0.15, diffuseColor: [1, 0, 0] },
    { position: [0, 1, 0], radius: 0.15, diffuseColor: [0, 1, 0] },
    { position: [0, 0, 1], radius: 0.15, diffuseColor: [0, 0, 1] },
];

export class RaytracingPass extends FullscreenPass<typeof tracked> implements CameraListenerPass {
    protected _viewProjectionInverse: mat4;
    protected _eye: vec3;

    protected _spheres: UniformBlock;

    public constructor(gl: GL, name?: string) {
        super(gl, tracked, name);
    }

    public initialize(): boolean {
        const valid = super.initialize({ fragSrc: [
            require('./main.frag') as string,
            require('./sphere.frag') as string,
        ] });

        this._program.setDefine('SPHERE_COUNT', spheres.length);
        this._program.compile();
        this._spheres = this._program.createUniformBlock('Spheres', undefined, true);
        this._spheres.data = this._getSphereData();
        this._spheres.upload();

        return valid;
    }

    protected override _setup(): void {
        this._target.bind();
        this._program.bind();
        this._spheres.bind();

        if (this._dirty.get('Camera')) {
            this._program.setUniform('u_eye', this._eye);
            this._updateCorners();
        }

        this._dirty.reset();
    }

    protected override _tearDown(): void {
        this._target.unbind();
        this._program.unbind();
        this._spheres.unbind();
    }

    public cameraChanged(m: CameraMatrices): void {
        this._viewProjectionInverse = m.viewProjectionInverse;
        this._eye = m.eye;
        this._dirty.set('Camera');
    }

    protected _updateCorners() {
        const lowerLeft = vec3.fromValues(-1, -1, -1);
        vec3.transformMat4(lowerLeft, lowerLeft, this._viewProjectionInverse);
        this._program.setUniform('u_lowerLeft', lowerLeft);

        const up = vec3.fromValues(-1, 1, -1);
        vec3.transformMat4(up, up, this._viewProjectionInverse);
        vec3.sub(up, up, lowerLeft);
        this._program.setUniform('u_up', up);

        const right = vec3.fromValues(1, -1, -1);
        vec3.transformMat4(right, right, this._viewProjectionInverse);
        vec3.sub(right, right, lowerLeft);
        this._program.setUniform('u_right', right);
    }

    protected _getSphereData() {
        const byteSize = Float32Array.BYTES_PER_ELEMENT;
        const buffer = new Float32Array(this._spheres.bytesSize / byteSize);

        const positionOffset = this._spheres.members[0].offset / byteSize;
        const diffuseOffset = this._spheres.members[1].offset / byteSize;
        const emissiveOffset = this._spheres.members[2].offset / byteSize;

        for(let i = 0; i < spheres.length; i++) {
            const sphere = spheres[i];

            const position = positionOffset + i * 4;
            buffer.set(sphere.position, position);
            buffer[position + 3] = sphere.radius;

            const diffuse = diffuseOffset + i * 4;
            buffer.set(sphere.diffuseColor ?? [0, 0, 0], diffuse);
            buffer[diffuse + 1] = sphere.roughness ?? 0;

            const emissive = emissiveOffset + i * 4;
            buffer.set(sphere.emissiveColor ?? [0, 0, 0], emissive);
            buffer[emissive + 1] = sphere.emissiveStrength ?? 0;
        }

        return buffer;
    }
}
