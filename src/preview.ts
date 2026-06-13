import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface BracketParams {
  width: number;
  height: number;
  depth: number;
  thickness: number;
  holeDia: number;
  holeCount: number;
  hasGusset: boolean;
  gussetThickness: number;
}

export class BracketPreview {
  private container: HTMLElement;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;

  // Meshes
  private horizontalMesh: THREE.Mesh | null = null;
  private verticalMesh: THREE.Mesh | null = null;
  private gussetMesh: THREE.Mesh | null = null;

  // Materials
  private material!: THREE.MeshStandardMaterial;

  constructor(container: HTMLElement) {
    this.container = container;
    this.initScene();
    this.initLights();
    this.initControls();
    this.animate();

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private initScene() {
    this.scene = new THREE.Scene();
    // Background is transparent to let CSS gradients show through
    this.scene.background = null;

    this.camera = new THREE.PerspectiveCamera(
      45,
      this.container.clientWidth / this.container.clientHeight,
      1,
      1000
    );
    this.camera.position.set(90, 110, 130);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // Subtle background grid
    const gridHelper = new THREE.GridHelper(200, 40, 0x4facfe, 0x1f2937);
    gridHelper.position.y = -0.5;
    const gridMat = gridHelper.material as THREE.Material;
    gridMat.opacity = 0.2;
    gridMat.transparent = true;
    this.scene.add(gridHelper);

    // Premium metallic material
    this.material = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      metalness: 0.8,
      roughness: 0.25,
      roughnessMap: null,
      metalnessMap: null,
      bumpScale: 0.05,
      side: THREE.DoubleSide
    });
  }

  private initLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    // Primary bright light
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight1.position.set(80, 120, 60);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;
    dirLight1.shadow.bias = -0.001;
    this.scene.add(dirLight1);

    // Accent light from the side (cyan/blue fill)
    const dirLight2 = new THREE.DirectionalLight(0x4facfe, 0.5);
    dirLight2.position.set(-80, 60, -60);
    this.scene.add(dirLight2);

    // Top soft light
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x111827, 0.3);
    this.scene.add(hemiLight);
  }

  private initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.05; // Lock camera from panning fully underground
    this.controls.minDistance = 25;
    this.controls.maxDistance = 300;

    // Focus target
    this.controls.target.set(25, 20, 0);
  }

  /**
   * Disposes the geometry of a mesh and removes it from the scene
   */
  private cleanupMesh(mesh: THREE.Mesh | null) {
    if (mesh) {
      this.scene.remove(mesh);
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }
    }
  }

  /**
   * Re-generates the bracket meshes based on the user parameters
   */
  public updateGeometry(params: BracketParams) {
    // Dispose old geometries to prevent memory leaks in the GPU
    this.cleanupMesh(this.horizontalMesh);
    this.cleanupMesh(this.verticalMesh);
    this.cleanupMesh(this.gussetMesh);

    const { width, height, depth, thickness, holeDia, holeCount, hasGusset, gussetThickness } = params;

    // ------------------------------------------
    // 1. Horizontal Leg Mesh
    // ------------------------------------------
    const shapeHoriz = new THREE.Shape();
    shapeHoriz.moveTo(0, -depth / 2);
    shapeHoriz.lineTo(width, -depth / 2);
    shapeHoriz.lineTo(width, depth / 2);
    shapeHoriz.lineTo(0, depth / 2);
    shapeHoriz.closePath();

    // Distribute and add holes
    const horizHolePositions = this.getHolePositions(width, thickness, holeDia, holeCount);
    for (const holeX of horizHolePositions) {
      const holePath = new THREE.Path();
      holePath.absarc(holeX, 0, holeDia / 2, 0, Math.PI * 2, true);
      shapeHoriz.holes.push(holePath);
    }

    const geomHoriz = new THREE.ExtrudeGeometry(shapeHoriz, {
      depth: thickness,
      bevelEnabled: false
    });

    this.horizontalMesh = new THREE.Mesh(geomHoriz, this.material);
    // Align so it lays flat in XZ plane with Y going from 0 to thickness
    this.horizontalMesh.rotation.x = -Math.PI / 2;
    this.horizontalMesh.position.y = thickness;
    this.scene.add(this.horizontalMesh);

    // ------------------------------------------
    // 2. Vertical Leg Mesh
    // ------------------------------------------
    const shapeVert = new THREE.Shape();
    shapeVert.moveTo(0, -depth / 2);
    shapeVert.lineTo(height, -depth / 2);
    shapeVert.lineTo(height, depth / 2);
    shapeVert.lineTo(0, depth / 2);
    shapeVert.closePath();

    // Distribute and add holes
    const vertHolePositions = this.getHolePositions(height, thickness, holeDia, holeCount);
    for (const holeY of vertHolePositions) {
      const holePath = new THREE.Path();
      holePath.absarc(holeY, 0, holeDia / 2, 0, Math.PI * 2, true);
      shapeVert.holes.push(holePath);
    }

    const geomVert = new THREE.ExtrudeGeometry(shapeVert, {
      depth: thickness,
      bevelEnabled: false
    });

    this.verticalMesh = new THREE.Mesh(geomVert, this.material);
    // Align so it stands vertical in YZ plane with X going from 0 to thickness
    this.verticalMesh.rotation.z = Math.PI / 2;
    this.verticalMesh.rotation.y = -Math.PI / 2;
    this.verticalMesh.position.x = thickness;
    this.scene.add(this.verticalMesh);

    // ------------------------------------------
    // 3. Reinforcing Gusset Mesh
    // ------------------------------------------
    if (hasGusset && gussetThickness > 0) {
      const shapeGusset = new THREE.Shape();
      const gussetX = (width - thickness) * 0.6;
      const gussetY = (height - thickness) * 0.6;

      shapeGusset.moveTo(thickness, thickness);
      shapeGusset.lineTo(thickness + gussetX, thickness);
      shapeGusset.lineTo(thickness, thickness + gussetY);
      shapeGusset.closePath();

      const geomGusset = new THREE.ExtrudeGeometry(shapeGusset, {
        depth: gussetThickness,
        bevelEnabled: false
      });

      this.gussetMesh = new THREE.Mesh(geomGusset, this.material);
      // Center along the Z axis (which is the bracket width)
      this.gussetMesh.position.z = -gussetThickness / 2;
      this.scene.add(this.gussetMesh);
    }

    // Set control target slightly offset to the visual center of the shape
    this.controls.target.set(width / 3, height / 3, 0);
  }

  /**
   * Helper to distribute holes evenly along the centerline of a leg
   */
  private getHolePositions(length: number, thickness: number, holeDia: number, count: number): number[] {
    const positions: number[] = [];
    if (count <= 0 || holeDia <= 0) return positions;

    // Maintain safety margins so holes don't merge with the corner or outer edge
    const minMargin = thickness + holeDia * 1.5;
    const maxPosition = length - holeDia * 1.5;

    // If there's no space for the margin, fallback
    if (maxPosition <= minMargin) {
      if (length > holeDia * 2.2) {
        positions.push((thickness + length) / 2);
      }
      return positions;
    }

    if (count === 1) {
      positions.push((minMargin + maxPosition) / 2);
    } else {
      const spacing = (maxPosition - minMargin) / (count - 1);
      for (let i = 0; i < count; i++) {
        positions.push(minMargin + i * spacing);
      }
    }

    return positions;
  }

  /**
   * Get currently active rendering meshes to read geometry for export
   */
  public getActiveMeshes(): THREE.Mesh[] {
    const active: THREE.Mesh[] = [];
    if (this.horizontalMesh) active.push(this.horizontalMesh);
    if (this.verticalMesh) active.push(this.verticalMesh);
    if (this.gussetMesh) active.push(this.gussetMesh);
    return active;
  }

  private animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize() {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }
}
