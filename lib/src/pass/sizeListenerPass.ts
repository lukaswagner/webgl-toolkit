import { vec2 } from 'gl-matrix';

export interface SizeListenerPass {
    sizeChanged(size: vec2): void;
}

export function isSizeListenerPass(obj: object): obj is SizeListenerPass {
    return 'sizeChanged' in obj;
}
