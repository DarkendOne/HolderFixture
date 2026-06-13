import { AppConfig } from '../lib/app-builder';
import { generateBracket } from './generator';

export const bracketConfig: AppConfig = {
  title: 'BracketCraft',
  tagline: 'Client-Side 3D STL Exporter',
  exportNamePrefix: 'bracket',
  generator: generateBracket,
  presets: {
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
  },
  schema: [
    {
      id: 'width',
      label: 'Horizontal Leg (X)',
      type: 'range',
      min: 20,
      max: 150,
      step: 1,
      default: 50,
      unit: 'mm'
    },
    {
      id: 'height',
      label: 'Vertical Leg (Y)',
      type: 'range',
      min: 20,
      max: 150,
      step: 1,
      default: 60,
      unit: 'mm'
    },
    {
      id: 'depth',
      label: 'Width / Depth (Z)',
      type: 'range',
      min: 10,
      max: 100,
      step: 1,
      default: 30,
      unit: 'mm'
    },
    {
      id: 'thickness',
      label: 'Material Thickness',
      type: 'range',
      min: 2,
      max: 15,
      step: 0.5,
      default: 4,
      unit: 'mm'
    },
    {
      id: 'holeDia',
      label: 'Hole Diameter',
      type: 'range',
      min: 0,
      max: 16,
      step: 0.5,
      default: 5.0,
      unit: 'mm'
    },
    {
      id: 'holeCount',
      label: 'Holes per Leg',
      type: 'range',
      min: 0,
      max: 4,
      step: 1,
      default: 2
    },
    {
      id: 'hasGusset',
      label: 'Add Reinforcing Gusset',
      type: 'checkbox',
      default: true
    },
    {
      id: 'gussetThickness',
      label: 'Gusset Thickness',
      type: 'range',
      min: 1,
      max: 12,
      step: 0.5,
      default: 4.0,
      unit: 'mm',
      showIf: (params) => Boolean(params.hasGusset)
    }
  ]
};
