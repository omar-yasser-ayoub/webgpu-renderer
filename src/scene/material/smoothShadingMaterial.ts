import { Material } from './material';
import { Pipeline } from '../../core/pipeline';

export class SmoothShadingMaterial extends Material {
  constructor(device: GPUDevice) {
    const shaderModule = device.createShaderModule({
      code: `
        struct VertexInput {
          @location(0) position : vec3<f32>,
          @location(1) normal : vec3<f32>,
          @location(2) uv : vec2<f32>,
        }
    
        struct VertexOutput {
          @builtin(position) position : vec4<f32>,
          @location(0) color : vec4<f32>,
        }
    
        @group(0) @binding(0)
        var<uniform> mvpMatrix : mat4x4<f32>;
    
        @vertex
        fn vertex(input: VertexInput) -> VertexOutput {
          var output: VertexOutput;
          output.position = mvpMatrix * vec4<f32>(input.position, 1.0);

          output.color = vec4<f32>(input.normal * 0.5 + vec3<f32>(0.5), 1.0);
          return output;
        }
    
        @fragment
        fn fragment(input: VertexOutput) -> @location(0) vec4<f32> {
          return input.color;
        }
      `
    });

    const meshBindGroupLayout = device.createBindGroupLayout({
      entries: [
          {
              binding: 0,
              visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
              buffer: { type: 'uniform' },
          },
      ],
    });

    const materialBindGroupLayout = device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          buffer: { type: 'uniform' },
        },
      ],
    })
    const lightBindGroupLayout = device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT,
          buffer: { type: 'uniform' },
        },
      ],
    });

    const pipelineLayout = device.createPipelineLayout({
      label: 'SmoothShadingMaterial Pipeline Layout',
      bindGroupLayouts: [
        meshBindGroupLayout,
        materialBindGroupLayout,
        lightBindGroupLayout
      ],
    });

    const buffer = device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })

    const bindGroup = device.createBindGroup({
      layout: materialBindGroupLayout,
      entries: [{
        binding: 0,
        resource: {
          buffer: buffer
        },
      }],
    });

    const pipeline = new Pipeline({
      device,
      textureFormat: 'bgra8unorm',
      shaderModule,
      pipelineLayout,
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
    });

    super(pipeline, materialBindGroupLayout, bindGroup, buffer);

    this.uniformBuffer = buffer;
    this.bindGroupLayout = materialBindGroupLayout;
    this.bindGroup = bindGroup;
  }
}
