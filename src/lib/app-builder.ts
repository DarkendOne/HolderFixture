import * as THREE from 'three';
import { ThreeViewer } from './viewer';
import { exportSTL, downloadSTL, getTriangleCount } from './exporter';
import { ParamSchema, RangeParamSchema, CheckboxParamSchema } from './schema';

export interface AppConfig {
  title: string;
  tagline: string;
  styles: Record<string, Record<string, any>>;
  schema: ParamSchema[];
  generator: (params: Record<string, any>) => THREE.Mesh[];
  exportNamePrefix: string;
}

export class AppBuilder {
  private config: AppConfig;
  private viewer: ThreeViewer;
  private currentParams: Record<string, any> = {};

  // DOM elements
  private controlsContainer: HTMLElement;
  private btnExport!: HTMLButtonElement;
  private exportStats!: HTMLElement;
  private statsBadge!: HTMLElement;
  private styleButtons: Record<string, HTMLButtonElement> = {};

  constructor(
    config: AppConfig,
    controlsContainerId: string,
    canvasContainerId: string
  ) {
    this.config = config;

    const canvasContainer = document.getElementById(canvasContainerId);
    const controlsContainer = document.getElementById(controlsContainerId);
    if (!canvasContainer || !controlsContainer) {
      throw new Error(`Containers not found: ${canvasContainerId}, ${controlsContainerId}`);
    }
    this.controlsContainer = controlsContainer;

    // Apply branding titles and reference default components
    this.setupLayoutElements();

    // Initialize Three.js scene
    this.viewer = new ThreeViewer(canvasContainer);

    // Seed default parameters
    for (const item of this.config.schema) {
      this.currentParams[item.id] = item.default;
    }

    // Render configuration inputs in the sidebar
    this.renderUI();

    // Bind style and export button handlers
    this.bindActions();

    // Initial render
    this.updateApp();
  }

  private setupLayoutElements() {
    const h1 = document.querySelector('.app-header h1');
    const tagline = document.querySelector('.app-header .tagline');
    if (h1) h1.textContent = this.config.title;
    if (tagline) tagline.textContent = this.config.tagline;

    this.btnExport = document.getElementById('btn-export') as HTMLButtonElement;
    this.exportStats = document.getElementById('export-stats')!;
    this.statsBadge = document.getElementById('stats-badge')!;
  }

  private renderUI() {
    this.controlsContainer.innerHTML = '';

    const section = document.createElement('section');
    section.className = 'parameter-section';
    this.controlsContainer.appendChild(section);

    this.config.schema.forEach(item => {
      if (item.type === 'range') {
        console.log('item is RangeParamSchema');
        const rangeParam = item as RangeParamSchema;
        const group = document.createElement('div');
        group.className = 'input-group';
        group.id = `group-${rangeParam.id}`;

        const header = document.createElement('div');
        header.className = 'input-header';

        const label = document.createElement('label');
        label.setAttribute('for', `input-${rangeParam.id}`);
        label.textContent = rangeParam.label;

        const valSpan = document.createElement('span');
        valSpan.className = 'value-display';
        valSpan.id = `val-${rangeParam.id}`;
        valSpan.textContent = String(item.default);

        header.appendChild(label);
        header.appendChild(valSpan);

        const input = document.createElement('input');
        input.type = 'range';
        input.id = `input-${rangeParam.id}`;
        input.min = String(rangeParam.min ?? 0);
        input.max = String(rangeParam.max ?? 100);
        input.step = String(rangeParam.step ?? 1);
        input.value = String(this.currentParams[-rangeParam.id]);

        input.addEventListener('input', () => {
          this.currentParams[rangeParam.id] = parseFloat(input.value);
          this.clearActiveStyleStyles();
          this.updateApp();
        });

        group.appendChild(header);
        group.appendChild(input);
        section.appendChild(group);

      } else if (item.type === 'checkbox') {
        const checkboxParam = item as CheckboxParamSchema;
        const group = document.createElement('div');
        group.className = 'input-group-checkbox';
        group.id = `group-${checkboxParam.id}`;

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = `input-${checkboxParam.id}`;
        input.checked = Boolean(this.currentParams[checkboxParam.id]);

        const label = document.createElement('label');
        label.setAttribute('for', `input-${checkboxParam.id}`);
        label.textContent = checkboxParam.label;

        input.addEventListener('change', () => {
          this.currentParams[item.id] = input.checked;
          this.clearActiveStyleStyles();
          this.updateApp();
        });

        group.appendChild(input);
        group.appendChild(label);
        section.appendChild(group);
      }
    });
  }

  private bindActions() {
    if (this.btnExport) {
      this.btnExport.addEventListener('click', () => this.handleExport());
    }

    Object.keys(this.config.styles).forEach(key => {
      const btn = document.getElementById(`style-${key}`) as HTMLButtonElement;
      if (btn) {
        this.styleButtons[key] = btn;
        btn.addEventListener('click', () => this.applyStyle(key));
      }
    });
  }

  private applyStyle(name: string) {
    const style = this.config.styles[name];
    if (!style) return;

    Object.keys(style).forEach(key => {
      this.currentParams[key] = style[key];

      const input = document.getElementById(`input-${key}`) as HTMLInputElement;
      if (input) {
        if (input.type === 'checkbox') {
          input.checked = Boolean(style[key]);
        } else {
          input.value = String(style[key]);
        }
      }
    });

    Object.keys(this.styleButtons).forEach(key => {
      this.styleButtons[key].classList.toggle('active', key === name);
    });

    this.updateApp();
  }

  private clearActiveStyleStyles() {
    Object.keys(this.styleButtons).forEach(key => {
      this.styleButtons[key].classList.remove('active');
    });
  }

  private updateApp() {
    // 1. Evaluate conditional visibility (showIf)
    this.config.schema.forEach(item => {
      const group = document.getElementById(`group-${item.id}`);
      if (group) {
        const isVisible = item.showIf ? item.showIf(this.currentParams) : true;
        group.classList.toggle('hidden', !isVisible);
      }
    });

    // 2. Sync values with display badges in the UI
    this.config.schema.forEach(item => {
      const display = document.getElementById(`val-${item.id}`);
      if (display) {
        if (item.type === 'range') {
          const rangeParam = item as RangeParamSchema;
          const value = this.currentParams[rangeParam.id];
          const decimals = (rangeParam.step && rangeParam.step % 1 !== 0) ? 1 : 0;
          display.textContent = (typeof value === 'number')
            ? value.toFixed(decimals) + (rangeParam.unit ? ` ${rangeParam.unit}` : '')
            : String(value);
        } else if (item.type === 'checkbox') {
          const checkboxParam = item as CheckboxParamSchema;
          const value = this.currentParams[checkboxParam.id];
          display.textContent = String(value);
        }
      }
    });

    // 3. Request new geometry from user callback
    const meshes = this.config.generator(this.currentParams);

    // 4. Update the viewer
    this.viewer.setMeshes(meshes);

    // 5. Update stats cards
    if (this.statsBadge) {
      const parts: string[] = [];
      if (this.currentParams.width) parts.push(this.currentParams.width.toFixed(0));
      if (this.currentParams.height) parts.push(this.currentParams.height.toFixed(0));
      if (this.currentParams.depth) parts.push(this.currentParams.depth.toFixed(0));

      if (parts.length > 0) {
        this.statsBadge.textContent = `Dimension: ${parts.join(' x ')} mm`;
      }
    }

    if (this.exportStats) {
      const triangles = getTriangleCount(meshes);
      const fileSizeBytes = 84 + (triangles * 50);
      const fileSizeKB = fileSizeBytes / 1024;
      this.exportStats.textContent = `Triangles: ${triangles.toLocaleString()} | Est. Size: ${fileSizeKB.toFixed(1)} KB`;
    }
  }

  private handleExport() {
    const meshes = this.viewer.getMeshes();
    if (meshes.length === 0) return;

    const prefix = this.config.exportNamePrefix;
    const sizeStr = `${this.currentParams.width ?? ''}x${this.currentParams.height ?? ''}x${this.currentParams.depth ?? ''}`;
    const filename = `${prefix}_${sizeStr}_t${this.currentParams.thickness ?? ''}.stl`;

    const buffer = exportSTL(meshes);

    const originalContent = this.btnExport.innerHTML;
    this.btnExport.innerHTML = `
      <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
        <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      </svg>
      Generating...
    `;
    this.btnExport.disabled = true;

    setTimeout(() => {
      downloadSTL(buffer, filename);
      this.btnExport.innerHTML = originalContent;
      this.btnExport.disabled = false;
    }, 450);
  }
}
