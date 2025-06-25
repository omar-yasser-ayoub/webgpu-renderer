A real-time 3D renderer built from scratch using the [WebGPU API](https://gpuweb.github.io/gpuweb/).  
This project demonstrates the power of modern browser-based graphics and is designed for learning, experimentation, and visual quality.

## Features

- Custom render pipeline using WebGPU
- Support for different 3D mesh types (e.g., spheres, cubes, custom models)
- Real-time shading and material system
- Modular and scalable codebase for future extensions

## 🔧 Technologies

- **WebGPU API**
- **React** (for UI and component structure)
- **WGSL** for shaders
- **Vite**

## Getting Started

### Prerequisites

- Node.js >= 18
- A browser that supports WebGPU (e.g., Chrome Canary with `--enable-unsafe-webgpu` or latest Chrome/Edge)

### Installation

```bash
git clone https://github.com/your-username/webgpu-renderer.git
cd webgpu-renderer
npm install
npm run dev
