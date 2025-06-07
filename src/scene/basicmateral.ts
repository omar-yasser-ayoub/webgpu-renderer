import { Material } from './material';
import { Pipeline } from '../core/pipeline';

export class BasicMaterial extends Material {
    uniformBuffer: GPUBuffer;
    baseColor: Float32Array;

    constructor(device: GPUDevice) {
        const shaderModule = device.createShaderModule({
            code: `
          struct Uniforms {
            mvpMatrix : mat4x4<f32>,
            baseColor : vec4<f32>,
          };
          
          @binding(0) @group(0) var<uniform> uniforms : Uniforms;
          
          struct VertexInput {
            @location(0) position : vec3<f32>,
          };
          
          struct VertexOutput {
            @builtin(position) position : vec4<f32>,
            @location(0) color : vec4<f32>,
          };
          
          @vertex
          fn vertex(input: VertexInput) -> VertexOutput {
            var output: VertexOutput;
            output.position = uniforms.mvpMatrix * vec4<f32>(input.position, 1.0);
            output.color = uniforms.baseColor;
            return output;
          }
          
          @fragment
          fn fragment(input: VertexOutput) -> @location(0) vec4<f32> {
            return input.color;
          }
          `
          });

        const bindGroupLayout = device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: { type: 'uniform' }
                }
            ]
        });

        const pipeline = new Pipeline(
            {
                device,
                textureFormat: 'bgra8unorm',
                shaderModule,
                bindGroupLayout,
                vertexEntryPoint: 'vertex',
                fragmentEntryPoint: 'fragment',
                primitiveTopology: 'triangle-list',
                cullMode: 'back',
                targets: [{
                    format: 'bgra8unorm',
                    writeMask: GPUColorWrite.ALL,
                    blend: {
                        color: { operation: 'add', srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha' },
                        alpha: { operation: 'add', srcFactor: 'one', dstFactor: 'zero' }
                    }
                }],
                vertexBuffers: []
            }
        )

        super(pipeline);

        this.uniformBuffer = device.createBuffer({
            size: 80,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        this.baseColor = new Float32Array([1.0, 1.0, 1.0, 1.0]);

        this.bindGroups.push(
            device.createBindGroup({
                layout: bindGroupLayout,
                entries: [
                    {
                        binding: 0,
                        resource: {
                            buffer: this.uniformBuffer
                        }
                    }
                ]
            })
        );
    }

    update(device: GPUDevice, mvpMatrix: Float32Array): void {
        const unformData = new Float32Array(20);
        unformData.set(mvpMatrix, 0);
        unformData.set(this.baseColor, 16);
        device.queue.writeBuffer(this.uniformBuffer, 0, unformData.buffer)
    }
}