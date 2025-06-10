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

    updateLightBuffer(device: GPUDevice) {
      const lightSize = 20; // 20 floats per light (80 bytes)
      const data = new Float32Array(this.MAX_LIGHTS * lightSize);
    
      for (let i = 0; i < this.lights.length && i < this.MAX_LIGHTS; i++) {
        const light = this.lights[i];
        const offset = i * lightSize;
    
        const position = light.position ?? new Float32Array([0, 0, 0]);
        const direction = light.direction ?? new Float32Array([0, -1, 0]);
        const color = light.color ?? [1, 1, 1, 1];
        const range = light.range ?? 0;
        const type = light.type ?? 0;
        const intensity = light.intensity ?? 1;
    
        // vec3 position + f32 range
        data[offset + 0] = position[0];
        data[offset + 1] = position[1];
        data[offset + 2] = position[2];
        data[offset + 3] = 0;
    
        // vec3 direction + f32 (padding)
        data[offset + 4] = direction[0];
        data[offset + 5] = direction[1];
        data[offset + 6] = direction[2];
        data[offset + 7] = 0;
    
        // vec3 color + f32 (padding)
        data[offset + 8]  = color[0];
        data[offset + 9]  = color[1];
        data[offset + 10] = color[2];
        data[offset + 11] = 0;
    
        // range, type, intensity, padding
        data[offset + 12] = range;
        data[offset + 13] = type;
        data[offset + 14] = intensity;
        data[offset + 15] = 0;
    
        // Extra padding or metadata
        data[offset + 16] = 0;
        data[offset + 17] = 0;
        data[offset + 18] = 0;
        data[offset + 19] = 0;
      }
    
      device.queue.writeBuffer(
        this.lightUniformBuffer,
        0,
        data.buffer,
        data.byteOffset,
        data.byteLength
      );
    }
    

    render(passEncoder: GPURenderPassEncoder, device: GPUDevice) {
      if (!this.camera) {
        console.error('Camera not set in scene');
        return;
      }
      const vpMatrix = this.camera.getViewProjection();
      this.updateLightBuffer(device);
      passEncoder.setBindGroup(2, this.lightBindGroup);
  
      for (const mesh of this.meshes) {
        const modelMatrix = mesh.getModelMatrix();
        const mvpMatrix = mat4.multiply(vpMatrix, modelMatrix);
        mesh.updateUniforms(device, mvpMatrix);
        mesh.draw(passEncoder);
      }
    }
}