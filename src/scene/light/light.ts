import { SceneObject } from "../sceneobject";
import { type Vec4 } from 'wgpu-matrix';

export abstract class Light extends SceneObject {
    //Structure in buffer
    // struct Light {
    //     position: vec3<f32>, //12 bytes
    //     range: f32, //4 bytes
    //     direction: vec3<f32>, //12 bytes
    //     intensity: f32, // 4 bytes
    //     color: vec3<f32>, // 12 bytes
    //     lightType: u32, //4 bytes
    // };

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
}