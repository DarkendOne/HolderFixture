import { AppConfig } from '../lib/app-builder';
import { generateFixture } from './generator';
import { FixtureParameters, CheckboxParamSchema, RangeParamSchema } from '../lib/schema';

export class BracketParameters extends FixtureParameters {
  innerLength: RangeParamSchema = {
    id: 'innerLength',
    label: 'Inner Length (X)',
    type: 'range',
    min: 20,
    max: 250,
    step: 1,
    default: 75,
    value: 75,
    unit: 'mm'
  };

  innerWidth: RangeParamSchema = {
    id: 'innerWidth',
    label: 'Inner Width (Y)',
    type: 'range',
    min: 10,
    max: 180,
    step: 1,
    default: 40,
    value: 40,
    unit: 'mm'
  };
  pocketDepth: RangeParamSchema = {
    id: 'pocketDepth',
    label: 'Pocket Depth (Z)',
    type: 'range',
    min: 5,
    max: 120,
    step: 1,
    default: 20,
    value: 20,
    unit: 'mm'
  };
  clearance: RangeParamSchema = {
    id: 'clearance',
    label: 'Clearance Fit',
    type: 'range',
    min: 0,
    max: 3,
    step: 0.1,
    default: 0.6,
    value: 0.6,
    unit: 'mm'
  };
  baseThickness: RangeParamSchema = {
    id: 'baseThickness',
    label: 'Base Thickness',
    type: 'range',
    min: 2,
    max: 15,
    step: 0.5,
    default: 4,
    value: 4,
    unit: 'mm'
  };
  wallThickness: RangeParamSchema = {
    id: 'wallThickness',
    label: 'Wall Thickness',
    type: 'range',
    min: 1.5,
    max: 12,
    step: 0.5,
    default: 3,
    value: 3,
    unit: 'mm'
  };
  flangeWidth: RangeParamSchema = {
    id: 'flangeWidth',
    label: 'Mounting Flange Width',
    type: 'range',
    min: 0,
    max: 40,
    step: 1,
    default: 15,
    value: 15,
    unit: 'mm'
  };
  holeDia: RangeParamSchema = {
    id: 'holeDia',
    label: 'Screw Hole Diameter',
    type: 'range',
    min: 0,
    max: 12,
    step: 0.5,
    default: 4.5,
    value: 4.5,
    unit: 'mm',
    showIf: (params: FixtureParameters) => (params as BracketParameters).flangeWidth.value > 0
  }
  fingerCutout: CheckboxParamSchema = {
    id: 'fingerCutout',
    label: 'Add Center Push Hole',
    type: 'checkbox',
    default: true,
    value: true
  };

  constructor(styleId: string,
    displayStyleName: string,
    innerLength: number,
    innerWidth: number,
    pocketDepth: number,
    clearance: number,
    baseThickness: number,
    wallThickness: number,
    flangeWidth: number,
    holeDia: number,
    fingerCutout: boolean) {
    super(styleId, displayStyleName);
    this.innerLength.value = innerLength;
    this.innerWidth.value = innerWidth;
    this.pocketDepth.value = pocketDepth;
    this.clearance.value = clearance;
    this.baseThickness.value = baseThickness;
    this.wallThickness.value = wallThickness;
    this.flangeWidth.value = flangeWidth;
    this.holeDia.value = holeDia;
    this.fingerCutout.value = fingerCutout;

    this.params.set('innerLength', this.innerLength);
    this.params.set('innerWidth', this.innerWidth);
    this.params.set('pocketDepth', this.pocketDepth);
    this.params.set('clearance', this.clearance);
    this.params.set('baseThickness', this.baseThickness);
    this.params.set('wallThickness', this.wallThickness);
    this.params.set('flangeWidth', this.flangeWidth);
    this.params.set('holeDia', this.holeDia);
    this.params.set('fingerCutout', this.fingerCutout);
  }


  generateFilename(): string {
    return `fixture`;
  }
}


export const fixtureConfig: AppConfig<BracketParameters> = {
  title: 'FixtureCraft',
  tagline: 'Custom Enclosure & Cradle Exporter',
  exportNamePrefix: 'fixture',
  generator: generateFixture,
  styles: {
    phone: new BracketParameters('phone', 'Phone',
      80,
      16,
      45,
      0.8,
      4,
      3.5,
      15,
      4.5,
      true
    ),
    cards: new BracketParameters('cards', 'Cards',
      65,
      92,
      25,
      1.2,
      3,
      2.5,
      0,
      0,
      true
    ),
    battery: new BracketParameters('battery', 'Battery',
      100,
      30,
      15,
      0.4,
      5,
      4.0,
      12,
      3.5,
      false
    ),
    underDesk: new BracketParameters('underDesk', 'Under Desk',
      150,
      60,
      40,
      1.0,
      5,
      4,
      20,
      5,
      false
    )
  }
};
