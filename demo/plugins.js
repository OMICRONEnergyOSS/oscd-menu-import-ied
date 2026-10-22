  import {
  OscdMenuOpen,
  OscdMenuSave,
} from '@omicronenergy/oscd-menu-commons';

  import OscdEditorSource from '@omicronenergy/oscd-editor-source';

import OscdMenuImportIed from '../dist/oscd-menu-import-ied.js';

const shell = document.querySelector('oscd-shell');
if (!shell?.registry) {
  throw new Error('Cannot register demo plugins: oscd-shell registry not found');
}

shell.registry.define('oscd-menu-open', OscdMenuOpen);
shell.registry.define('oscd-menu-save', OscdMenuSave);
    shell.registry.define('oscd-editor-source', OscdEditorSource);

shell.registry.define('oscd-menu-import-ied', OscdMenuImportIed);

export const plugins = {
  menu: [
    {
      name: 'Open File',
      icon: 'folder_open',
      tagName: 'oscd-menu-open',
    },
    {
      name: 'Save File',
      icon: 'save',
      requireDoc: true,
      tagName: 'oscd-menu-save',
    },
    {
      name: 'Import IED',
      icon: 'input',
      requireDoc: true,
      tagName: 'oscd-menu-import-ied',
    },
  ],
  editor: [
    {
      name: 'Source Editor',
      icon: 'data_object',
      requireDoc: true,
      tagName: 'oscd-editor-source',
    },
  ],
  background: [],
};
