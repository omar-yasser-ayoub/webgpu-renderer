import { Scene } from '../scene/scene';
import { Camera } from '../scene/camera';

export class Renderer {
    device!: GPUDevice;
    context: GPUCanvasContext;
    textureFormat!: GPUTextureFormat;
    scene: Scene;
    camera: Camera;
  
    constructor(canvas: HTMLCanvasElement, scene: Scene, camera: Camera) {
      this.scene = scene;
      this.camera = camera;
      this.context = canvas.getContext('webgpu') as GPUCanvasContext;
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
  