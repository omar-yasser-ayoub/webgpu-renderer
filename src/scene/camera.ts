import { mat4, type Mat4, type Vec3 } from "wgpu-matrix";

export class Camera {
    viewMatrix: Mat4;
    projectionMatrix: Mat4;

    constructor(fov: number, aspect: number, near: number, far: number) {
        this.projectionMatrix = mat4.perspective(fov, aspect, near, far);
        this.viewMatrix = mat4.identity(); // default until lookAt() is called
    }

    lookAt(eye: Vec3, target: Vec3, up: Vec3) {
        this.viewMatrix = mat4.lookAt(eye, target, up);
    }

    getViewProjection(): Mat4 {
        return mat4.multiply(this.projectionMatrix, this.viewMatrix);
    }
}