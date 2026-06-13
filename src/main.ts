import { BracketPreview, BracketParams } from './preview';
import { exportSTL, downloadSTL } from './stl-exporter';

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const container = document.getElementById('canvas-container');
  if (!container) return;
  
  // Inputs
  const inputWidth = document.getElementById('input-width') as HTMLInputElement;
  const inputHeight = document.getElementById('input-height') as HTMLInputElement;
  const inputDepth = document.getElementById('input-depth') as HTMLInputElement;
  const inputThickness = document.getElementById('input-thickness') as HTMLInputElement;
  const inputHoleDia = document.getElementById('input-hole-dia') as HTMLInputElement;
  const inputHoleCount = document.getElementById('input-hole-count') as HTMLInputElement;
  const inputGusset = document.getElementById('input-gusset') as HTMLInputElement;
  const inputGussetThickness = document.getElementById('input-gusset-thickness') as HTMLInputElement;
  
  // Displays
  const valWidth = document.getElementById('val-width')!;
  const valHeight = document.getElementById('val-height')!;
  const valDepth = document.getElementById('val-depth')!;
  const valThickness = document.getElementById('val-thickness')!;
  const valHoleDia = document.getElementById('val-hole-dia')!;
  const valHoleCount = document.getElementById('val-hole-count')!;
  const valGussetThickness = document.getElementById('val-gusset-thickness')!;
  
  // Containers
  const gussetThicknessGroup = document.getElementById('gusset-thickness-group')!;
  
  // Action Buttons
  const btnExport = document.getElementById('btn-export') as HTMLButtonElement;
  const btnPresetStandard = document.getElementById('preset-standard') as HTMLButtonElement;
  const btnPresetHeavy = document.getElementById('preset-heavy') as HTMLButtonElement;
  const btnPresetSmall = document.getElementById('preset-small') as HTMLButtonElement;
  
  // Stats
  const exportStats = document.getElementById('export-stats')!;
  const statsBadge = document.getElementById('stats-badge')!;

  // Initialize Preview
  const preview = new BracketPreview(container);

  // Presets Dictionary
  const presets: Record<string, BracketParams> = {
    standard: {
      width: 50,
      height: 60,
      depth: 30,
      thickness: 4,
      holeDia: 5.0,
      holeCount: 2,
      hasGusset: true,
      gussetThickness: 4
    },
    heavy: {
      width: 100,
      height: 120,
      depth: 50,
      thickness: 8,
      holeDia: 8.0,
      holeCount: 3,
      hasGusset: true,
      gussetThickness: 8
    },
    small: {
      width: 30,
      height: 30,
      depth: 15,
      thickness: 3,
      holeDia: 3.0,
      holeCount: 1,
      hasGusset: false,
      gussetThickness: 3
    }
  };

  // Helper to read inputs and get parameter object
  function getParamsFromUI(): BracketParams {
    return {
      width: parseFloat(inputWidth.value),
      height: parseFloat(inputHeight.value),
      depth: parseFloat(inputDepth.value),
      thickness: parseFloat(inputThickness.value),
      holeDia: parseFloat(inputHoleDia.value),
      holeCount: parseInt(inputHoleCount.value, 10),
      hasGusset: inputGusset.checked,
      gussetThickness: parseFloat(inputGussetThickness.value)
    };
  }

  // Update UI Labels and Redraw 3D Viewport
  function updateUI() {
    const params = getParamsFromUI();

    // Toggle gusset controller visibility
    if (params.hasGusset) {
      gussetThicknessGroup.classList.remove('hidden');
    } else {
      gussetThicknessGroup.classList.add('hidden');
    }

    // Update label text values
    valWidth.textContent = params.width.toFixed(0);
    valHeight.textContent = params.height.toFixed(0);
    valDepth.textContent = params.depth.toFixed(0);
    valThickness.textContent = params.thickness.toFixed(1);
    valHoleDia.textContent = params.holeDia.toFixed(1);
    valHoleCount.textContent = params.holeCount.toString();
    valGussetThickness.textContent = params.gussetThickness.toFixed(1);

    // Redraw geometry
    preview.updateGeometry(params);

    // Update viewport badges/stats
    statsBadge.textContent = `Dimension: ${params.width} x ${params.height} x ${params.depth} mm`;

    // Calculate Triangle counts and STL file sizes
    const activeMeshes = preview.getActiveMeshes();
    let totalTriangles = 0;
    activeMeshes.forEach(mesh => {
      const positionAttr = mesh.geometry.getAttribute('position');
      const indexAttr = mesh.geometry.getIndex();
      if (positionAttr) {
        if (indexAttr) {
          totalTriangles += indexAttr.count / 3;
        } else {
          totalTriangles += positionAttr.count / 3;
        }
      }
    });

    const fileSizeBytes = 84 + (totalTriangles * 50);
    const fileSizeKB = fileSizeBytes / 1024;
    exportStats.textContent = `Triangles: ${totalTriangles.toLocaleString()} | Est. Size: ${fileSizeKB.toFixed(1)} KB`;
  }

  // Apply preset parameters
  function applyPreset(name: string) {
    const preset = presets[name];
    if (!preset) return;

    inputWidth.value = preset.width.toString();
    inputHeight.value = preset.height.toString();
    inputDepth.value = preset.depth.toString();
    inputThickness.value = preset.thickness.toString();
    inputHoleDia.value = preset.holeDia.toString();
    inputHoleCount.value = preset.holeCount.toString();
    inputGusset.checked = preset.hasGusset;
    inputGussetThickness.value = preset.gussetThickness.toString();

    // Update preset buttons styling
    [btnPresetStandard, btnPresetHeavy, btnPresetSmall].forEach(btn => {
      btn.classList.remove('active');
    });

    const activeBtn = document.getElementById(`preset-${name}`);
    if (activeBtn) activeBtn.classList.add('active');

    updateUI();
  }

  // Add event listeners to input changes
  const inputs = [
    inputWidth, inputHeight, inputDepth, inputThickness,
    inputHoleDia, inputHoleCount, inputGusset, inputGussetThickness
  ];

  inputs.forEach(input => {
    input.addEventListener('input', () => {
      // Clear preset selection styles if custom adjustments are made
      [btnPresetStandard, btnPresetHeavy, btnPresetSmall].forEach(btn => {
        btn.classList.remove('active');
      });
      updateUI();
    });
  });

  // Checkbox requires change event trigger in some contexts
  inputGusset.addEventListener('change', updateUI);

  // Preset button actions
  btnPresetStandard.addEventListener('click', () => applyPreset('standard'));
  btnPresetHeavy.addEventListener('click', () => applyPreset('heavy'));
  btnPresetSmall.addEventListener('click', () => applyPreset('small'));

  // Export action
  btnExport.addEventListener('click', () => {
    const activeMeshes = preview.getActiveMeshes();
    if (activeMeshes.length === 0) return;

    const params = getParamsFromUI();
    const stlBuffer = exportSTL(activeMeshes);
    const filename = `bracket_${params.width}x${params.height}x${params.depth}_t${params.thickness}.stl`;
    
    // Add micro-feedback transition to the button
    const originalContent = btnExport.innerHTML;
    btnExport.innerHTML = `
      <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
        <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      </svg>
      Generating...
    `;
    btnExport.disabled = true;

    setTimeout(() => {
      downloadSTL(stlBuffer, filename);
      btnExport.innerHTML = originalContent;
      btnExport.disabled = false;
    }, 450);
  });

  // Initial UI Render
  updateUI();
});
