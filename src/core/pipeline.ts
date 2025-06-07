export interface PipelineDescriptor {
    device: GPUDevice;
    textureFormat: GPUTextureFormat;
    shaderModule: GPUShaderModule;
    bindGroupLayout: GPUBindGroupLayout;
    vertexEntryPoint: string;
    fragmentEntryPoint: string;
    primitiveTopology?: GPUPrimitiveTopology;
    cullMode?: GPUCullMode;
    targets?: GPUColorTargetState[];
    vertexBuffers?: GPUVertexBufferLayout[];
}

export class Pipeline {

    device: GPUDevice;
    textureFormat: GPUTextureFormat;
    shaderModule: GPUShaderModule;
    bindGroupLayout: GPUBindGroupLayout;
    vertexEntryPoint: string;
    fragmentEntryPoint: string;
    primitiveTopology: GPUPrimitiveTopology;
    cullMode: GPUCullMode;
    targets: GPUColorTargetState[];
    vertexBuffers: GPUVertexBufferLayout[];
    pipeline: GPURenderPipeline;


    constructor(pipelineDescriptor: PipelineDescriptor) {
        const {
          device,
          textureFormat,
          shaderModule,
          bindGroupLayout,
          vertexEntryPoint = 'vertex',
          fragmentEntryPoint = 'fragment',
          primitiveTopology = 'triangle-list',
          cullMode = 'back',
          targets,
          vertexBuffers = []
        } = pipelineDescriptor;
      
        this.device = device;
        this.textureFormat = textureFormat;
        this.shaderModule = shaderModule;
        this.bindGroupLayout = bindGroupLayout;
        this.vertexEntryPoint = vertexEntryPoint;
        this.fragmentEntryPoint = fragmentEntryPoint;
        this.primitiveTopology = primitiveTopology;
        this.cullMode = cullMode;
        this.targets = targets || [{
          format: textureFormat,
          writeMask: GPUColorWrite.ALL,
          blend: {
            color: { operation: 'add', srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha' },
            alpha: { operation: 'add', srcFactor: 'one', dstFactor: 'zero' }
          }
        }];

        const vertexBufferLayout: GPUVertexBufferLayout = {
          arrayStride: 12, // 3 * 4 bytes
          attributes: [
            {
              shaderLocation: 0,
              offset: 0,
              format: 'float32x3'
            }
          ],
          stepMode: 'vertex'
        };

        this.vertexBuffers = [vertexBufferLayout];
        
        this.pipeline = this.createPipeline();
      }

    createPipeline(): GPURenderPipeline {
        return this.device.createRenderPipeline({
            layout: this.device.createPipelineLayout({ bindGroupLayouts: [this.bindGroupLayout]}),
            vertex: {
                module: this.shaderModule,
                entryPoint: this.vertexEntryPoint,
                buffers: this.vertexBuffers
            },
            fragment: {
                module: this.shaderModule,
                entryPoint: this.fragmentEntryPoint,
                targets: this.targets
            },
            primitive: {
                topology: this.primitiveTopology,
                cullMode: this.cullMode
            },
        })
    }
}