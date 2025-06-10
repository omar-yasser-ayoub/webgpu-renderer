import { SceneObject } from "../sceneobject";
import { type Vec4 } from 'wgpu-matrix';

export abstract class Light extends SceneObject {
    //Structure in buffer
    // struct Light {
    //     lightType: u32,
    //     position: vec3<f32>,
    //     direction: vec3<f32>,
    //     range: f32,
    //     color: vec3<f32>,
    //     intensity: f32,
    //     _padding: f32,
    // };

    type: number; // 0: Point, 1: Directional, 2: Ambient
    color: Vec4;
    intensity: number;

    constructor(type: number, color: Vec4 = new Float32Array([1, 1, 1, 1]), intensity: number = 1.0) {
        super();
        this.type = type; // 0: Point, 1: Directional, 2: Spot
        this.color = color;
        this.intensity = intensity;
    }
}