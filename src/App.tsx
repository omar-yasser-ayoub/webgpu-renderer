import React, { useEffect, useRef } from 'react';
import { Renderer } from './core/renderer'; // your Renderer class
import { Scene } from './scene/scene';       // your Scene class
import { Camera } from './scene/camera';     // your Camera class
import { BoxMesh } from './scene/mesh/boxmesh';
import { quat, vec3, type Vec3, vec4 } from 'wgpu-matrix';
import { initRenderer } from './core/renderer';
import "./app.css";
import { HelloWorldMaterial } from './scene/material/helloworldmaterial';
import { BasicMaterial } from './scene/material/basicmateral';
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

    let sin: number;
    if (!rendererRef.current) {
      console.error('Renderer initialization failed');
      return;
    }
    else {
      //initialize all meshes, materials, etc here!
      const material = new BasicMaterial(rendererRef.current.device, new Float32Array([1,1,1,1])); // red color
      mesh = new BoxMesh(rendererRef.current.device, material);
      mesh.setPosition(vec3.create(0.7, 0, 0));
      mesh.setRotation(vec3.create(0, x, 0))
      mesh.setScale(vec3.create(0.5, 0.5, 0.5));
      scene.add(mesh);
    }

    function renderLoop() {
      rendererRef.current?.renderFrame();
      animationFrameId = requestAnimationFrame(renderLoop);
      sin = Math.sin(animationFrameId/400)/8
      mesh.setRotation(vec3.create(0, animationFrameId/15, 0));
      mesh.setPosition(vec3.create(0, sin, 0))
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

