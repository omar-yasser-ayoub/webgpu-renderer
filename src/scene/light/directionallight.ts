import { Light } from "./light";

export default class DirectionalLight extends Light {
    constructor(direction: Float32Array = new Float32Array([0, -1, 0]), color: Float32Array = new Float32Array([1, 1, 1]), intensity: number = 1.0) {
        super(1, color, intensity);
        this.direction = direction;
    }
}