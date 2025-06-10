import { Mesh } from './mesh/mesh';
import { Camera } from './camera';
import { mat4 } from 'wgpu-matrix';
import { SceneObject } from './sceneobject';
import { Light } from './light/light';
export class Scene {
    meshes: Mesh[] = [];
    camera!: Camera;
    lights: Light[] = [];
    lightUniformBuffer!: GPUBuffer;
    lightBindGroupLayout!: GPUBindGroupLayout;
    lightBindGroup!: GPUBindGroup;
    MAX_LIGHTS = 64;


    constructor(device: GPUDevice) {
      this.lightUniformBuffer = device.createBuffer({
        size: 80 * this.MAX_LIGHTS, // 80 bytes per light (struct size)
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });
      this.lightBindGroupLayout = device.createBindGroupLayout({
        entries: [
          {
            binding: 0,
            visibility: GPUShaderStage.FRAGMENT,
            buffer: { type: 'uniform' },
          },
        ],
      });
      this.lightBindGroup = device.createBindGroup({
        layout: this.lightBindGroupLayout,
        entries: [
          {
            binding: 0,
            resource: {
              buffer: this.lightUniformBuffer,
            },
          },
        ],
      });
    }
    
    add(object: SceneObject) { 
      if (object instanceof Camera) {
        this.camera = object;
        return;
      }
      if (object instanceof Mesh) {
        this.meshes.push(object); 
      }
      if (object instanceof Light) {
        this.lights.push(object);
      }
    }

    render(passEncoder: GPURenderPassEncoder, device: GPUDevice) {
      if (!this.camera) {
        console.error('Camera not set in scene');
        return;
      }
      const vpMatrix = this.camera.getViewProjection();
      passEncoder.setBindGroup(2, this.lightBindGroup);
  
      for (const mesh of this.meshes) {
        const modelMatrix = mesh.getModelMatrix();
        const mvpMatrix = mat4.multiply(vpMatrix, modelMatrix);
        mesh.updateUniforms(device, mvpMatrix);
        mesh.draw(passEncoder);
      }
    }
}