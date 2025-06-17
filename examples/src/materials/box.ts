import { mat4, vec3 } from 'gl-matrix';

export function createBox(transform: mat4) {
    const corners = [
        vec3.fromValues(-1, -1, -1), // 0
        vec3.fromValues(-1, -1, 1), // 1
        vec3.fromValues(-1, 1, -1), // 2
        vec3.fromValues(-1, 1, 1), // 3
        vec3.fromValues(1, -1, -1), // 4
        vec3.fromValues(1, -1, 1), // 5
        vec3.fromValues(1, 1, -1), // 6
        vec3.fromValues(1, 1, 1), // 7
    ];

    for (const corner of corners) {
        vec3.transformMat4(corner, corner, transform);
    }

    const center = vec3.transformMat4(vec3.create(), [0, 0, 0], transform);

    const normals = [
        vec3.fromValues(0, 0, -1),
        vec3.fromValues(0, 0, 1),
        vec3.fromValues(0, -1, 0),
        vec3.fromValues(0, 1, 0),
        vec3.fromValues(-1, 0, 0),
        vec3.fromValues(1, 0, 0),
    ];

    for (const normal of normals) {
        vec3.transformMat4(normal, normal, transform);
        vec3.sub(normal, normal, center);
        vec3.normalize(normal, normal);
    }

    const positionArray = new Float32Array([
        // left
        ...corners[0], ...corners[1], ...corners[3],
        ...corners[3], ...corners[2], ...corners[0],
        // right
        ...corners[5], ...corners[4], ...corners[6],
        ...corners[6], ...corners[7], ...corners[5],
        // top
        ...corners[3], ...corners[7], ...corners[6],
        ...corners[6], ...corners[2], ...corners[3],
        // bottom
        ...corners[0], ...corners[4], ...corners[5],
        ...corners[5], ...corners[1], ...corners[0],
        // front
        ...corners[1], ...corners[5], ...corners[7],
        ...corners[7], ...corners[3], ...corners[1],
        // back
        ...corners[4], ...corners[0], ...corners[2],
        ...corners[2], ...corners[6], ...corners[4],
    ]);

    const normalArray = new Float32Array([
        ...normals[4], ...normals[4], ...normals[4], ...normals[4], ...normals[4], ...normals[4],
        ...normals[5], ...normals[5], ...normals[5], ...normals[5], ...normals[5], ...normals[5],
        ...normals[3], ...normals[3], ...normals[3], ...normals[3], ...normals[3], ...normals[3],
        ...normals[2], ...normals[2], ...normals[2], ...normals[2], ...normals[2], ...normals[2],
        ...normals[1], ...normals[1], ...normals[1], ...normals[1], ...normals[1], ...normals[1],
        ...normals[0], ...normals[0], ...normals[0], ...normals[0], ...normals[0], ...normals[0],
    ]);

    return {
        positions: positionArray,
        normals: normalArray,
    };
}
