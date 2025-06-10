import { FlatShadingMaterial } from "../material/flatShadingMaterial";
import type { Material } from "../material/material";
import { SmoothShadingMaterial } from "../material/smoothShadingMaterial";
import { Mesh } from "./mesh";

enum ShadingType {
    NONE = 'none',
    FLAT = 'flat',
    SMOOTH = 'smooth'
}
export class BoxMesh extends Mesh {
    shading: ShadingType = ShadingType.NONE;
    
    constructor(device: GPUDevice, material: Material) {
        super(device, material);
        this.shading = ShadingType.SMOOTH;
        if (material instanceof FlatShadingMaterial) {
            this.shading = ShadingType.FLAT;
        }
        if (material instanceof SmoothShadingMaterial) {
            this.shading = ShadingType.SMOOTH;
        }

        this.createBuffers(device);
    }

    // For refernce, vertex array is defined as follows:
    // vec3 vertices -> 16 bytes (4 bytes per float)
    // vec3 normals -> 16 bytes (4 bytes per float)
    // vec2 uvs -> 8 bytes (4 bytes per float)
    // total: 40 bytes per vertex

    createBuffers(device: GPUDevice): void {        
        let vertices: Float32Array;
        let indices: Uint16Array;
        
        if (this.shading == ShadingType.FLAT || this.shading == ShadingType.NONE) {
            vertices = new Float32Array([
                // Front face
                -0.5, -0.5,  0.5, 0.0,       0, 0, 1, 0,       0, 0,  // 0
                0.5,  -0.5,  0.5, 0.0,       0, 0, 1, 0,       0, 0,  // 1
                0.5,   0.5,  0.5, 0.0,       0, 0, 1, 0,       0, 0,  // 2
                -0.5,  0.5,  0.5, 0.0,       0, 0, 1, 0,       0, 0,  // 3
    
                // Back face
                0.5,  -0.5, -0.5, 0.0,       0, 0, -1, 0,       0, 0,  // 4
                -0.5, -0.5, -0.5, 0.0,       0, 0, -1, 0,       0, 0,  // 5
                -0.5,  0.5, -0.5, 0.0,       0, 0, -1, 0,       0, 0,  // 6
                0.5,   0.5, -0.5, 0.0,       0, 0, -1, 0,       0, 0,  // 7
    
                // Left face
                -0.5, -0.5, -0.5, 0.0,       -1, 0, 0, 0,       0, 0,  // 8
                -0.5, -0.5,  0.5, 0.0,       -1, 0, 0, 0,       0, 0,  // 9
                -0.5,  0.5,  0.5, 0.0,       -1, 0, 0, 0,       0, 0,  // 10
                -0.5,  0.5, -0.5, 0.0,       -1, 0, 0, 0,       0, 0,  // 11
    
                // Right face
                0.5, -0.5,  0.5, 0.0,        1, 0, 0, 0,       0, 0,  // 12
                0.5, -0.5, -0.5, 0.0,        1, 0, 0, 0,       0, 0,  // 13
                0.5,  0.5, -0.5, 0.0,        1, 0, 0, 0,       0, 0,  // 14
                0.5,  0.5,  0.5, 0.0,        1, 0, 0, 0,       0, 0,  // 15
    
                // Top face
                -0.5,  0.5,  0.5, 0.0,       0, 1, 0, 0,       0, 0,  // 16
                0.5,   0.5,  0.5, 0.0,       0, 1, 0, 0,       0, 0,  // 17
                0.5,   0.5, -0.5, 0.0,       0, 1, 0, 0,       0, 0,  // 18
                -0.5,  0.5, -0.5, 0.0,       0, 1, 0, 0,       0, 0,  // 19
    
                // Bottom face
                -0.5, -0.5, -0.5, 0.0,       0, -1, 0, 0,       0, 0,  // 20
                0.5,  -0.5, -0.5, 0.0,       0, -1, 0, 0,       0, 0,  // 21
                0.5,  -0.5,  0.5, 0.0,       0, -1, 0, 0,       0, 0,  // 22
                -0.5, -0.5,  0.5, 0.0,       0, -1, 0, 0,       0, 0   // 23
            ]);
    
            indices = new Uint16Array([
                0,  1,  2,   0,  2,  3,   // Front
                4,  5,  6,   4,  6,  7,   // Back
                8,  9,  10,  8,  10, 11,  // Left
                12, 13, 14,  12, 14, 15,  // Right
                16, 17, 18,  16, 18, 19,  // Top
                20, 21, 22,  20, 22, 23   // Bottom
            ]);
            this.indexCount = indices.length;

            this.vertexBuffer = device.createBuffer({
                size: vertices.byteLength,
                usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
                mappedAtCreation: true
            });

            new Float32Array(this.vertexBuffer.getMappedRange()).set(vertices);
            this.vertexBuffer.unmap();

            this.indexBuffer = device.createBuffer({
                size: indices.byteLength,
                usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
                mappedAtCreation: true
            });
            new Uint16Array(this.indexBuffer.getMappedRange()).set(indices);
            this.indexBuffer.unmap();
        }

        if (this.shading == ShadingType.SMOOTH) {
            const sqrt3 = Math.sqrt(3);
            vertices = new Float32Array([

                -0.5, -0.5,  0.5, 0.0,       -1 / sqrt3, -1 / sqrt3, 1 / sqrt3, 0,       0, 0,  // 0
                0.5,  -0.5,  0.5, 0.0,       1 / sqrt3, -1 / sqrt3, 1 / sqrt3, 0,       0, 0,  // 1
                0.5,   0.5,  0.5, 0.0,       1 / sqrt3, 1 / sqrt3, 1 / sqrt3, 0,       0, 0,  // 2
                -0.5,  0.5,  0.5, 0.0,       -1 / sqrt3, 1 / sqrt3, 1 / sqrt3, 0,       0, 0,  // 3
    
                // Back face
                -0.5, -0.5,  -0.5, 0.0,       -1 / sqrt3, -1 / sqrt3, -1 / sqrt3, 0,       0, 0,  // 0
                0.5,  -0.5,  -0.5, 0.0,       1 / sqrt3, -1 / sqrt3, -1 / sqrt3, 0,       0, 0,  // 1
                0.5,   0.5,  -0.5, 0.0,       1 / sqrt3, 1 / sqrt3, -1 / sqrt3, 0,       0, 0,  // 2
                -0.5,  0.5,  -0.5, 0.0,       -1 / sqrt3, 1 / sqrt3, -1 / sqrt3, 0,       0, 0,  // 3
            ]);
    
            indices = new Uint16Array([
                // Front face (z = +0.5)
                0, 1, 2,
                0, 2, 3,
            
                // Right face (x = +0.5)
                1, 5, 6,
                1, 6, 2,
            
                // Back face (z = -0.5)
                5, 4, 7,
                5, 7, 6,
            
                // Left face (x = -0.5)
                4, 0, 3,
                4, 3, 7,
            
                // Top face (y = +0.5)
                3, 2, 6,
                3, 6, 7,
            
                // Bottom face (y = -0.5)
                4, 5, 1,
                4, 1, 0,
            ]);

            this.indexCount = indices.length;

            this.vertexBuffer = device.createBuffer({
                size: vertices.byteLength,
                usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
                mappedAtCreation: true
            });

            new Float32Array(this.vertexBuffer.getMappedRange()).set(vertices);
            this.vertexBuffer.unmap();

            this.indexBuffer = device.createBuffer({
                size: indices.byteLength,
                usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
                mappedAtCreation: true
            });
            new Uint16Array(this.indexBuffer.getMappedRange()).set(indices);
            this.indexBuffer.unmap();
        }   
    }
}