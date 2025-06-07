import React, { useEffect, useRef } from 'react';
import { Renderer } from './core/renderer'; // your Renderer class
import { Scene } from './scene/scene';       // your Scene class
import { Camera } from './scene/camera';     // your Camera class
import { BoxMesh } from './scene/boxmesh';
import { BasicMaterial } from './scene/basicmateral';
import { vec3 } from 'wgpu-matrix';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;

    // Create your scene and camera here
    const scene = new Scene();
    const camera = new Camera(Math.PI / 5, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);

    camera.lookAt(
      vec3.create(0, 0, 5), 
      vec3.create(0, 0, 0), 
      vec3.create(0, 1, 0), 
    );

    

    // Instantiate your renderer with canvas, scene, and camera
    // Because your Renderer constructor currently uses async calls internally,
    // you might want to change Renderer to have an async init method or handle device setup outside
    // For this example, let's assume Renderer constructor is sync and device is ready

    // If your Renderer constructor does async device requests, 
    // you should modify it to expose an async init or make device a Promise
    // For demo, I'll refactor Renderer a bit here inline:

    async function initRenderer() {
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
      rendererRef.current = new Renderer(canvas, scene, camera);
      rendererRef.current.device = device;
      rendererRef.current.context = context;
      rendererRef.current.textureFormat = format;

      const material = new BasicMaterial(device);
      const mesh = new BoxMesh(device, material);

      scene.add(mesh);
      // Start render loop
      function frame() {
        rendererRef.current?.renderFrame();
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    initRenderer();

    // cleanup
    return () => {
      rendererRef.current = null;
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh', display: 'block' }} />;
}

export default App;

