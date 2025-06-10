import { Scene } from '../scene/scene';

export class Renderer {
    device: GPUDevice;
    context: GPUCanvasContext;
    textureFormat: GPUTextureFormat;
    scene!: Scene;
  
    constructor(device: GPUDevice, context: GPUCanvasContext, textureFormat: GPUTextureFormat) {
      this.device = device;
      this.context = context;
      this.textureFormat = textureFormat;
    }

    setScene(scene: Scene) {
      this.scene = scene;
    }
  
    renderFrame() {
      const commandEncoder = this.device.createCommandEncoder();
      const textureView = this.context.getCurrentTexture().createView();
  
      const passEncoder = commandEncoder.beginRenderPass({
        colorAttachments: [{
          view: textureView,
          clearValue: { r: 0.1, g: 0.1, b: 0.15, a: 1.0 },
          loadOp: 'clear',
          storeOp: 'store',
        }]
      });
      if (this.scene){
        this.scene.render(passEncoder, this.device);
      }
      passEncoder.end();
      this.device.queue.submit([commandEncoder.finish()]);
    }
}

export async function initRenderer(canvas: HTMLCanvasElement) {

    // create adapter and device manually:
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) throw new Error('WebGPU adapter not found');

    const device = await adapter.requestDevice();

    const context = canvas.getContext('webgpu')!;
    const format = navigator.gpu.getPreferredCanvasFormat();

    context.configure({
      device,
      format,
      alphaMode: 'opaque',
    });

    // Create renderer instance with these
    const renderer = new Renderer(device, context, format);

    return renderer;
}