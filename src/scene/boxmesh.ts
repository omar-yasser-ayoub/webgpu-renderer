import { Mesh } from "./mesh";

export class BoxMesh extends Mesh {
    constructor(device: GPUDevice, material: any) {
        super(device, material);
        this.createBuffers(device);
    }

    createBuffers(device: GPUDevice): void {
        const vertices = new Float32Array([
            // Front face
            -0.5, -0.5,  0.5,  // 0
             0.5, -0.5,  0.5,  // 1
             0.5,  0.5,  0.5,  // 2
            -0.5,  0.5,  0.5,  // 3

            // Back face
             0.5, -0.5, -0.5,  // 4
            -0.5, -0.5, -0.5,  // 5
            -0.5,  0.5, -0.5,  // 6
             0.5,  0.5, -0.5,  // 7

            // Left face
            -0.5, -0.5, -0.5,  // 8
            -0.5, -0.5,  0.5,  // 9
            -0.5,  0.5,  0.5,  // 10
            -0.5,  0.5, -0.5,  // 11

            // Right face
             0.5, -0.5,  0.5,  // 12
             0.5, -0.5, -0.5,  // 13
             0.5,  0.5, -0.5,  // 14
             0.5,  0.5,  0.5,  // 15

            // Top face
            -0.5,  0.5,  0.5,  // 16
             0.5,  0.5,  0.5,  // 17
             0.5,  0.5, -0.5,  // 18
            -0.5,  0.5, -0.5,  // 19

            // Bottom face
            -0.5, -0.5, -0.5,  // 20
             0.5, -0.5, -0.5,  // 21
             0.5, -0.5,  0.5,  // 22
            -0.5, -0.5,  0.5,  // 23
        ]);

        const indices = new Uint16Array([
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
}