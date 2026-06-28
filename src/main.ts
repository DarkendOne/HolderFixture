import { AppBuilder } from '@darkendone/stl-generator';
import { fixtureConfig } from './fixture/config';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize the engine by passing the schema, config, and root container
  new AppBuilder(fixtureConfig, 'app-root');
});
