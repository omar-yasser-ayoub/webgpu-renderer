import { Mesh } from './mesh/mesh';
import { Camera } from './camera';
import { mat4 } from 'wgpu-matrix';
import { SceneObject } from './sceneobject';
export class Scene {
    meshes: Mesh[] = [];
    camera!: Camera;
    add(object: SceneObject) { 
      if (object instanceof Camera) {
        this.camera = object;
        return;
      }
      if (object instanceof Mesh) {
        this.meshes.push(object); 
      }
    }

    render(passEncoder: GPURenderPassEncoder, device: GPUDevice) {
      if (!this.camera) {
        console.error('Camera not set in scene');
        return;
      }
      const vpMatrix = this.camera.getViewProjection();
  
      for (const mesh of this.meshes) {
        const modelMatrix = mesh.getModelMatrix();
        const mvpMatrix = mat4.multiply(vpMatrix, modelMatrix);
        mesh.updateUniforms(device, mvpMatrix);
        mesh.draw(passEncoder);
      }
    }
}