import { Renderer as BaseRenderer, CanvasFramebuffer } from '@lukaswagner/webgl-toolkit';
import { mat4, quat, vec3 } from 'gl-matrix';
import { Material, Mesh, MeshPass } from './meshPass';
import { createBox } from './box';

export class Renderer extends BaseRenderer {
    protected static _gridSize = 5;

    public initialize(): void {
        const canvasFbo = new CanvasFramebuffer(this._gl);
        this._framebuffers.push(canvasFbo);

        const materials = this._generateMaterials();
        const meshes = this._generateMeshes(Renderer._gridSize, materials.length);

        const meshPass = new MeshPass(this._gl, 'Mesh');
        meshPass.initialize();
        meshPass.target = canvasFbo;
        meshPass.model = mat4.create();
        meshPass.materials = materials;
        meshPass.meshes = meshes;
        this._passes.push(meshPass);

        this._gl.enable(this._gl.DEPTH_TEST);
        this._gl.enable(this._gl.CULL_FACE);

        super.initialize();
    }

    protected _generateMeshes(gridSize: number, matCount: number): Mesh[] {
        const result = new Array<Mesh>();
        const offset = (gridSize - 1) / 2;

        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const mat = mat4.fromRotationTranslationScale(
                    mat4.create(),
                    quat.create(),
                    [x - offset, y - offset, 0],
                    [0.4, 0.4, 0.4],
                );
                const box = createBox(mat);
                const mesh: Mesh = {
                    positions: box.positions,
                    normals: box.normals,
                    material: (x + y) % matCount,
                };
                result.push(mesh);
            }
        }

        return result;
    }

    protected _generateMaterials(): Material[] {
        const colors = [0b001, 0b011, 0b010, 0b110, 0b100, 0b101];
        const bitsToVec = (bits: number) => vec3.fromValues(
            +((bits & 0b001) > 0), +((bits & 0b010) > 0), +((bits & 0b100) > 0));
        return colors.map((c) => {
            return {
                ambient: bitsToVec(c),
                diffuse: bitsToVec(c),
                specular: bitsToVec(0b111),
                shininess: 64,
            };
        });
    }
}
