import type { Material } from "../material/material";
import { mat4, quat, vec3, type Vec3, type Quat, type Mat4, type Mat3 } from 'wgpu-matrix';
import { SceneObject } from "../sceneobject";
export abstract class Mesh extends SceneObject {
    vertexBuffer!: GPUBuffer;
    indexBuffer?: GPUBuffer;
    uniformBuffer: GPUBuffer;
    bindGroup: GPUBindGroup;
    bindGroupLayout: GPUBindGroupLayout;
    indexCount: number = 0;
    material: Material;
    position: Vec3 = vec3.create(0, 0, 0);
    rotation: Quat = quat.create(0, 0, 0, 1);
    scale: Vec3 = vec3.create(1, 1, 1);

    private modelMatrix = mat4.create();
    private modelMatrixNeedsUpdate = true;
    
    constructor(device: GPUDevice, material: Material) {
        super();
        this.uniformBuffer = device.createBuffer({
            size: 64 * 4, // 192 bytes for a 4x4 matrix (16 floats) * 3 matrices (model, view, projection, normal)
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })

        this.bindGroupLayout = device.createBindGroupLayout({
            label: 'Mesh Bind Group  Layout',
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: { type: 'uniform' },
                },
            ],
        });

        this.bindGroup = device.createBindGroup({  
            layout: this.bindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.uniformBuffer,
                    },
                },
            ],
        });

        this.material = material;
    }

    updateUniforms(device: GPUDevice, modelMatrix: Mat4, viewMatrix: Mat4, projectionMatrix: Mat4, normalMatrix: Mat3) {
        device.queue.writeBuffer(this.uniformBuffer, 0, modelMatrix.buffer, modelMatrix.byteOffset, modelMatrix.byteLength);
        device.queue.writeBuffer(this.uniformBuffer, 64, viewMatrix.buffer, viewMatrix.byteOffset, viewMatrix.byteLength);
        device.queue.writeBuffer(this.uniformBuffer, 128, projectionMatrix.buffer, projectionMatrix.byteOffset, projectionMatrix.byteLength);
        device.queue.writeBuffer(this.uniformBuffer, 192, normalMatrix.buffer, normalMatrix.byteOffset, normalMatrix.byteLength);
    }

    markDirty() {
        this.modelMatrixNeedsUpdate = true;
    }

    getModelMatrix(): Mat4 {
        if (this.modelMatrixNeedsUpdate) {
          this.modelMatrixNeedsUpdate = false;
    
          const scale = mat4.scale(mat4.identity(), this.scale);

          const rotate = mat4.multiply(mat4.fromQuat(this.rotation), mat4.identity());

          const translate = mat4.translate(mat4.identity(), this.position);

          const tmpmat = mat4.multiply(rotate, scale);

          const modelmat = mat4.multiply(translate, tmpmat);

          this.modelMatrix = modelmat;
        }
        return this.modelMatrix;
    }

    setPosition(position: Vec3) {
        this.position = vec3.clone(position);
        this.markDirty();
    }

    setRotation(rotation: Vec3) {
        this.rotation = quat.fromEuler(
            rotation[0] * Math.PI / 180,
            rotation[1] * Math.PI / 180,
            rotation[2] * Math.PI / 180,
            "yxz"
        );
    
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
        encoder.setBindGroup(0, this.bindGroup);
        encoder.setVertexBuffer(0, this.vertexBuffer);
        if (this.indexBuffer) {
            encoder.setIndexBuffer(this.indexBuffer, 'uint16');
            encoder.drawIndexed(this.indexCount);
        } else {
            encoder.draw(this.vertexBuffer.size / 12);
        }
    }
}