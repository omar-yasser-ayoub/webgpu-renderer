import { vec3 } from "wgpu-matrix";
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
    shading: ShadingType = ShadingType.SMOOTH;
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
        if (this.shading == ShadingType.FLAT || this.shading == ShadingType.NONE) {
            for (let lat = 0; lat < this.lat; lat++) {  // Changed from <= to <
                // Calculate the position of the quad, using current lat position and lat + 1
                const theta1 = lat / this.lat * Math.PI;
                const theta2 = (lat + 1) / this.lat * Math.PI;
        
                const sinTheta1 = Math.sin(theta1);
                const cosTheta1 = Math.cos(theta1);
                const sinTheta2 = Math.sin(theta2);
                const cosTheta2 = Math.cos(theta2);
        
                for (let long = 0; long < this.long; long++) {  // Changed from <= to <
                    // Calculate the position of the quad, using current long position and long + 1
                    const phi1 = long / this.long * 2 * Math.PI;
                    const phi2 = (long + 1) / this.long * 2 * Math.PI;
        
                    const sinPhi1 = Math.sin(phi1);
                    const cosPhi1 = Math.cos(phi1);
                    const sinPhi2 = Math.sin(phi2);
                    const cosPhi2 = Math.cos(phi2);
        
                    // Declare the four vertices of the quad
                    const p1 = vec3.create(this.radius * cosPhi1 * sinTheta1, this.radius * cosTheta1, this.radius * sinPhi1 * sinTheta1)
                    const p2 = vec3.create(this.radius * cosPhi1 * sinTheta2, this.radius * cosTheta2, this.radius * sinPhi1 * sinTheta2)
                    const p3 = vec3.create(this.radius * cosPhi2 * sinTheta1, this.radius * cosTheta1, this.radius * sinPhi2 * sinTheta1)
                    const p4 = vec3.create(this.radius * cosPhi2 * sinTheta2, this.radius * cosTheta2, this.radius * sinPhi2 * sinTheta2)
        
                    // First triangle: p1, p2, p3
                    const u1 = vec3.subtract(p2, p1);
                    const v1 = vec3.subtract(p3, p1);
                    const normal1 = vec3.normalize(vec3.cross(u1, v1));
        
                    const baseIndex1 = vertices.length / 10;
                    
                    vertices.push(p1[0], p1[1], p1[2], 0.0); // position
                    vertices.push(normal1[0], normal1[1], normal1[2], 0.0); // normal
                    vertices.push(long / this.long, lat / this.lat); // uv
        
                    vertices.push(p2[0], p2[1], p2[2], 0.0); // position
                    vertices.push(normal1[0], normal1[1], normal1[2], 0.0); // normal
                    vertices.push(long / this.long, (lat + 1) / this.lat); // uv
        
                    vertices.push(p3[0], p3[1], p3[2], 0.0); // position
                    vertices.push(normal1[0], normal1[1], normal1[2], 0.0); // normal
                    vertices.push((long + 1) / this.long, lat / this.lat); // uv
        
                    indices.push(baseIndex1, baseIndex1 + 1, baseIndex1 + 2);
        
                    // Second triangle: p2, p4, p3
                    const u2 = vec3.subtract(p4, p2);
                    const v2 = vec3.subtract(p3, p2);
                    const normal2 = vec3.normalize(vec3.cross(u2, v2));
        
                    const baseIndex2 = vertices.length / 10;
        
                    vertices.push(p2[0], p2[1], p2[2], 0.0); // position
                    vertices.push(normal2[0], normal2[1], normal2[2], 0.0); // normal
                    vertices.push(long / this.long, (lat + 1) / this.lat); // uv
        
                    vertices.push(p4[0], p4[1], p4[2], 0.0); // position
                    vertices.push(normal2[0], normal2[1], normal2[2], 0.0); // normal
                    vertices.push((long + 1) / this.long, (lat + 1) / this.lat); // uv
        
                    vertices.push(p3[0], p3[1], p3[2], 0.0); // position
                    vertices.push(normal2[0], normal2[1], normal2[2], 0.0); // normal
                    vertices.push((long + 1) / this.long, lat / this.lat); // uv
        
                    indices.push(baseIndex2, baseIndex2 + 1, baseIndex2 + 2);
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
        }
        if (this.shading == ShadingType.SMOOTH) {
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
        }
    }
}