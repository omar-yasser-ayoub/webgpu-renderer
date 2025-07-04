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
import { SmoothShadingMaterial } from './scene/material/smoothshadingmaterial';
import { PointLight } from './scene/light/pointlight';
import { AmbientLight } from './scene/light/ambientlight';
import DirectionalLight from './scene/light/directionallight';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);

  async function initialize() {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;

    rendererRef.current = await initRenderer(canvas);
    
    if (!rendererRef.current) {
      console.error('Renderer initialization failed');
      return;
    }

    // Create your scene and camera here
    const scene = new Scene(rendererRef.current.device);

    rendererRef.current.setScene(scene);

    const camera = new Camera(Math.PI / 5, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);

    camera.lookAt(
      vec3.create(0, 0, 5), 
      vec3.create(0, 0, 0), 
      vec3.create(0, 1, 0), 
    );    

    const pointlight = new PointLight(
      vec3.create(0, 0, -2), // position
      vec3.create(0, 1, 1), // color
      1.5, // intensity
      10.0 // range
    );


    const pointlight2 = new PointLight(
      vec3.create(-5, 5, 0), // position
      vec3.create(1, 0, 1), // color
      1.0, // intensity
      10.0 // range
    );

    const ambientLight = new AmbientLight(
      vec3.create(1.0, 0.1, 0.1), // color
      0.15 // intensity
    )

    const directionalLight = new DirectionalLight(
      vec3.create(-1, -1, 0), // direction
      vec3.create(1, 1, 1), // color
      0.3, // intensity
    )


    scene.add(camera);
    scene.add(pointlight);
    scene.add(pointlight2);
    scene.add(ambientLight);
    scene.add(directionalLight);
    
    //initialize all meshes, materials, etc here!
    const material = new SmoothShadingMaterial(rendererRef.current.device); // red color
    const mesh = new SphereMesh(rendererRef.current.device, material);
    mesh.setPosition(vec3.create(0, 0, 0));
    mesh.setScale(vec3.create(0.5, 0.5, 0.5));
    scene.add(mesh);
    
    let animationFrameId: number;
    let sin = 0;
    let cos = 0;
    function renderLoop() {
      rendererRef.current?.renderFrame();
      animationFrameId = requestAnimationFrame(renderLoop);
      sin = Math.sin(animationFrameId/100)/8
      cos = Math.cos(animationFrameId/100)/8;
      pointlight.setPosition(vec3.create(sin * 5, cos * 5, 0));
      pointlight2.setPosition(vec3.create(sin * 5, -cos * 5, 0));
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

