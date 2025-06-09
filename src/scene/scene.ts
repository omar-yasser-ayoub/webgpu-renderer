import { Mesh } from './mesh/mesh';
import { Camera } from './camera';
import { mat4 } from 'wgpu-matrix';
export class Scene {
    meshes: Mesh[] = [];
    add(mesh: Mesh) { this.meshes.push(mesh); }

    render(passEncoder: GPURenderPassEncoder, camera: Camera, device: GPUDevice) {
      const vpMatrix = camera.getViewProjection();
  
      for (const mesh of this.meshes) {
        const modelMatrix = mesh.getModelMatrix();
        const mvpMatrix = mat4.multiply(vpMatrix, modelMatrix);
        mesh.updateUniforms(device, mvpMatrix);
        mesh.draw(passEncoder);
      }
    }
}