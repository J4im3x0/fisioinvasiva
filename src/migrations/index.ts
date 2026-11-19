import * as migration_20261116_182632_initial from './20261116_182632_initial';
import * as migration_20261118_214049_visual_editor from './20261118_214049_visual_editor';
import * as migration_20261118_225425_visual_sections from './20261118_225425_visual_sections';
import * as migration_20261119_003927_site_settings_and_events from './20261119_003927_site_settings_and_events';

export const migrations = [
  {
    up: migration_20261116_182632_initial.up,
    down: migration_20261116_182632_initial.down,
    name: '20261116_182632_initial',
  },
  {
    up: migration_20261118_214049_visual_editor.up,
    down: migration_20261118_214049_visual_editor.down,
    name: '20261118_214049_visual_editor',
  },
  {
    up: migration_20261118_225425_visual_sections.up,
    down: migration_20261118_225425_visual_sections.down,
    name: '20261118_225425_visual_sections',
  },
  {
    up: migration_20261119_003927_site_settings_and_events.up,
    down: migration_20261119_003927_site_settings_and_events.down,
    name: '20261119_003927_site_settings_and_events'
  },
];
