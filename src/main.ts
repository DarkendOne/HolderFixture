import { AppBuilder } from './lib/app-builder';
import { fixtureConfig } from './fixture/config';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize the engine by passing the schema, config, and selectors
  new AppBuilder(fixtureConfig, 'controls-container', 'canvas-container');
});
