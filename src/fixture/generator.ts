import * as THREE from 'three';

// Shared premium material for the fixture
const fixtureMaterial = new THREE.MeshStandardMaterial({
  color: 0x00f2fe,
  metalness: 0.75,
  roughness: 0.25,
  side: THREE.DoubleSide
});

/**
 * Procedural geometry generator for a rectangular object holding fixture
 */
export function generateFixture(params: Record<string, any>): THREE.Mesh[] {
  const meshes: THREE.Mesh[] = [];

  // Inputs
  const innerLength = params.innerLength as number;
  const innerWidth = params.innerWidth as number;
  const pocketDepth = params.pocketDepth as number;
  const clearance = params.clearance as number;
  const baseThickness = params.baseThickness as number;
  const wallThickness = params.wallThickness as number;
  const flangeWidth = params.flangeWidth as number;
  const holeDia = params.holeDia as number;
  const fingerCutout = params.fingerCutout as boolean;

  // Compute pocket inside dimensions (with clearance)
  const L_in = innerLength + clearance;
  const W_in = innerWidth + clearance;

  // Compute outer dimensions of the wall box
  const L_outer = L_in + 2 * wallThickness;
  const W_outer = W_in + 2 * wallThickness;

  // Compute total base plate dimensions (extends left/right for flanges)
  const L_base = L_outer + 2 * flangeWidth;
  const W_base = W_outer;

  // ------------------------------------------
  // 1. Base Plate Mesh (with holes)
  // ------------------------------------------
  const shapeBase = new THREE.Shape();
  shapeBase.moveTo(-L_base / 2, -W_base / 2);
  shapeBase.lineTo(L_base / 2, -W_base / 2);
  shapeBase.lineTo(L_base / 2, W_base / 2);
  shapeBase.lineTo(-L_base / 2, W_base / 2);
  shapeBase.closePath();

  // Add mounting flange holes (left & right sides)
  if (flangeWidth > 0 && holeDia > 0) {
    const leftHole = new THREE.Path();
    const leftX = -L_base / 2 + flangeWidth / 2;
    leftHole.absarc(leftX, 0, holeDia / 2, 0, Math.PI * 2, true);
    shapeBase.holes.push(leftHole);

    const rightHole = new THREE.Path();
    const rightX = L_base / 2 - flangeWidth / 2;
    rightHole.absarc(rightX, 0, holeDia / 2, 0, Math.PI * 2, true);
    shapeBase.holes.push(rightHole);
  }

  // Add center push-out hole (finger cutout)
  if (fingerCutout && L_in > 15 && W_in > 15) {
    const centerR = Math.min(15, L_in / 3.2, W_in / 3.2);
    if (centerR > 2.5) {
      const centerHole = new THREE.Path();
      centerHole.absarc(0, 0, centerR, 0, Math.PI * 2, true);
      shapeBase.holes.push(centerHole);
    }
  }

  const geomBase = new THREE.ExtrudeGeometry(shapeBase, {
    depth: baseThickness,
    bevelEnabled: false
  });

  const baseMesh = new THREE.Mesh(geomBase, fixtureMaterial);
  // Lay flat in XZ plane with Y going from 0 to baseThickness
  baseMesh.rotation.x = -Math.PI / 2;
  baseMesh.position.y = baseThickness;
  meshes.push(baseMesh);

  // ------------------------------------------
  // 2. Enclosure Walls Meshes
  // ------------------------------------------
  const wallMaterial = fixtureMaterial;

  // Back Wall: Box sitting along the positive Z (back side)
  const geomBack = new THREE.BoxGeometry(L_outer, pocketDepth, wallThickness);
  const backMesh = new THREE.Mesh(geomBack, wallMaterial);
  backMesh.position.set(0, baseThickness + pocketDepth / 2, W_outer / 2 - wallThickness / 2);
  meshes.push(backMesh);

  // Left Wall: Box sitting on the negative X (left side)
  const geomLeft = new THREE.BoxGeometry(wallThickness, pocketDepth, W_in);
  const leftMesh = new THREE.Mesh(geomLeft, wallMaterial);
  leftMesh.position.set(-L_outer / 2 + wallThickness / 2, baseThickness + pocketDepth / 2, 0);
  meshes.push(leftMesh);

  // Right Wall: Box sitting on the positive X (right side)
  const geomRight = new THREE.BoxGeometry(wallThickness, pocketDepth, W_in);
  const rightMesh = new THREE.Mesh(geomRight, wallMaterial);
  rightMesh.position.set(L_outer / 2 - wallThickness / 2, baseThickness + pocketDepth / 2, 0);
  meshes.push(rightMesh);

  // Front Wall Tabs: Two front sections leaving an access gap at x = 0
  const gapWidth = Math.max(10, L_in * 0.45);
  const tabLength = (L_outer - gapWidth) / 2;

  if (tabLength > 1) {
    const geomFrontTab = new THREE.BoxGeometry(tabLength, pocketDepth, wallThickness);
    
    // Left Front Tab
    const frontLeftMesh = new THREE.Mesh(geomFrontTab, wallMaterial);
    const flX = -L_outer / 2 + tabLength / 2;
    frontLeftMesh.position.set(flX, baseThickness + pocketDepth / 2, -W_outer / 2 + wallThickness / 2);
    meshes.push(frontLeftMesh);

    // Right Front Tab
    const frontRightMesh = new THREE.Mesh(geomFrontTab, wallMaterial);
    const frX = L_outer / 2 - tabLength / 2;
    frontRightMesh.position.set(frX, baseThickness + pocketDepth / 2, -W_outer / 2 + wallThickness / 2);
    meshes.push(frontRightMesh);
  }

  return meshes;
}
