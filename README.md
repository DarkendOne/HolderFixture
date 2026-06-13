# BracketCraft 🛠️

**BracketCraft** is a completely client-side 3D STL generator application designed to let users customize, preview, and download custom 3D-printable mounting bracket designs directly from their browser. No servers, no signups—just pure in-browser 3D mathematical extrusion and STL serialization.

## 🚀 Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer recommended)

### Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Local Dev Server**:
   ```bash
   npm run dev
   ```
   Open your browser to `http://localhost:3000` to interact with the application.

3. **Build for Production**:
   ```bash
   npm run build
   ```
   This compiles TypeScript, bundles styling, and outputs optimized static files in the `dist/` directory, ready to be hosted on any static hosting provider.

---

## 🎨 Features & Tech Stack

- **Tech Stack**:
  - **Framework-free**: Vanilla TypeScript for modular, high-speed execution.
  - **Bundler**: [Vite](https://vitejs.dev/) for extremely fast hot module reloading and build compilation.
  - **3D Preview Engine**: [Three.js](https://threejs.org/) for hardware-accelerated 3D viewport rendering and orbit controls.
  - **Styling**: Modern, responsive CSS variables, glassmorphic cards, and custom-styled range inputs.

- **Configurable Parameters**:
  - **Dimensions**: Adjust horizontal leg length, vertical leg height, bracket depth, and material thickness.
  - **Hole Configurations**: Change hole diameters and distribute up to 4 mounting holes evenly across each bracket leg (automatically computes safety boundaries to prevent overlapping).
  - **Reinforcement Gusset**: Add a centering rib gusset with custom thickness.
  - **Quick Presets**: Swap between *Standard*, *Heavy Duty*, and *Mini* configurations in a single click.

- **STL Generator**:
  - Direct translation of Three.js active mesh buffers into a **watertight Binary STL format** (uses 80-byte header, 4-byte count, and 50-byte triangle packages).
  - Computes exact vertex spatial positions using global transformation matrices.
  - Computes geometric normals dynamically on export to ensure slicer compatibility.
  - Zero-latency client-side downloads using browser `Blob` and Object URLs.
