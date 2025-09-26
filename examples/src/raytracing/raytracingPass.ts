import {
    CameraListenerPass, CameraMatrices, FullscreenPass, GL, Texture2D, TextureFormats, UniformBlock,
} from '@lukaswagner/webgl-toolkit';
import { mat4, vec3 } from 'gl-matrix';
import { normalNoise, randomNoise } from './noise';

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
};

const spheres: Sphere[] = [
    { position: [0, 0, 0], radius: 0.5, emissiveColor: [1, 1, 1], emissiveStrength: 1 },
    { position: [1, 0, 0], radius: 0.25, diffuseColor: [1, 0.5, 0.5], roughness: 0.2 },
    { position: [0, 1, 0], radius: 0.25, diffuseColor: [0.5, 1, 0.5] },
    { position: [0, 0, 1], radius: 0.25, diffuseColor: [0.5, 0.5, 1] },
    { position: [-1, 0, 0], radius: 0.25, diffuseColor: [0.5, 1, 1], roughness: 0.2 },
    { position: [0, -1, 0], radius: 0.25, diffuseColor: [1, 0.5, 1] },
    { position: [0, 0, -1], radius: 0.25, diffuseColor: [1, 1, 0.5] },
];

export class RaytracingPass extends FullscreenPass<typeof tracked> implements CameraListenerPass {
    protected _viewProjectionInverse: mat4;
    protected _eye: vec3;

    protected _spheres: UniformBlock;

    protected static readonly _NOISE_RES = 256;
    protected _randomNoise: Texture2D;
    protected _normalNoise: Texture2D;

    public constructor(gl: GL, name?: string) {
        super(gl, tracked, name);
    }

    public initialize(): boolean {
        const valid = super.initialize({ fragSrc: [
            require('./main.frag') as string,
            require('./trace.frag') as string,
            require('./sphere.frag') as string,
            require('./noise.frag') as string,
        ] });

        this._program.setDefine('MAX_BOUNCE', 5);

        this._program.setDefine('SPHERE_COUNT', spheres.length);
        this._program.compile();
        this._spheres = this._program.createUniformBlock('Spheres');
        this._spheres.data = this._getSphereData();
        this._spheres.upload();

        this._program.bind();
        this._program.setUniform('u_ambient', [0.25, 0.25, 0.25]);
        this._program.setUniform('u_noiseResolution', RaytracingPass._NOISE_RES);
        this._program.setUniform('u_randomNoise', 0);
        this._program.setUniform('u_normalNoise', 1);
        this._program.unbind();

        this._prepareNoise();

        return valid;
    }

    protected override _setup(): void {
        this._target.bind();
        this._program.bind();
        this._spheres.bind();
        this._randomNoise.bind(this._gl.TEXTURE0);
        this._normalNoise.bind(this._gl.TEXTURE1);

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
        this._randomNoise.unbind(this._gl.TEXTURE0);
        this._normalNoise.unbind(this._gl.TEXTURE1);
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

        for (let i = 0; i < spheres.length; i++) {
            const sphere = spheres[i];

            const position = positionOffset + i * 4;
            buffer.set(sphere.position, position);
            buffer[position + 3] = sphere.radius;

            const diffuse = diffuseOffset + i * 4;
            buffer.set(sphere.diffuseColor ?? [0, 0, 0], diffuse);
            buffer[diffuse + 3] = sphere.roughness ?? 0;

            const emissive = emissiveOffset + i * 4;
            buffer.set(sphere.emissiveColor ?? [0, 0, 0], emissive);
            buffer[emissive + 3] = sphere.emissiveStrength ?? 0;
        }

        return buffer;
    }

    protected _prepareNoise() {
        const noiseRes = RaytracingPass._NOISE_RES;

        this._randomNoise = new Texture2D(this._gl);
        this._randomNoise.initialize(TextureFormats.R32F);
        this._randomNoise.size = [noiseRes, noiseRes];
        this._randomNoise.data = randomNoise(noiseRes * noiseRes);

        this._normalNoise = new Texture2D(this._gl);
        this._normalNoise.initialize(TextureFormats.R32F);
        this._normalNoise.size = [noiseRes, noiseRes];
        this._normalNoise.data = normalNoise(noiseRes * noiseRes);
    }
}
