import { Pipeline } from '../core/pipeline';

export abstract class Material {
    pipeline: Pipeline;
    bindGroupLayout: GPUBindGroupLayout;
    bindGroup: GPUBindGroup;
    uniformBuffer: GPUBuffer;

    constructor(pipeline: Pipeline, bindGroup:GPUBindGroup, bindGroupLayout: GPUBindGroupLayout, uniformBuffer: GPUBuffer) {
        this.pipeline = pipeline;
        this.bindGroup = bindGroup;
        this.bindGroupLayout = bindGroupLayout;
        this.uniformBuffer = uniformBuffer;
    }

    apply(passEncoder: GPURenderPassEncoder): void {
        passEncoder.setPipeline(this.pipeline.pipeline);
        passEncoder.setBindGroup(1, this.bindGroup);
    }
}