import { Pipeline } from '../core/pipeline';

export abstract class Material {
    pipeline: Pipeline;
    bindGroups: GPUBindGroup[];

    constructor(pipeline: Pipeline) {
        this.pipeline = pipeline;
        this.bindGroups = [];
    }

    abstract update(device: GPUDevice, mvpMatrix: Float32Array): void;

    apply(passEncoder: GPURenderPassEncoder): void {
        passEncoder.setPipeline(this.pipeline.pipeline);
        this.bindGroups.forEach((bindGroup, index) => {
            passEncoder.setBindGroup(index, bindGroup);
        })
    }
}