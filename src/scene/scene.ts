import { Mesh } from './mesh';
export class Scene {
    meshes: Mesh[] = [];
    add(mesh: Mesh) { this.meshes.push(mesh); }
}