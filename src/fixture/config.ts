import { AppConfig } from '../lib/app-builder';
import { generateFixture } from './generator';

export const fixtureConfig: AppConfig = {
  title: 'FixtureCraft',
  tagline: 'Custom Enclosure & Cradle Exporter',
  exportNamePrefix: 'fixture',
  generator: generateFixture,
  presets: {
    phone: {
      innerLength: 80,
      innerWidth: 16,
      pocketDepth: 45,
      clearance: 0.8,
      baseThickness: 4,
      wallThickness: 3.5,
      flangeWidth: 15,
      holeDia: 4.5,
      fingerCutout: true
    },
    cards: {
      innerLength: 65,
      innerWidth: 92,
      pocketDepth: 25,
      clearance: 1.2,
      baseThickness: 3,
      wallThickness: 2.5,
      flangeWidth: 0,
      holeDia: 0,
      fingerCutout: true
    },
    battery: {
      innerLength: 100,
      innerWidth: 30,
      pocketDepth: 15,
      clearance: 0.4,
      baseThickness: 5,
      wallThickness: 4.0,
      flangeWidth: 12,
      holeDia: 3.5,
      fingerCutout: false
    }
  },
  schema: [
    {
      id: 'innerLength',
      label: 'Inner Length (X)',
      type: 'range',
      min: 20,
      max: 250,
      step: 1,
      default: 75,
      unit: 'mm'
    },
    {
      id: 'innerWidth',
      label: 'Inner Width (Y)',
      type: 'range',
      min: 10,
      max: 180,
      step: 1,
      default: 40,
      unit: 'mm'
    },
    {
      id: 'pocketDepth',
      label: 'Pocket Depth (Z)',
      type: 'range',
      min: 5,
      max: 120,
      step: 1,
      default: 20,
      unit: 'mm'
    },
    {
      id: 'clearance',
      label: 'Clearance Fit',
      type: 'range',
      min: 0,
      max: 3,
      step: 0.1,
      default: 0.6,
      unit: 'mm'
    },
    {
      id: 'baseThickness',
      label: 'Base Thickness',
      type: 'range',
      min: 2,
      max: 15,
      step: 0.5,
      default: 4,
      unit: 'mm'
    },
    {
      id: 'wallThickness',
      label: 'Wall Thickness',
      type: 'range',
      min: 1.5,
      max: 12,
      step: 0.5,
      default: 3,
      unit: 'mm'
    },
    {
      id: 'flangeWidth',
      label: 'Mounting Flange Width',
      type: 'range',
      min: 0,
      max: 40,
      step: 1,
      default: 15,
      unit: 'mm'
    },
    {
      id: 'holeDia',
      label: 'Screw Hole Diameter',
      type: 'range',
      min: 0,
      max: 12,
      step: 0.5,
      default: 4.5,
      unit: 'mm',
      showIf: (params) => parseFloat(params.flangeWidth) > 0
    },
    {
      id: 'fingerCutout',
      label: 'Add Center Push Hole',
      type: 'checkbox',
      default: true
    }
  ]
};
