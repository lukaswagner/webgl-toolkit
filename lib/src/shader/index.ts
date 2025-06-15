export * from './defines';
export * from './program';
export * from './uniformBlock';
export const accumulateFrag = require('./accumulate.frag') as string;
export const fullscreenFrag = require('./fullscreen.frag') as string;
export const fullscreenVert = require('./fullscreen.vert') as string;
