import { Mesh } from './mesh';
import { Camera } from './camera';
export class Scene {
    meshes: Mesh[] = [];
    add(mesh: Mesh) { this.meshes.push(mesh); }

    render(passEncoder: GPURenderPassEncoder, camera: Camera, device: GPUDevice) {
        const vpMatrix = camera.getViewProjection();
    
        for (const mesh of this.meshes) {
          mesh.material.update(device, vpMatrix);
          mesh.draw(passEncoder);
        }
      }
}