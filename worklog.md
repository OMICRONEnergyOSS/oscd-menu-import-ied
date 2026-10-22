# Import IED modernization worklog

## Goal and scope

- Recover the deployed menu plugin as a maintainable standalone TypeScript package using the current OpenSCD plugin standard.
- Plugin selection reconfirmed on 2026-10-22 after comparing `danyill/oscd-import-ieds`: restore the former `scl-import-ied` here under the name `oscd-menu-import-ied`, not the multi-IED plugin.
- Preserve single-file, single-IED import, including dependent data types and communication data.
- Preserve original import behavior and features 1:1; the only intentional functional addition is a localized dialog explaining an import failure. No same-schema restriction, new validation policy, or merge fixes.
- Explicit exception approved subsequently: use supported `@openscd/scl-lib` unchanged and accept its existing import improvements relative to the rescued helper. This does not authorize additional fixes, features, or library changes.
- Exclude multi-IED selection, batch-file import, replacement of existing IEDs, and a general-purpose SCL validator.
- Agreed workspace and planning location: this directory and `worklog.md`.
- Approved implementation destination: this directory; explicit approval recorded below.
- Reference checkouts were kept read-only. Original deployment artifacts have been preserved outside the repository after validating the new bundle (archive location below).

## Resources

| Resource | Location / revision | Role / relevant files or symbols |
|---|---|---|
| Recovery workspace | `/home/steren00/code/OmicronEnergyOSS/oscd-menu-import-ied` | Only `.git`, three deployed code artifacts, and `assets/` existed before this plan |
| Source revision | Deployment `6ecab6644e1d90b45d1e4f28b6b36fa47404b3d9` recovered from academy metadata | Bundle SHA-256 matched this commit exactly; copied Git pointer was archived and an independent repository initialized with approval |
| Original submodule metadata | `/home/steren00/code/OmicronEnergyOSS/oscd-academy/.git/modules/plugins/scl-import-ied` | Local objects and refs survive; academy `.gitmodules` identifies `https://github.com/openenergytools/scl-import-ied`, branch `gh-pages`. User reports upstream was removed from GitHub. No network retrieval attempted |
| Available local history | Submodule `origin/gh-pages` at deployment revision above; local `main` at `6c8bb9a84ed9c16c7618610b0726f9134ef40993` | `main` contains only LICENSE; deployment refs contain built artifacts, not a source project. Source-map recovery remains necessary |
| Original plugin entry (archived) | `scl-import-ied.js:1185-1240` | `ImportIEDPlugin`, `run`, `importIED`, hidden input; preserved in ignored `.recovery/original-deployment/` archive |
| Recoverable TypeScript | `scl-import-ied.js.map`, source index 18, `../../scl-import-ied.ts` | Embedded `sourcesContent` contains the original 1,793-character plugin source |
| Bundled dependency implementation | Source map indices 9-17; bundle lines 81-1183 | Legacy SCL helpers and edit-event factory; evidence, not code to copy wholesale |
| Required scaffold | `/home/steren00/code/OmicronEnergyOSS/oscd-plugin-scafold` at `bf88432be7fdf3ad950d5af2f7205e7ef5d2b4e0` | Clean working tree when inspected; menu-only target |
| Scaffold configuration | `package.json`, `tsconfig.json`, `rollup.config.js`, `demo/plugins.js`, `src/oscd-menu-scafold.ts`, `src/oscd-menu-scafold.spec.ts` | Shared tooling, separate menu/editor entries, scoped menu example, Source Editor demo |
| Target libraries | `@openscd/oscd-api`, `@openscd/scl-lib` | API skills inspected; actual selected package implementation still needs checking |
| Inspected SCL library source | `/home/steren00/code/openscd/scl-lib` at `fb544b679966188aa04e20cc700d5e08ee02398a`, clean; package version 2.0.0 | `tIED/insertIED.ts`, `tBaseElement/getReference.ts`; local checkout evidence, not verification of a fetched package |
| Available schema evidence for DP-7 | `/home/steren00/code/sample-files/20240927 IEC 61850-6 ED2 AMD2 NSD (57_272A)/IEC_61850-6.SCL.2007C5.full/` | Ed. 2.2 / 2007C5 full schema set. Earlier schema sets not found in the bounded searches performed |
| Guidance | `~/.agents/skills/plugin-migration/`, `openscd-plugin-dev/`, `oscd-api/`, `scl-lib/`, `plugin-to-oscd-tooling/`, `iec-61850/` | Migration sequence, stack, edit contract, library mappings, domain constraints |
| Tests and build configuration | None in recovery workspace | Must establish these from scaffold; there is no runnable project baseline |
| Browser | `/usr/bin/google-chrome` | Used in the preceding review for in-memory merge reproductions |
| Implemented entry | `src/oscd-menu-import-ied.ts` | Scoped menu class, original first-file/first-IED flow, supported helper, EditV2 event, localized failure dialog |
| Recovery archive | `.recovery/original-deployment/` | Original JS/map/declaration/NSD asset and exact original TypeScript extracted from the source map; ignored by Git and not shipped. Moved here from session artifacts at the user's request |

### Recovery artifact fingerprints

SHA-256, recorded before implementation:

```text
84a66a03cc7a26a0e6837bc2bd1d66d1ccc097094c757ce4ae55920cc19bdbd3  scl-import-ied.js
b166fb854de5b2d8d515cb29063d74d503b9f87da70c5965dbafd05dc1cd1465  scl-import-ied.js.map
4759e195d200d8027b1d5129918c707a2201d14b0fe0f9a27ed9d6770bcbaf8e  scl-import-ied.d.ts
6d4c32af6316e2ec4c116d16820e46e7f44a6fa9be42081cc7e200dd9142d821  assets/nsd-0a370a57.json
```

## Technical analysis

### Current behavior and architecture

The plugin is a single Lit component. `run()` opens a hidden native file input, accepting `.iid`, `.cid`, and `.icd`. It reads only the first file and selects only the first `IED` element. It rejects an existing IED name without feedback, calls `insertIed`, and dispatches a legacy `oscd-edit` event.

Host coupling is limited to `doc`, legacy `editCount`, and edit-event handling. There are no child components, MWC widgets, legacy wizards, translation calls, custom SVG icons, or global registration calls in the recovered plugin source. The declaration's description about configuring control blocks is stale.

The bundle includes `@openenergytools/scl-lib` and `@openscd/open-scd-core`. Its type-import helper traces dependencies, reuses exactly equal definitions, and prefixes conflicting IDs with the IED name. Its communication helper merges subnetworks by name. The bundle also performs unused address-generator work and fetches an NSD JSON asset at module evaluation; neither provides import validation.

### Migration inventory

| Area | Current evidence | Target / remaining changes | Dependencies / risks |
|---|---|---|---|
| Package, scaffold and tooling | No manifest, source tree, tests, CI, README, or usable Git metadata | Canonical scaffold, menu-only entry, strict TS, Lit 3, shared `@omicronenergy/oscd-tooling`, package exports, demo and release configuration | Restore usable Git context before hook-installing package commands; do not alter history or staging |
| Host contract | `doc` and `editCount` | Optional/no-document-safe `doc`; `docVersion?: unknown`; retain only needed contract properties | Require an open document in demo registration and guard runtime entry |
| Edit events | `newEditEvent` from legacy core, event name `oscd-edit` | `EditV2` types from `@openscd/oscd-api`; `newEditEventV2` from `@openscd/oscd-api/utils.js` | No deprecated Create/Delete action conversion is needed |
| Shared SCL helpers | Bundled `@openenergytools/scl-lib` implementation | Establish behavior-preserving dependency strategy before implementation | Current supported helper has demonstrated output differences; automatic substitution is not parity |
| Document mutation | Source nodes are renamed/moved; host document changes are emitted as inserts | Plan against a private source document and emit destination edits; no live destination mutation while preparing import | Verify original source preservation where applicable and undo/redo after host adoption |
| UI | Hidden native input only | Keep native picker; add visible, accessible, localized outcome/error reporting using the established UI stack where needed | Load `oscd-ui` API guidance before selecting concrete components |
| Localization | No messages currently | New source-locale messages via `@lit/localize` `msg()` | No translation-key migration needed |
| Wizards / icons / dialogs | None | Do not add SCL dialog hosting, icon wrappers, or migration adapters without a real need | Skip inapplicable recipe phases |
| SCL behavior | See defects below | Preserve original admission and merge behavior; document all issues | No new Edition/dependency restrictions or schema-conformance claim |
| Tests / demo | None | Co-located tests, XML fixtures, standalone shell demo with Source Editor, CI | Verify final document, not just emitted event shape |

### Confirmed legacy defects and deferred corrections

The corrections in items 1-3 below are deferred. Item 4's failure dialog remains in scope; do not add validation that rejects imports the original accepted. All issue findings remain recorded. User explicitly accepts the existing supported-helper improvements; use it unchanged without claiming all defects are fixed.

1. New subnetworks are cloned wholesale, including `ConnectedAP` entries for IEDs that are not imported (`scl-import-ied.js:927-966`). Copy only communication associated with the imported IED, retaining the required subnetwork metadata.
2. Renaming a conflicting type to `IED-name + old-ID` can collide with an existing ID (`984-1073`). Allocate a genuinely unique valid ID against both destination and pending additions, updating all relevant references.
3. Missing referenced types are not rejected (`969-982`, `1075-1132`). Detect unresolved dependencies before dispatch; cover the complete relevant type-reference chain, not just `lnType`.
4. Parse failures, duplicate names, missing IEDs, and absent destination documents lack useful reporting (`1195-1212`). Make failure and cancellation distinguishable; never dispatch partial edits on preflight failure.

### Risks, alternatives and deferred work

- Latest accepted scope: original single-IED import behavior, with failure dialog only. Reliable merging is not guaranteed; findings are recorded rather than fixed. No selection wizard or schema gate.
- Multi-IED import is deferred. It needs coordinated pending-edit state and shared-type handling, not repeated calls to the current single-IED helper.
- Keep the first-IED behavior explicit when a source contains multiple IEDs; do not silently expand to batch import.
- Use supported `@openscd/scl-lib` unchanged; user explicitly accepts its existing improvements. No shared-library fixes, importer fork, or compensation logic is authorized.
- Do not reject an import merely because Edition declarations differ. Original Edition handling is preserved; no conversion or new conformance guarantee is introduced.
- Broader project-wide address allocation, semantic validation, Substation integration, and external-reference reconciliation are not part of a general validator here. Report unsupported conditions; do not claim comprehensive IEC conformance.
- Record repeated dependency traversal and cycle/scale risks without rewriting the importer in this migration.
- Do not copy the unused NSD fetch, address-generator initialization, or stale descriptions into the recovered implementation.
- Do not copy scaffold development history, worklog, `.git`, dependencies, generated bundles, or unused editor example.
- Preserve existing recovery artifacts until replacement outputs and deployment-entry compatibility are reviewed. Do not overwrite them during initial recovery.
- Only the explicitly approved fresh repository initialization was authorized and completed. No further Git-writing actions are authorized.

### DP-7 investigation: Edition support

Historical investigation: the same-schema proposal below was selected earlier but is superseded by the latest 1:1 parity instruction. No Edition admission gate is now planned, and B4 schema acquisition is not a migration blocker. Findings remain relevant limitations, not support guarantees.

- The inspected `@openscd/scl-lib` 2.0.0 `insertIed` implementation (`tIED/insertIED.ts:395-420`) does not check or convert source/destination schema versions. It moves the selected IED and type definitions and copies communication data.
- Its `getReference` (`tBaseElement/getReference.ts:3-10`) explicitly limits its documented ordering guarantee to Edition 2.1 / 2007B4. This is not proof that every import into another Edition fails, but it is not a cross-Edition compatibility guarantee.
- The available `SCL.xsd:1-15,40-42` identifies Edition 2.2 / 2007C5 and requires that exact root version/revision/release. The namespace remains `http://www.iec.ch/61850/2003/SCL`; namespace equality cannot identify an Edition.
- `SCL_IED.xsd:85-87` supplies defaults of 2003/A/1 for omitted `originalScl*` attributes. Copying an IED from another schema without understanding that schema's defaults can change effective interpretation; these attributes describe IED provenance, not the containing file's schema.
- A schema identity comparison must use the root SCL declarations and schema-defined defaults where applicable, not Header revision or IED provenance. Missing declarations must not be guessed from namespace or treated as malformed without accounting for the applicable older schema rules.
- Matching schema identity is a conservative admission rule, not sufficient validation. Resulting type references, ordering, and required content still need verification.
- Selected policy: support same-schema import initially, with 2007B4 as the first validation target. Block cross-schema imports with actionable feedback; do not relabel the destination, drop unsupported content, or convert implicitly. Obtain the matching B4 schemas before claiming support. Add C5 or older schema identities only with matching fixtures and schema verification.
- Broader alternative: validate each candidate merged result against the destination schema and accept cross-schema input only when its resulting content is compatible, preserving effective defaults and IED provenance. This is more capable but adds validation infrastructure and Edition-sensitive semantics; it is not merely comparing version strings.
- No runtime import or schema validation was run in this investigation. User selected the conservative policy; DP-7 is decided, but schema acquisition and verification remain implementation prerequisites. No Edition is newly certified by this analysis.

## Questions and decisions

| ID | Question / options | Answer / rationale / affected phases | Status |
|---|---|---|---|
| DP-1 | Authoritative checkout or recovery from artifacts? | User: "Recover the source from these artifacts and use this directory". Recover embedded source; preserve provenance. | decided |
| DP-2 | Technical migration, corrected single-IED import, or multi-IED feature? | Initially "Single-IED modernization plus import correctness fixes"; later narrowed by DP-4 to defer merge fixes and dependency validation, retaining the same-schema restriction and error dialog. No batch selection feature. | superseded in part by DP-4 |
| DP-3 | How should the invalid Git context be restored? | User chose "Initialize a fresh independent repository here; preserve the old pointer outside it". Pointer preserved in session artifacts; `git init -b main` succeeded. No staging, commits, remote, or academy changes. | resolved |
| DP-4 | What if the current shared import helper still has the defects? | User subsequently: "the scl-lib changes are only improvements - I think thats ok". Use supported helper unchanged; existing helper improvements are an accepted exception to exact output parity. All findings retained; additional fixes, dependency validation, library edits and importer forks deferred. No Edition gate. | decided |
| DP-5 | Which importer is the migration basis after comparison? | User reconfirmed the former `scl-import-ied`, renamed `oscd-menu-import-ied`. Multi-IED plugin migration is not in scope. | decided |
| DP-6 | Must the old `scl-import-ied.js` deployment URL continue to work? | The new name is confirmed; retaining an old-entry compatibility alias is not yet decided. User: no, the old name can go.| decided |
| DP-7 | Which Edition combinations will the importer support? | Earlier same-schema restriction superseded by latest 1:1 parity instruction. Preserve original admission behavior with no new Edition gate or conversion. Schema limitations documented; B4 acquisition no longer blocks migration. | decided |
| DP-8 | How will errors and outcomes be presented? | User: "Error dialog only; silent cancellation and no success dialog". Keep native picker; use plugin-local scoped `OscdDialog` with localized actionable error details and Close. Verify focus/keyboard behavior and concrete component API during implementation; UI reference confirms class/path, local implementation not yet located. No success claim based merely on edit-event dispatch. | decided |

### DP-4 investigation: current shared importer

Inspected clean local `@openscd/scl-lib` 2.0.0 at `fb544b679966188aa04e20cc700d5e08ee02398a`. No library files changed or dependencies installed. This establishes checkout behavior, not the contents of a separately fetched npm package.

Isolated probes used Node 24's `node:module.stripTypeScriptTypes` in transform mode on the actual `foundation/utils.ts`, `tBaseElement/tags.ts`, `tBaseElement/getReference.ts`, and `tIED/insertIED.ts`. Imports/exports were removed only in memory to run those modules together in headless Chrome using native XML DOM; insertion edits were applied using `parent.insertBefore`. Fixtures were behavioral examples, not schema-conformance fixtures. The first harness failed due to newline escaping; the corrected harness produced the results below. No test suite or XSD validation was run.

| Probe | Observed result | Assessment |
|---|---|---|
| New subnetwork, whitespace between ConnectedAP siblings | Only selected SYS IED's ConnectedAP imported | Original wholesale-copy defect has been addressed for this layout |
| Same siblings with no intervening whitespace | SYS and unrelated OTHER ConnectedAP imported | Remaining library defect: `getNewSubNetwork` removes nodes during live `childNodes.forEach`, skipping adjacent children |
| Existing generated type ID `X@SYS#1` | Generated `X@SYS#2` | Original simple-prefix collision improved |
| Pending source LNodeType already uses `X@SYS#1`, while source X conflicts with destination X | Two imported LNodeTypes both named `X@SYS#1` | Remaining library defect: generated IDs check destination, not all pending source IDs |
| IED references missing LNodeType | IED imported without matching type | Still permissive; plugin preflight required by agreed stricter behavior |
| Unrelated self-referencing DOType in source templates | `RangeError: Maximum call stack size exceeded` | Dependency traversal scans even unused source types and has no recursion-cycle protection |

Relevant source: `tIED/insertIED.ts:16-25` (live NodeList removal), `:99-140` (reverse recursive dependency search), `:152-172` (ID allocator), `:395-420` (entry point). `insertIED.spec.ts:81-82` explicitly tests acceptance of incomplete IEDs; imposing strict validity on all library callers would therefore change its existing contract.

Historical recommendation for decision (superseded where it conflicts with the latest parity requirement):

- Keep the supported helper; do not copy its approximately 420-line implementation into the plugin.
- Fix general-purpose merge defects (adjacent communication siblings, pending-ID collisions, cycle safety) in `scl-lib`, with focused regression tests. This is a separate repository scope requiring approval and a released dependency before plugin completion; a local checkout change alone does not fix the published plugin.
- Put the stricter admission policy in plugin preflight: supported schema pairing, usable IED name, complete required dependency closure, and useful user-facing errors. Preserve the library's intentionally permissive incomplete-IED contract.
- Alternative if a library release is unavailable: a separately approved bounded local merge implementation. It avoids release coupling but creates duplicated SCL logic and ongoing divergence; do not silently substitute monkey patches, XML reformatting, or post-hoc edit filtering.
- User chose "Defer correctness fixes and migrate existing behavior only", then confirmed "Retain same-schema restriction and error dialog; defer merge fixes and dependency validation". Shared merge fixes, local merge replacements, and stricter dependency validation are deferred. DP-7 and DP-8 remain in scope.
- B4 schema acquisition remains a separate prerequisite for any B4 conformance claim; these behavioral probes do not certify schema validity.

## Migration plan

| Step | Goal / changes | Prerequisites / decisions | Verification / exit criteria |
|---|---|---|---|
| 1 | Inspect artifacts, confirm recovery and feature scope, document plan | DP-1 and DP-2 | Worklog populated; plan pending approval |
| 2 | Recover only plugin TypeScript, establish scaffold-based menu package | Explicit plan approval; DP-3 resolved before hook-installing commands | Strict TS, supported dependencies, build/bundle, menu loads; artifacts preserved |
| 3 | Update host contract and EditV2 event; evaluate current SCL import helper | Step 2; inspect actual helper implementation and API | `oscd-edit-v2` emitted with valid EditV2 detail; destination unchanged until commit; host undo/redo works |
| 4 | Verify original import parity and document known defects | Parity-preserving dependency strategy agreed | Original admission and resulting import behavior retained, including cross-schema handling; no fixes |
| 5 | Add clear localized outcomes, cancellation handling, and safe repeated use | Existing single-IED flow retained; select accessible feedback API | Errors visible; same file can be retried; no silent duplicate rejection; native picker remains |
| 6 | Finish demo, focused fixtures/tests, documentation and package cleanup | Steps 2-5 | Source Editor demo works; only intended menu export ships; support limits documented |

### Phase details

- Step 2: proposed source `src/oscd-menu-import-ied.ts`, co-located spec, `package.json`, lockfile, thin tooling configs, demo, README, and CI adapted from the inspected scaffold. Remove every unused editor source/spec/export/Rollup/demo reference. Preserve Source Editor. Keep a thin Rollup override only if entry naming requires it.
- Step 3: no legacy wizard, deprecated action-event adapter, or MWC replacement phase is required. The scaffold demo includes an EditV1 listener; retain it only if a remaining demo dependency actually requires it, not for this EditV2 plugin.
- Step 4: compare migrated import behavior with the recovered original on focused fixtures. Do not add schema-identity checks, dependency validation, merge fixes, or a library patch. Record all known limitations.
- Step 5: localized error dialog explains failure to read/parse/select an IED, missing destination, duplicate-name rejection, or a surfaced helper failure. Report failures without imposing additional admission rules on otherwise accepted inputs. No unsupported-schema rejection or promised detection of unresolved dependencies. Cancellation is silent; no success dialog. No IED renaming or replacement wizard.
- Step 6: ship only the new `oscd-menu-import-ied.js` entry. DP-6 explicitly allows the old name to go; no compatibility alias is required.

### Verification strategy

Proposed implementation commands, not yet run:

1. After structural changes: `npm i`, `npx tsc --noEmit`, `npm run build`, in that order. Package preparation can install hooks; do not run while Git context is invalid or without respecting the no-Git-write boundary.
2. Focused Web Test Runner selectors using the scaffold's actual runner configuration; then `npm test`, `npm run lint`, and `npm run bundle` for release readiness. Do not invoke formatting-only tooling.
3. Inspect package contents with `npm pack --dry-run` and bundle output. Ensure source/specs, stale editor bundles, and unused assets cannot ship.

Focused cases:

- One valid IED, repeated file selection, cancellation, no open destination, malformed XML, no IED, duplicate IED name.
- Multiple source IEDs: only the first is imported. Match original communication behavior; leakage is a documented defect, not a required fix.
- Basic communication import for new and existing subnetworks. Adjacent-sibling leakage remains a documented helper defect; do not assert universal exclusion.
- Verify dependent-type import and conflict behavior against the chosen supported helper. Record differences from the recovered original, including generated-ID naming; existing helper improvements are explicitly accepted.
- No new missing-dependency or cyclic-type validation; surface helper errors if thrown without silently reporting success.
- Preserve original namespace and Edition admission behavior, including differing root schema declarations. Do not claim schema validity based on parity tests.
- Dispatch and apply the complete EditV2 operation in the shell; verify undo/redo returns the document to its expected state.
- Record existing recursion and scale limitations; do not turn this migration into an algorithm/performance rewrite.

## Plan approval

- Revision: 4, 2026-10-22; original feature parity plus failure dialog, accepting existing supported-helper improvements.
- Status: approved. User: "ok, I approve the plan, please proceed" (2026-10-22); user also marked Step 2 approved.
- Approved scope: menu-only recovery/scaffold, supported SCL helper unchanged, host/EditV2 modernization, original plugin features/admission plus error dialog, tests/demo/documentation. No Edition gate, dependency validator, merge fixes, staging or commits.
- Owner scope decisions resolved; no schema gate, schema-acquisition blocker, or helper ownership decision remains. Dialog API checked against the installed package during implementation.
- Approval covers revision 4's final scope, including accepted existing supported-helper improvements.
- Git prerequisite resolved: independent repository initialized with explicit approval; original deployment revision established. No staging or commits were performed.
- Shared-helper defects are explicitly deferred; no library change or local importer fork is a migration prerequisite.
- Implementation completed within the approved scope; future behavioral changes require a separate decision.

## Step Status

| Step | Status | Evidence / next action |
|---|---|---|
| 1 - Planning | done | Final revision 4 scope explicitly approved |
| 2 - Recovery and scaffold | done | Menu-only package, shared tooling, strict TS, demo and configuration build |
| 3 - Host API and edits | done | EditV2, docVersion, real-shell import/undo/redo exercised |
| 4 - Behavior parity | done | First file/IED, duplicates and permissive Edition/dependency behavior covered; accepted helper improvements retained |
| 5 - Feedback | done | Localized scoped error dialog, silent cancellation/retry; keyboard and accessibility verified in bundled demo |
| 6 - Release readiness | done | 13 browser tests, type-check, build, lint, bundle and package inspection passed; workflows configured, not remotely executed |

## Step 1 Completion Summary

### Files created

- `worklog.md` - recovery provenance, current behavior, modernization inventory, scope decisions, risks, phased plan, and verification gates. No implementation files changed.

### Verification

- `git --no-pager status --short` in the recovery workspace failed because the submodule Git directory is missing; source revision and dirty state remain unavailable.
- Read and parsed the deployed bundle/source map in the preceding review. Confirmed recoverable plugin source and legacy library provenance.
- The preceding review ran the bundled merge helpers in headless Chrome against three in-memory examples: unrelated IED communication was copied; generated type IDs collided; an unresolved `lnType` was accepted. These are legacy baseline observations, not tests of the target library.
- `git -C /home/steren00/code/OmicronEnergyOSS/oscd-plugin-scafold --no-pager status --short`, `rev-parse HEAD`, and `ls-files` succeeded: clean scaffold at the revision recorded above.
- `sha256sum scl-import-ied.js scl-import-ied.js.map scl-import-ied.d.ts assets/nsd-0a370a57.json` succeeded; recovery fingerprints recorded above.
- Subsequent isolated headless Chrome probes of the supported helper were run and are recorded under DP-4, including communication leakage, pending-ID collisions, missing dependencies, and cyclic recursion. These were behavioral probes, not schema validation or a full library test run.
- At planning completion, build, type-check, lint, installation, schema validation, and implementation tests had not been run; the recovery workspace then had no package manifest. Later implementation results are recorded in Steps 2-6.

### Decision points applied

- DP-1: recover from deployed artifacts in this directory.
- DP-2/DP-4: preserve original plugin features and admission behavior, accepting existing supported-helper improvements. Additional merge fixes and dependency validation are deferred; all findings retained.
- DP-3: independent Git setup completed with explicit approval; no staging, commits, or remotes.
- DP-5/DP-6: restore this plugin as `oscd-menu-import-ied`; no old-entry alias.
- DP-7: no new Edition gate; earlier same-schema restriction superseded.
- DP-8: localized error dialog only; silent cancellation and no success dialog.
- Planning completion did not itself authorize implementation. Explicit approval was subsequently received and is recorded in Plan approval.

## Step 2 Completion Summary

### Files created / transformed

- `package.json`, `package-lock.json`, `tsconfig.json`, `eslint.config.js`, `.gitignore`, `.editorconfig`, `LICENSE` - menu-only scaffold adaptation using the inspected canonical revision and shared tooling. No editor example, local Rollup override, or custom manifest generator is needed.
- `src/oscd-menu-import-ied.ts` - recovered original flow adapted to strict TypeScript and scoped Lit 3; original unmodified TypeScript extracted into the recovery archive for provenance.
- `demo/index.html`, `demo/plugins.js`, `demo/sample.scd` - standalone shell with Open/Save and Source Editor alongside Import IED. No EditV1 adapter required by this plugin.
- Original deployment files moved to the archive recorded in Resources after fingerprint verification and successful new bundle validation. No old-entry compatibility alias ships, per DP-6.
- At the user's request, the archive was subsequently moved from session storage to `.recovery/original-deployment/`, with `.recovery/` added to `.gitignore`. `git check-ignore` confirmed exclusion and all four original deployment fingerprints remained unchanged.

### Verification

- `npm install --ignore-scripts --no-audit --no-fund && npx tsc --noEmit && npm run build` passed for initial scaffolding and after structural changes.
- Install lifecycle scripts were intentionally skipped to avoid unauthorized hook/config writes; `prepare` is retained for normal owner-managed installs. No hooks installed by this task.
- Original `sha256sum` fingerprints matched before archiving.

## Step 3 Completion Summary

### API replacements applied

- `newEditEventV2` from `@openscd/oscd-api/utils.js` replaces legacy core `newEditEvent`; event payload is `{ edit }` on `oscd-edit-v2`.
- `docVersion?: unknown` replaces legacy `editCount`; no host transaction class or legacy edit adapter embedded in the plugin.
- Supported `@openscd/scl-lib` 2.0.0 supplies `insertIed` unchanged. Installed package source was inspected and matched the relevant logic of the previously reviewed checkout.

### Verification

- Type-check and build passed. Browser tests confirm no destination mutation before commit, no legacy event, and one real shell transaction with exact serialized undo/redo restoration.

## Step 4 Completion Summary

### Decision points applied

- DP-4: supported helper improvements accepted; no library patch, local merge fork, or additional correctness fixes.
- DP-7: no new schema compatibility gate or dependency validation. A mixed-root-schema, missing-template fixture still dispatches an import.
- Original single-file/first-IED behavior and duplicate-name refusal retained. Generated conflicting type IDs now follow supported-helper naming, as explicitly accepted.

### Known issues preserved

- All original and current-helper findings remain in the earlier analysis and README: communication leakage, pending-ID collisions, permissive unresolved references, recursive cycles, schema/namespace/scale limits, and absent system-wide reconciliation.
- New finding during browser testing: Chrome may retain an IED in a parser-error document. Preserved the original first-IED lookup rather than introducing a parser-error admission gate; documented and covered by a focused test.

### Verification

- Final `npm test` passed all 13 cases, including supported-helper nested type import, communication and conflict naming, rejection/error paths, and permissive legacy admission.

## Step 5 Completion Summary

### Files transformed

- `src/oscd-menu-import-ied.ts` - `OscdDialog` and `OscdTextButton` registered locally, `msg()`/`str` messages, explicit missing-destination/IED/duplicate/read/helper failure feedback. Cancellation is silent; no success dialog or new import wizard.
- Same file can be reselected and retried. Exception handling reports the failure rather than silently catching or emitting success-shaped fallbacks.

### Verification

- Tests cover actual scoped dialog upgrade, dismissal and retry, cancellation and file input reset.
- Finite Playwright smoke probes served only `dist/` over a temporary loopback HTTP server and loaded the bundled demo: dialog visible, Escape dismissed it, and Source Editor rendered with no page errors.
- Chrome CDP `Accessibility.getFullAXTree` exposed the native modal alertdialog, heading, message and Close button as non-ignored nodes; focus entered the Close button. Playwright's DOM-derived ARIA snapshot was empty due to the shell's offscreen wrapper, so the actual browser accessibility tree was checked rather than assuming failure from that proxy.
- Temporary HTTP servers and browsers were closed by the probe commands; no service left running.
- Follow-up UI correction: wrapped Close in a `div` assigned to the dialog's `actions` slot. Directly slotting the button applied action-container flex/padding styles to the button, causing full-width presentation. No import behavior changed.
- Follow-up verification: `npx tsc --noEmit && npm test && npm run bundle` passed (13 tests). The dismissal/retry case now measures a nonzero compact button width, less than half the action row, and standard 24px right inset.

## Step 6 Completion Summary

### Files created / transformed

- `src/oscd-menu-import-ied.spec.ts` - 13 focused browser cases including integration with the real shell transaction handler.
- `README.md` - workflow, host integration, development commands, deployment asset requirement, provenance and known limitations.
- `.github/workflows/` and release-please configuration - scaffold-derived unit-test, deployment and release setup. No remote actions triggered or publishing performed.
- Package `files` excludes specs/tests and bundled demo; demo remains in deployable `dist/` output.

### Verification

- Final `npm install --ignore-scripts --no-audit --no-fund`, `npx tsc --noEmit`, `npm run build`, `npm test`, `npm run lint`, and `npm run bundle` all passed. No formatting-only tooling invoked.
- First test run had three fixture failures: shell import was erased as type-only, and a malformed-XML expectation contradicted Chrome's retained partial IED behavior. Fixed test module loading, preserved parser behavior, and added a partial-input parity case; final 13 cases passed.
- `npm pack --dry-run --json --ignore-scripts` inspected: only LICENSE, README, package metadata, plugin JS/map/declaration and required shared-library NSD asset included. No source/spec/demo/old-entry artifacts shipped. `dist/` contains only intended plugin/demo outputs, not copied source.
- Bundled output contains `oscd-edit-v2`. Shared root library import retains an NSD startup fetch; required generated asset is bundled and documented rather than removed or silently broken.
- `git status --short` shows new untracked project files; no staging or commits. An origin remote is now present when read back, but was not configured by this task and was left unchanged. `core.hooksPath` remains unset.
- Build/type/runtime verification is local. Reusable GitHub workflows, npm publication, and comprehensive IEC schema conformance were not executed or certified.

## Resume and remaining work

- Approved migration is complete; all six steps are done. Source, package/lockfile, demo, tests, documentation, and CI/release configuration persist in this workspace.
- Final scope: original single-file/first-IED workflow, current supported SCL helper unchanged (its existing improvements accepted), EditV2/docVersion modernization, and localized failure dialog. No Edition gate, new dependency validation, merge fixes, batch import, or replacement workflow.
- Local verification passed: strict type-check, build, 13 Chromium tests, lint, bundle, package-content inspection, bundled demo/Source Editor loading, error-dialog keyboard dismissal, and browser accessibility-tree inspection.
- Original deployment and recovered original TypeScript are retained in ignored `.recovery/original-deployment/`. Fingerprints match the recorded originals. They are not runtime dependencies or published package contents and may be removed when the owner is satisfied.
- Independent Git context is usable. No staging, commits, pushes, or hook installation were performed by this task; the owner-configured origin was left unchanged.
- No immediate implementation work or unresolved scope decisions remain. Owner review/manual acceptance, staging/committing, hook setup, and publishing remain owner-controlled; GitHub workflows have not been remotely exercised.
- Known library/import defects and IEC/schema limitations remain documented and deliberately deferred. No comprehensive IEC conformance claim is made.
