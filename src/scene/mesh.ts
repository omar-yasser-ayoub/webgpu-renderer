import type { Material } from "./material";

export abstract class Mesh {
    vertexBuffer!: GPUBuffer;
    indexBuffer?: GPUBuffer;
    indexCount: number = 0;
    material: Material;

    constructor(material: Material) {
        this.material = material;
    }

    abstract createBuffers(device: GPUDevice): void;

    draw(encoder: GPURenderPassEncoder): void {
        encoder.setPipeline(this.material.pipeline.pipeline);
        encoder.setBindGroup(0, this.material.bindGroups[0]);
        encoder.setVertexBuffer(0, this.vertexBuffer);
        if (this.indexBuffer) {
            encoder.setIndexBuffer(this.indexBuffer, 'uint16');
            encoder.drawIndexed(this.indexCount);
        } else {
            encoder.draw(this.vertexBuffer.size / 12);
        }
    }
}