import { mat4 } from 'gl-matrix';

export type CameraMatrices = {
    view: mat4;
    projection: mat4;
    viewProjection: mat4;
    viewInverse: mat4;
    projectionInverse: mat4;
    viewProjectionInverse: mat4;
};

export interface CameraListenerPass {
    cameraChanged(m: CameraMatrices): void;
}

export function isCameraListenerPass(obj: object): obj is CameraListenerPass {
    return 'cameraChanged' in obj;
}
