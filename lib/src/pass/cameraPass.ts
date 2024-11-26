import { mat4 } from 'gl-matrix';

export type CameraMatrices = {
    view: mat4;
    projection: mat4;
    viewProjection: mat4;
    viewInverse: mat4;
    projectionInverse: mat4;
    viewProjectionInverse: mat4;
};

export interface CameraPass {
    set cameraMatrices(m: CameraMatrices);
}

export function isCameraPass(obj: object): obj is CameraPass {
    return 'cameraMatrices' in obj;
}
