export type SingleSetParam = number | boolean;
export type SingleSetFunc = (loc: WebGLUniformLocation, ...v: SingleSetParam[]) => void;
export type MultiSetParam = ArrayBufferView | Array<number>;
export type MultiSetFunc = (loc: WebGLUniformLocation, v: MultiSetParam) => void;
export type UniformSetFuncMap = Map<number, [SingleSetFunc, MultiSetFunc]>;

function noTranspose(
    fn: (location: WebGLUniformLocation, transpose: GLboolean, data: MultiSetParam) => void,
): MultiSetFunc {
    return (function (location: WebGLUniformLocation, data: MultiSetParam) {
        fn(location, false, data);
    });
}

export function getUniformSetFuncMap(gl: WebGL2RenderingContext): UniformSetFuncMap {
    const u1i = gl.uniform1i.bind(gl) as typeof gl.uniform1i;
    const u1iv = gl.uniform1iv.bind(gl) as typeof gl.uniform1iv;
    const u2i = gl.uniform2i.bind(gl) as typeof gl.uniform2i;
    const u2iv = gl.uniform2iv.bind(gl) as typeof gl.uniform2iv;
    const u3i = gl.uniform3i.bind(gl) as typeof gl.uniform3i;
    const u3iv = gl.uniform3iv.bind(gl) as typeof gl.uniform3iv;
    const u4i = gl.uniform4i.bind(gl) as typeof gl.uniform4i;
    const u4iv = gl.uniform4iv.bind(gl) as typeof gl.uniform4iv;
    const um2 = noTranspose(gl.uniformMatrix2fv.bind(gl) as typeof gl.uniformMatrix2fv);
    const um3 = noTranspose(gl.uniformMatrix3fv.bind(gl) as typeof gl.uniformMatrix3fv);
    const um4 = noTranspose(gl.uniformMatrix4fv.bind(gl) as typeof gl.uniformMatrix4fv);
    const um23 = noTranspose(gl.uniformMatrix2x3fv.bind(gl) as typeof gl.uniformMatrix2x3fv);
    const um24 = noTranspose(gl.uniformMatrix2x4fv.bind(gl) as typeof gl.uniformMatrix2x4fv);
    const um32 = noTranspose(gl.uniformMatrix3x2fv.bind(gl) as typeof gl.uniformMatrix3x2fv);
    const um34 = noTranspose(gl.uniformMatrix3x4fv.bind(gl) as typeof gl.uniformMatrix3x4fv);
    const um42 = noTranspose(gl.uniformMatrix4x2fv.bind(gl) as typeof gl.uniformMatrix4x2fv);
    const um43 = noTranspose(gl.uniformMatrix4x3fv.bind(gl) as typeof gl.uniformMatrix4x3fv);

    return new Map<number, [SingleSetFunc, MultiSetFunc]>([
        // float
        [gl.FLOAT, [gl.uniform1f.bind(gl), gl.uniform1fv.bind(gl)]],
        [gl.FLOAT_VEC2, [gl.uniform2f.bind(gl), gl.uniform2fv.bind(gl)]],
        [gl.FLOAT_VEC3, [gl.uniform3f.bind(gl), gl.uniform3fv.bind(gl)]],
        [gl.FLOAT_VEC4, [gl.uniform4f.bind(gl), gl.uniform4fv.bind(gl)]],
        // int
        [gl.INT, [u1i, u1iv]],
        [gl.INT_VEC2, [u2i, u2iv]],
        [gl.INT_VEC3, [u3i, u3iv]],
        [gl.INT_VEC4, [u4i, u4iv]],
        // uint
        [gl.UNSIGNED_INT, [gl.uniform1ui.bind(gl), gl.uniform1uiv.bind(gl)]],
        [gl.UNSIGNED_INT_VEC2, [gl.uniform2ui.bind(gl), gl.uniform2uiv.bind(gl)]],
        [gl.UNSIGNED_INT_VEC3, [gl.uniform3ui.bind(gl), gl.uniform3uiv.bind(gl)]],
        [gl.UNSIGNED_INT_VEC4, [gl.uniform4ui.bind(gl), gl.uniform4uiv.bind(gl)]],
        // bool
        [gl.BOOL, [u1i, u1iv]],
        [gl.BOOL_VEC2, [u2i, u2iv]],
        [gl.BOOL_VEC3, [u3i, u3iv]],
        [gl.BOOL_VEC4, [u4i, u4iv]],
        // matrices
        [gl.FLOAT_MAT2, [undefined, um2]],
        [gl.FLOAT_MAT3, [undefined, um3]],
        [gl.FLOAT_MAT4, [undefined, um4]],
        [gl.FLOAT_MAT2x3, [undefined, um23]],
        [gl.FLOAT_MAT2x4, [undefined, um24]],
        [gl.FLOAT_MAT3x2, [undefined, um32]],
        [gl.FLOAT_MAT3x4, [undefined, um34]],
        [gl.FLOAT_MAT4x2, [undefined, um42]],
        [gl.FLOAT_MAT4x3, [undefined, um43]],
        // texture samplers
        [gl.SAMPLER_2D, [u1i, u1iv]],
        [gl.SAMPLER_CUBE, [u1i, u1iv]],
        [gl.SAMPLER_3D, [u1i, u1iv]],
        [gl.SAMPLER_2D_SHADOW, [u1i, u1iv]],
        [gl.SAMPLER_2D_ARRAY, [u1i, u1iv]],
        [gl.SAMPLER_2D_ARRAY_SHADOW, [u1i, u1iv]],
        [gl.SAMPLER_CUBE_SHADOW, [u1i, u1iv]],
        [gl.INT_SAMPLER_2D, [u1i, u1iv]],
        [gl.INT_SAMPLER_3D, [u1i, u1iv]],
        [gl.INT_SAMPLER_CUBE, [u1i, u1iv]],
        [gl.INT_SAMPLER_2D_ARRAY, [u1i, u1iv]],
        [gl.UNSIGNED_INT_SAMPLER_2D, [u1i, u1iv]],
        [gl.UNSIGNED_INT_SAMPLER_3D, [u1i, u1iv]],
        [gl.UNSIGNED_INT_SAMPLER_CUBE, [u1i, u1iv]],
        [gl.UNSIGNED_INT_SAMPLER_2D_ARRAY, [u1i, u1iv]],
    ]);
}
