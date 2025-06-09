import { Pipeline } from '../core/pipeline';

export abstract class Material {
    pipeline: Pipeline;
    bindGroupLayout?: GPUBindGroupLayout;
    bindGroup?: GPUBindGroup;
    uniformBuffer?: GPUBuffer;

    constructor(pipeline: Pipeline, bindGroupLayout?: GPUBindGroupLayout,  bindGroup?:GPUBindGroup, uniformBuffer?: GPUBuffer) {
        this.pipeline = pipeline;
        if (bindGroupLayout) {
            this.bindGroupLayout = bindGroupLayout;
        }
        if (bindGroup) {
            this.bindGroup = bindGroup;
        }
        if (uniformBuffer) {
            this.uniformBuffer = uniformBuffer;
        }
    }

    apply(passEncoder: GPURenderPassEncoder): void {
        passEncoder.setPipeline(this.pipeline.pipeline);
        if (this.bindGroup) {
            passEncoder.setBindGroup(1, this.bindGroup);
        }
    }
}