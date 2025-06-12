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
          @location(1) normal : vec3<f32>,
          @location(2) worldPosition : vec3<f32>,
        }
    
        struct Light {
          position: vec3<f32>,   // 12 bytes
          direction: vec3<f32>,  // 12 bytes
          color: vec3<f32>,      // 12 bytes
          _padding1: f32,        // +4 bytes => 40 bytes total

          range: f32,             // 4 bytes
          lightType: f32,         // 4 bytes
          intensity: f32,         // 4 bytes
          _padding4: f32,         // +4 bytes => 16 bytes total
        }

        struct LightUniforms {
          lights: array<Light, 64>,
        } 

        struct MeshUniforms{
          modelMatrix: mat4x4<f32>,
          viewMatrix: mat4x4<f32>,
          projectionMatrix: mat4x4<f32>,
          normalMatrix: mat3x3<f32>,
        }

        @group(0) @binding(0)
        var<uniform> meshUniforms : MeshUniforms;

        @group(2) @binding(0)
        var<uniform> lightUniforms : LightUniforms;
    
        @vertex
        fn vertex(input: VertexInput) -> VertexOutput {
          var output: VertexOutput;
          output.position = meshUniforms.projectionMatrix * meshUniforms.viewMatrix * meshUniforms.modelMatrix * vec4<f32>(input.position, 1.0);
          output.color = vec4<f32>(1.0, 1.0, 1.0, 1.0);
          output.normal = normalize(meshUniforms.normalMatrix * input.normal);
          output.worldPosition = (meshUniforms.modelMatrix * vec4<f32>(input.position, 1.0)).xyz;
          return output;
        }
    
        @fragment
        fn fragment(input: VertexOutput) -> @location(0) vec4<f32> {

          var finalColor = vec3<f32>(0.0, 0.0, 0.0);
          let normal = normalize(input.normal);
          let viewDir = normalize(-input.worldPosition);

          for (var i = 0; i < 64; i++) {

            let currentLight = lightUniforms.lights[i];
            var lightColor = vec3<f32>(0.0);
            var lightDir = vec3<f32>(0.0);

            if (currentLight.lightType == 0) { // Point Light
              lightDir = currentLight.position - input.worldPosition;
              let distance = length(lightDir);
              lightDir = normalize(lightDir);
              let attenuation = 1.0 / (1.0 + 0.09 * distance + 0.032 * distance * distance);
              let diffuse = max(dot(normal, normalize(lightDir)), 0.0);
              
              let halfwayDir = normalize(lightDir + viewDir);
              let specular = pow(max(dot(normal, halfwayDir), 0.0), 32.0); // shininess = 32

              lightColor = currentLight.color * attenuation * (diffuse + specular) * currentLight.intensity;
            }
            if (currentLight.lightType == 1) { // Directional Light
              lightDir = normalize(-currentLight.direction);
              let diffuse = max(dot(normal, lightDir), 0.0);
              
              let halfwayDir = normalize(lightDir + viewDir);
              let specular = pow(max(dot(normal, halfwayDir), 0.0), 32.0); // shininess = 32

              lightColor = currentLight.color * (diffuse + specular) * currentLight.intensity;
            }
            if (currentLight.lightType == 2) { // Ambient Light
              lightColor = currentLight.color * currentLight.intensity;
            }
            finalColor += lightColor;
          }

          return vec4<f32>(finalColor, 1.0);
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
