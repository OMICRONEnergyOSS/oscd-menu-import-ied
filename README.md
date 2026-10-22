# Import IED

An OpenSCD **menu plugin** for importing the first IED from one `.iid`, `.cid`,
or `.icd` file into the current project.

Select **Import IED**, then choose a file. The plugin imports the first IED,
its referenced data types, and communication configuration using
`@openscd/scl-lib`. Additional IEDs in that file are not imported. Existing IEDs
are never replaced: a duplicate name is rejected.

An error dialog explains why an import could not proceed. Cancellation is
silent, and successful imports do not show a confirmation dialog.

## Integration

The module's default export is the `OscdMenuImportIed` class. Register it in the
host's scoped registry under `oscd-menu-import-ied`, then add a menu entry with
`requireDoc: true`. The host supplies `doc` and `docVersion` and handles
`oscd-edit-v2` events, including undo/redo. The plugin does not globally register
itself or mutate the destination before the host applies the edit.

```js
import OscdMenuImportIed from '@omicronenergy/oscd-menu-import-ied';

shell.registry.define('oscd-menu-import-ied', OscdMenuImportIed);
// Include this entry in shell.plugins.menu:
const entry = {
  name: 'Import IED',
  icon: 'input',
  tagName: 'oscd-menu-import-ied',
  requireDoc: true,
};
```

The deployable entry is `oscd-menu-import-ied.js`; the old `scl-import-ied.js`
name is not a compatibility entry. Deploy the accompanying `dist/assets/`
directory as well: the shared SCL library loads its NSD asset during module
initialization. See `demo/plugins.js` for a complete setup with Open, Save, and
Source Editor.

## Development

Use a Node.js version supported by `@omicronenergy/oscd-tooling`.

```sh
npm install
npx tsc --noEmit
npm run build
npm test
npm run lint
npm run bundle
npm run start
```

The shared tooling owns compilation, linting, browser tests, bundling, and
development serving. `npm install` normally runs `prepare` to install Git hooks;
use `npm install --ignore-scripts` when hooks must not be changed. Browser tests
require Playwright Chromium (`npx playwright install chromium` if missing).
`npm run start` serves the standalone demo. Build output is under `dist/`.

## Scope and known limitations

This is a restoration/modernization, not an IEC 61850 validator. The original
single-IED workflow is retained, accepting improvements already present in the
supported SCL library. No library fixes or new admission restrictions are
implemented here.

- No XSD validation, Edition compatibility gate/conversion, dependency
  completeness validation, or comprehensive reference reconciliation.
- XML parsing retains the original first-IED lookup rather than adding a
  parser-error gate. A browser may expose an IED in a partially parsed document;
  such input is not newly rejected merely because a parser-error node exists.
- No batch selection, IED renaming/replacement, or Substation assignment import.
- Communication is merged by subnetwork name without general address-conflict
  checks. The library can retain unrelated `ConnectedAP` children when source
  entries are adjacent without whitespace.
- The library improves type-ID collision handling over the original bundle,
  but can still collide with pending source IDs. Its generated-ID search also
  has a fixed limit.
- Missing referenced types can be imported unresolved. Cyclic type definitions,
  even unused ones, can cause recursive failure; the plugin displays thrown
  failures instead of dispatching prepared edits.
- The shared ordering helper documents a 2007B4 scope. Imports from other schema
  versions are not newly blocked, but schema validity is not guaranteed.
- Namespace/prefix assumptions and repeated dependency traversal are inherited
  from the shared helper. Large or unusual documents need independent review.

All investigation findings and accepted/deferred behavior differences are
recorded in `worklog.md`. Behavioral tests do not certify schema conformance.

## Recovery provenance

Restored from the deployed `scl-import-ied` artifact at commit
`6ecab6644e1d90b45d1e4f28b6b36fa47404b3d9`, rescued from the `oscd-academy`
submodule. Its source map embeds the original TypeScript. The standalone
package is based on `OMICRONEnergyOSS/oscd-plugin-scafold` revision
`bf88432be7fdf3ad950d5af2f7205e7ef5d2b4e0`, retaining only the menu plugin.
