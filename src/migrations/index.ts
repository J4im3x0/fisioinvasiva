import * as migration_20261116_182632_initial from './20261116_182632_initial';

export const migrations = [
  {
    up: migration_20261116_182632_initial.up,
    down: migration_20261116_182632_initial.down,
    name: '20261116_182632_initial'
  },
];
