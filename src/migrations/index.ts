import * as migration_20261116_182632_initial from './20261116_182632_initial';
import * as migration_20261118_214049_visual_editor from './20261118_214049_visual_editor';

export const migrations = [
  {
    up: migration_20261116_182632_initial.up,
    down: migration_20261116_182632_initial.down,
    name: '20261116_182632_initial',
  },
  {
    up: migration_20261118_214049_visual_editor.up,
    down: migration_20261118_214049_visual_editor.down,
    name: '20261118_214049_visual_editor'
  },
];
