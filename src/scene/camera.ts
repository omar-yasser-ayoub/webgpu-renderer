import { mat4, type Mat4, type Vec3 } from "wgpu-matrix";
import { SceneObject } from "./sceneobject";

export class Camera extends SceneObject {
    viewMatrix: Mat4;
    projectionMatrix: Mat4;

    constructor(fov: number, aspect: number, near: number, far: number) {
        super();
        this.projectionMatrix = mat4.perspective(fov, aspect, near, far);
        this.viewMatrix = mat4.identity(); // default until lookAt() is called
    }

    lookAt(eye: Vec3, target: Vec3, up: Vec3) {
        this.viewMatrix = mat4.lookAt(eye, target, up);
    }

    getViewProjection(): Mat4 {
        return mat4.multiply(this.projectionMatrix, this.viewMatrix);
    }

    getProjection(): Mat4 {
        return this.projectionMatrix;
    }
    
    getView(): Mat4 {
        return this.viewMatrix;
    }
}