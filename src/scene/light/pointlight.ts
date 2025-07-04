import { Light } from "./light";

export class PointLight extends Light {
    constructor(position: Float32Array = new Float32Array([0, 0, 0]), color: Float32Array = new Float32Array([1, 1, 1]), intensity: number = 1.0, range: number = 10.0) {
        super(0, color, intensity);
        this.position = position;
        this.range = range;
    }
    
    getPosition(): Float32Array {
        return this.position;
    }
    getRange(): number {
        return this.range;
    }
    setPosition(position: Float32Array): void {
        this.position = position;
    }
    setRange(range: number): void {
        this.range = range;
    }
}