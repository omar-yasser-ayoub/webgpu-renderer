export interface PipelineDescriptor {
    device: GPUDevice;
    textureFormat: GPUTextureFormat;
    shaderModule: GPUShaderModule;
    pipelineLayout: GPUPipelineLayout;
    vertexEntryPoint: string;
    fragmentEntryPoint: string;
    primitiveTopology?: GPUPrimitiveTopology;
    cullMode?: GPUCullMode;
    targets?: GPUColorTargetState[];
}

export class Pipeline {

    device: GPUDevice;
    textureFormat: GPUTextureFormat;
    shaderModule: GPUShaderModule;
    pipelineLayout: GPUPipelineLayout;
    vertexEntryPoint: string;
    fragmentEntryPoint: string;
    primitiveTopology: GPUPrimitiveTopology;
    cullMode: GPUCullMode;
    targets: GPUColorTargetState[];
    pipeline: GPURenderPipeline;
    vertexBuffers: GPUVertexBufferLayout[];


    constructor(pipelineDescriptor: PipelineDescriptor) {
        const {
          device,
          textureFormat,
          shaderModule,
          pipelineLayout,
          vertexEntryPoint = 'vertex',
          fragmentEntryPoint = 'fragment',
          primitiveTopology = 'triangle-list',
          cullMode = 'back',
          targets,
        } = pipelineDescriptor;
      
        this.device = device;
        this.textureFormat = textureFormat;
        this.shaderModule = shaderModule;
        this.pipelineLayout = pipelineLayout;
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
          arrayStride: 40, // 3 floats for position (12 bytes) + 1 float padding + 3 floats for normal (12 bytes) + 1 float padding + 2 floats for UV (8 bytes) = 32 bytes
          attributes: [
            {
              shaderLocation: 0,
              offset: 0,
              format: 'float32x3'
            },
            {
              shaderLocation: 1,
              offset: 16, 
              format: 'float32x3' 
            },
            {
              shaderLocation: 2,
              offset: 32, 
              format: 'float32x2'
            }
          ],
          stepMode: 'vertex'
        };

        this.vertexBuffers = [vertexBufferLayout];
        
        this.pipeline = this.createPipeline();
      }

    createPipeline(): GPURenderPipeline {
        return this.device.createRenderPipeline({
            layout: this.pipelineLayout,
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