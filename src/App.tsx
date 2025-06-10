import { useEffect, useRef } from 'react';
import { Renderer } from './core/renderer'; // your Renderer class
import { Scene } from './scene/scene';       // your Scene class
import { Camera } from './scene/camera';     // your Camera class
import { BoxMesh } from './scene/mesh/boxmesh';
import { vec3 } from 'wgpu-matrix';
import { initRenderer } from './core/renderer';
import "./app.css";
import { SphereMesh } from './scene/mesh/spheremesh';
import { FlatShadingMaterial } from './scene/material/flatshadingmaterial';
import { NormalMaterial } from './scene/material/normalmaterial';

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

    scene.add(camera);
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
      const material = new NormalMaterial(rendererRef.current.device); // red color
      mesh = new SphereMesh(rendererRef.current.device, material);
      mesh.setPosition(vec3.create(0, 0, 0));
      mesh.setScale(vec3.create(0.5, 0.5, 0.5));
      scene.add(mesh);

      const material2 = new FlatShadingMaterial(rendererRef.current.device); // red color
      const mesh2 = new SphereMesh(rendererRef.current.device, material2);
      mesh2.setPosition(vec3.create(-1, 0, 0));
      mesh2.setScale(vec3.create(0.5, 0.5, 0.5));
      scene.add(mesh2);
    }

    function renderLoop() {
      rendererRef.current?.renderFrame();
      animationFrameId = requestAnimationFrame(renderLoop);
      // sin = Math.sin(animationFrameId/100)/8
      // mesh.setRotation(vec3.create(0, animationFrameId/5, 0));
      // mesh.setPosition(vec3.create(0, sin, 0))
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

