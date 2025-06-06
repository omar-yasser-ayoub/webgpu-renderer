import { mat4, type Vec3, type Vec4 } from "wgpu-matrix";
export class Camera {
    viewMatrix: Vec4 = mat4.create();
    projectionMatrix: Vec4 = mat4.create();
    
    constructor(fov: number, aspect: number, near: number, far: number) {
        mat4.perspective(fov, aspect, near, far, this.projectionMatrix);
    }

    lookAt(eye: Vec3, target: Vec3, up: Vec3) {
        mat4.lookAt(eye, target, up, this.viewMatrix);
    }
  }
  