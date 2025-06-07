import { Material } from './material';
import { Pipeline } from '../core/pipeline';

export class BasicMaterial extends Material {
  color: Float32Array;
  uniformBuffer: GPUBuffer;
  bindGroupLayout: GPUBindGroupLayout;
  bindGroup: GPUBindGroup;

  constructor(device: GPUDevice, color: Float32Array = new Float32Array([1, 1, 1, 1])) {
    const shaderModule = device.createShaderModule({
      code: `
        struct MaterialUniforms {
          baseColor : vec4<f32>,
        }
    
        struct VertexInput {
          @location(0) position : vec3<f32>,
        }
    
        struct VertexOutput {
          @builtin(position) position : vec4<f32>,
          @location(0) color : vec4<f32>,
        }
    
        @group(0) @binding(0)
        var<uniform> mvpMatrix : mat4x4<f32>;
    
        @group(1) @binding(0)
        var<uniform> material : MaterialUniforms;
    
        @vertex
        fn vertex(input: VertexInput) -> VertexOutput {
          var output: VertexOutput;
          output.position = mvpMatrix * vec4<f32>(input.position, 1.0);
          output.color = material.baseColor;
          return output;
        }
    
        @fragment
        fn fragment(input: VertexOutput) -> @location(0) vec4<f32> {
          return input.color;
        }
      `
    });

    // Material uniform buffer size: 4 floats = 16 bytes
    const uniformBuffer = device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
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

    const bindGroupLayout = device.createBindGroupLayout({
      entries: [{
        binding: 0,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: { type: 'uniform' }
      }]
    });

    const pipelineLayout = device.createPipelineLayout({
      label: 'BasicMaterial Pipeline Layout',
      bindGroupLayouts: [
        meshBindGroupLayout,      // group 0
        bindGroupLayout,  // group 1
      ],
    });

    const bindGroup = device.createBindGroup({
      label: 'BasicMaterial Bind Group',
      layout: bindGroupLayout,
      entries: [{
        binding: 0,
        resource: {
          buffer: uniformBuffer,
        }
      }]
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
      vertexBuffers: [
        {
          arrayStride: 12,
          attributes: [
            {
              shaderLocation: 0,
              offset: 0,
              format: 'float32x3'
            }
          ]
        }
      ]
    });

    super(pipeline, bindGroup, bindGroupLayout, uniformBuffer);

    this.color = color;
    this.uniformBuffer = uniformBuffer;
    this.bindGroupLayout = bindGroupLayout;
    this.bindGroup = bindGroup;

    // Initialize uniform buffer with default color
    this.updateColor(device);
  }

  setColor(newColor: Float32Array) {
    this.color.set(newColor);
    this.updateColor(this.pipeline.device);
  }

  updateColor(device: GPUDevice) {
    // Write the RGBA color to the uniform buffer
    device.queue.writeBuffer(
      this.uniformBuffer,
      0,
      this.color.buffer,
      this.color.byteOffset,
      this.color.byteLength
    );
  }

  updateUniforms(device: GPUDevice) {
    this.updateColor(device);
  }
}
