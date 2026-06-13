import { AppBuilder } from './lib/app-builder';
import { bracketConfig } from './bracket/config';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize the engine by passing the schema, config, and selectors
  new AppBuilder(bracketConfig, 'controls-container', 'canvas-container');
});
