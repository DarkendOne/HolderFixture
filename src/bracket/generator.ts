import * as THREE from 'three';

// Create a single shared material for performance
const bracketMaterial = new THREE.MeshStandardMaterial({
  color: 0x00f2fe,
  metalness: 0.8,
  roughness: 0.25,
  side: THREE.DoubleSide
});

/**
 * Procedural geometry generator for the L-Bracket
 */
export function generateBracket(params: Record<string, any>): THREE.Mesh[] {
  const meshes: THREE.Mesh[] = [];

  const width = params.width as number;
  const height = params.height as number;
  const depth = params.depth as number;
  const thickness = params.thickness as number;
  const holeDia = params.holeDia as number;
  const holeCount = params.holeCount as number;
  const hasGusset = params.hasGusset as boolean;
  const gussetThickness = params.gussetThickness as number;

  // ------------------------------------------
  // 1. Horizontal Leg Mesh
  // ------------------------------------------
  const shapeHoriz = new THREE.Shape();
  shapeHoriz.moveTo(0, -depth / 2);
  shapeHoriz.lineTo(width, -depth / 2);
  shapeHoriz.lineTo(width, depth / 2);
  shapeHoriz.lineTo(0, depth / 2);
  shapeHoriz.closePath();

  // Distribute holes
  const horizHolePositions = getHolePositions(width, thickness, holeDia, holeCount);
  for (const holeX of horizHolePositions) {
    const holePath = new THREE.Path();
    holePath.absarc(holeX, 0, holeDia / 2, 0, Math.PI * 2, true);
    shapeHoriz.holes.push(holePath);
  }

  const geomHoriz = new THREE.ExtrudeGeometry(shapeHoriz, {
    depth: thickness,
    bevelEnabled: false
  });

  const horizontalMesh = new THREE.Mesh(geomHoriz, bracketMaterial);
  horizontalMesh.rotation.x = -Math.PI / 2;
  horizontalMesh.position.y = thickness;
  meshes.push(horizontalMesh);

  // ------------------------------------------
  // 2. Vertical Leg Mesh
  // ------------------------------------------
  const shapeVert = new THREE.Shape();
  shapeVert.moveTo(0, -depth / 2);
  shapeVert.lineTo(height, -depth / 2);
  shapeVert.lineTo(height, depth / 2);
  shapeVert.lineTo(0, depth / 2);
  shapeVert.closePath();

  // Distribute holes
  const vertHolePositions = getHolePositions(height, thickness, holeDia, holeCount);
  for (const holeY of vertHolePositions) {
    const holePath = new THREE.Path();
    holePath.absarc(holeY, 0, holeDia / 2, 0, Math.PI * 2, true);
    shapeVert.holes.push(holePath);
  }

  const geomVert = new THREE.ExtrudeGeometry(shapeVert, {
    depth: thickness,
    bevelEnabled: false
  });

  const verticalMesh = new THREE.Mesh(geomVert, bracketMaterial);
  verticalMesh.rotation.z = Math.PI / 2;
  verticalMesh.rotation.y = -Math.PI / 2;
  verticalMesh.position.x = thickness;
  meshes.push(verticalMesh);

  // ------------------------------------------
  // 3. Gusset Mesh (if enabled)
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

    const gussetMesh = new THREE.Mesh(geomGusset, bracketMaterial);
    gussetMesh.position.z = -gussetThickness / 2;
    meshes.push(gussetMesh);
  }

  return meshes;
}

/**
 * Distributes hole offsets dynamically along the centerline of a leg plate
 */
function getHolePositions(length: number, thickness: number, holeDia: number, count: number): number[] {
  const positions: number[] = [];
  if (count <= 0 || holeDia <= 0) return positions;

  const minMargin = thickness + holeDia * 1.5;
  const maxPosition = length - holeDia * 1.5;

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
