import { Light } from "./light";

export class AmbientLight extends Light {
    constructor(color: Float32Array = new Float32Array([1, 1, 1]), intensity: number = 1.0) {
        super(2, color, intensity);
    }
}