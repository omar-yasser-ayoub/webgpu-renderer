import type { Material } from "./material";
import { mat4, quat, vec3, type Vec3, type Quat, type Mat4 } from 'wgpu-matrix';
export abstract class Mesh {
    vertexBuffer!: GPUBuffer;
    indexBuffer?: GPUBuffer;
    indexCount: number = 0;
    material: Material;
    position: Vec3 = vec3.create(0, 0, 0);
    rotation: Quat = quat.create(0, 0, 0, 1);
    scale: Vec3 = vec3.create(1, 1, 1);

    private modelMatrix = mat4.create();
    private modelMatrixNeedsUpdate = true;
    
    constructor(material: Material) {
        this.material = material;
    }

    markDirty() {
        this.modelMatrixNeedsUpdate = true;
    }

    getModelMatrix(): Mat4 {
        if (this.modelMatrixNeedsUpdate) {
          this.modelMatrixNeedsUpdate = false;
    
          const i = mat4.identity();
    
          const scaled = mat4.scale(i, this.scale);

        //   const rotated = mat4.fromQuat(scaled, this.rotation);
          
        //   console.log(rotated, scaled);
          this.modelMatrix = mat4.translate(scaled, this.position);
        }
        return this.modelMatrix;
    }

    setPosition(position: Vec3) {
        this.position = vec3.clone(position);
        this.markDirty();
    }

    setRotation(rotation: Quat) {
        this.rotation = rotation;
        this.markDirty();
    }

    setScale(scale: Vec3) {
        this.scale = vec3.clone(scale);
        this.markDirty();
    }

    setTransform(position: Vec3, rotation: Quat, scale: Vec3) {
        this.setPosition(position);
        this.setRotation(rotation);
        this.setScale(scale);
    }

    abstract createBuffers(device: GPUDevice): void;

    draw(encoder: GPURenderPassEncoder): void {
        this.material.apply(encoder);
        encoder.setVertexBuffer(0, this.vertexBuffer);
        if (this.indexBuffer) {
            encoder.setIndexBuffer(this.indexBuffer, 'uint16');
            encoder.drawIndexed(this.indexCount);
        } else {
            encoder.draw(this.vertexBuffer.size / 12);
        }
    }
}