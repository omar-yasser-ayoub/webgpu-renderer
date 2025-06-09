import React, { useEffect, useRef } from 'react';
import { Renderer } from './core/renderer'; // your Renderer class
import { Scene } from './scene/scene';       // your Scene class
import { Camera } from './scene/camera';     // your Camera class
import { BoxMesh } from './scene/boxmesh';
import { BasicMaterial } from './scene/basicmateral';
import { quat, vec3, type Vec3, vec4 } from 'wgpu-matrix';
import { initRenderer } from './core/renderer';
import "./app.css";
function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);

  async function initialize() {
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

    let animationFrameId: number;
    rendererRef.current = await initRenderer(canvas, scene, camera);

    let x = 0;

    let mesh: BoxMesh;

    if (!rendererRef.current) {
      console.error('Renderer initialization failed');
      return;
    }
    else {
      //initialize all meshes, materials, etc here!
      const material = new BasicMaterial(rendererRef.current.device, vec4.create(1, 0, 0, 1)); // red color
      mesh = new BoxMesh(rendererRef.current.device, material);
      mesh.setPosition(vec3.create(0.7, 0, 0));
      mesh.setRotation(vec3.create(0, x, 0))
      mesh.setScale(vec3.create(0.5, 0.5, 0.5));
      scene.add(mesh);

      const material2 = new BasicMaterial(rendererRef.current.device, vec4.create(0, 1, 0, 1)); // red color
      const mesh2 = new BoxMesh(rendererRef.current.device, material2);
      mesh2.setPosition(vec3.create(-0.7, 0, 0));
      scene.add(mesh2);

    }

    function renderLoop() {
      rendererRef.current?.renderFrame();
      animationFrameId = requestAnimationFrame(renderLoop);;
      mesh.setRotation(vec3.create(0, animationFrameId/20, 0));
    }
    renderLoop();

    // cleanup
    return () => {
      rendererRef.current = null;
      cancelAnimationFrame(animationFrameId);
    };
  }

  useEffect(() => {
    initialize();
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh', display: 'block' }} />;
}

export default App;

