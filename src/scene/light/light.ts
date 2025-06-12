import { SceneObject } from "../sceneobject";
import { type Vec3, type Vec4 } from 'wgpu-matrix';

export abstract class Light extends SceneObject {
    type: number; // 0: Point, 1: Directional, 2: Ambient
    color: Vec4;
    intensity: number;
    position!: Float32Array;
    range!: number;
    direction!: Float32Array;

    constructor(type: number, color: Vec4 = new Float32Array([1, 1, 1, 1]), intensity: number = 1.0) {
        super();
        this.type = type; // 0: Point, 1: Directional, 2: Spot
        this.color = color;
        this.intensity = intensity;
    }
    setColor(color: Vec4): void {
        this.color = color;
    }
    getColor(): Vec4 {
        return this.color;
    }

    setIntensity(intensity: number): void {
        this.intensity = intensity;
    }
    getIntensity(): number {
        return this.intensity;
    }

}