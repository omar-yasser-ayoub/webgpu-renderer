import { FlatShadingMaterial } from "../material/flatShadingMaterial";
import type { Material } from "../material/material";
import { SmoothShadingMaterial } from "../material/smoothShadingMaterial";
import { Mesh } from "./mesh";

enum ShadingType {
    NONE = 'none',
    FLAT = 'flat',
    SMOOTH = 'smooth'
}
export class SphereMesh extends Mesh {
    shading: ShadingType = ShadingType.NONE;
    lat: number;
    long: number;
    radius: number;
    
    constructor(device: GPUDevice, material: Material, lat: number = 12, long: number = 12, radius: number = 0.5) {
        super(device, material);
        this.lat = lat;
        this.long = long;
        this.radius = radius;
        
        if (material instanceof FlatShadingMaterial) {
            this.shading = ShadingType.FLAT;
        }
        if (material instanceof SmoothShadingMaterial) {
            this.shading = ShadingType.SMOOTH;
        }

        this.createBuffers(device);
    }

    // For refernce, vertex array is defined as follows:
    // vec3 vertices -> 16 bytes (4 bytes per float)
    // vec3 normals -> 16 bytes (4 bytes per float)
    // vec2 uvs -> 8 bytes (4 bytes per float)
    // total: 40 bytes per vertex

    createBuffers(device: GPUDevice): void {        
        const vertices: number[] = [];
        const indices: number[] = [];

        for (let lat = 0; lat <= this.lat; lat++) {
            const theta = lat / this.lat * Math.PI;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);
            for (let long = 0; long <= this.long; long++) {
                const phi = long / this.long * 2 * Math.PI;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                const x = this.radius * cosPhi * sinTheta;
                const y = this.radius * cosTheta;
                const z = this.radius * sinPhi * sinTheta;

                vertices.push(x, y, z, 0.0,)  // position
                vertices.push(cosPhi * sinTheta, cosTheta, sinPhi * sinTheta, 0.0); // normal
                vertices.push(long / this.long, lat / this.lat); // uv
            }
        }

        for (let lat = 0; lat < this.lat; lat++) {
            for (let long = 0; long < this.long; long++) {
                const first = (lat * (this.long + 1)) + long;
                const second = first + this.long + 1;

                indices.push(first, second, first + 1);
                indices.push(second, second + 1, first + 1);
            }
        }

        this.indexCount = indices.length;

        const vertexArray = new Float32Array(vertices);

        this.vertexBuffer = device.createBuffer({
            size: vertexArray.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });

        new Float32Array(this.vertexBuffer.getMappedRange()).set(vertices);
        this.vertexBuffer.unmap();

        const indexArray = (vertices.length / 10 > 65535)
            ? new Uint32Array(indices)
            : new Uint16Array(indices);

        this.indexBuffer = device.createBuffer({
            size: indexArray.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        new (indexArray.constructor as typeof Uint16Array)(this.indexBuffer.getMappedRange()).set(indexArray);
        this.indexBuffer.unmap();
        

        if (this.shading == ShadingType.SMOOTH) {    
        }   
    }
}