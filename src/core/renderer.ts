import { Scene } from '../scene/scene';
import { Camera } from '../scene/camera';

export class Renderer {
    device: GPUDevice;
    context: GPUCanvasContext;
    textureFormat: GPUTextureFormat;
    scene: Scene;
    camera: Camera;
  
    constructor(scene: Scene, camera: Camera, device: GPUDevice, context: GPUCanvasContext, textureFormat: GPUTextureFormat) {
      this.device = device;
      this.context = context;
      this.textureFormat = textureFormat;
      this.scene = scene;
      this.camera = camera;
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
  
      this.scene.render(passEncoder, this.camera, this.device);
  
      passEncoder.end();
      this.device.queue.submit([commandEncoder.finish()]);
    }
}

export async function initRenderer(canvas: HTMLCanvasElement, scene: Scene, camera: Camera) {

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
    const renderer = new Renderer(scene, camera, device, context, format);

    return renderer;
}