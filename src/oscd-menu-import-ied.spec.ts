import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdShell } from '@omicronenergy/oscd-shell/oscd-shell.js';

import OscdMenuImportIed from './oscd-menu-import-ied.js';

import type { EditV2 } from '@openscd/oscd-api';

customElements.define('oscd-menu-import-ied', OscdMenuImportIed);

// Minimal behavioral fixtures, not schema-conformance examples.
const source = `<SCL xmlns="http://www.iec.ch/61850/2003/SCL"
  version="2007" revision="B" release="4">
  <Communication>
    <SubNetwork name="LAN" type="8-MMS">
      <BitRate unit="b/s" multiplier="M">100</BitRate>
      <ConnectedAP iedName="First" apName="AP"/>
    </SubNetwork>
  </Communication>
  <IED name="First">
    <AccessPoint name="AP">
      <Server>
        <LDevice inst="LD">
          <LN0 lnClass="LLN0" inst="" lnType="ln1"/>
        </LDevice>
      </Server>
    </AccessPoint>
  </IED>
  <IED name="Second"/>
  <DataTypeTemplates>
    <LNodeType id="ln1" lnClass="LLN0">
      <DO name="Beh" type="do1"/>
    </LNodeType>
    <DOType id="do1" cdc="ENS">
      <DA name="stVal" bType="Struct" type="da1" fc="ST"/>
    </DOType>
    <DAType id="da1">
      <BDA name="value" bType="Enum" type="en1"/>
    </DAType>
    <EnumType id="en1"><EnumVal ord="1">on</EnumVal></EnumType>
  </DataTypeTemplates>
</SCL>`;

function parse(xml: string): XMLDocument {
  return new DOMParser().parseFromString(xml, 'application/xml');
}

function project(body = ''): XMLDocument {
  return parse(`<SCL xmlns="http://www.iec.ch/61850/2003/SCL">
    <Header id="test"/>${body}
  </SCL>`);
}

describe('oscd-menu-import-ied', () => {
  let plugin: OscdMenuImportIed;
  let input: HTMLInputElement;
  let dialog: OscdDialog;
  let edits: EditV2[];

  beforeEach(async () => {
    plugin = await fixture<OscdMenuImportIed>(
      html`<oscd-menu-import-ied .doc=${project()}></oscd-menu-import-ied>`,
    );
    input = plugin.shadowRoot!.querySelector('input')!;
    dialog = plugin.shadowRoot!.querySelector('oscd-dialog')!;
    dialog.quick = true;
    edits = [];
    plugin.addEventListener('oscd-edit-v2', (event) => {
      edits.push(event.detail.edit);
    });
  });

  afterEach(async () => {
    if (dialog.open) {
      await dialog.close();
    }
  });

  function selectFiles(...files: File[]): void {
    const transfer = new DataTransfer();
    files.forEach(file => transfer.items.add(file));
    input.files = transfer.files;
    input.dispatchEvent(new Event('change'));
  }

  async function expectError(text: string): Promise<void> {
    await waitUntil(() => dialog.open);
    expect(dialog).to.be.instanceOf(OscdDialog);
    expect(dialog.textContent).to.contain(text);
    expect(edits).to.have.length(0);
  }

  it('dispatches one unapplied EditV2 operation for the first IED in the first file', async () => {
    const before = new XMLSerializer().serializeToString(plugin.doc!);
    const legacyEvents: Event[] = [];
    plugin.addEventListener('oscd-edit', event => legacyEvents.push(event));
    selectFiles(
      new File([source], 'devices.iid'),
      new File(['<SCL><IED name="OtherFile"/></SCL>'], 'other.iid'),
    );
    await waitUntil(() => edits.length === 1);

    expect(new XMLSerializer().serializeToString(plugin.doc!)).to.equal(before);
    expect(legacyEvents).to.have.length(0);
    expect(dialog.open).to.equal(false);
    expect(input.multiple).to.equal(false);
    expect(input.accept).to.equal('.iid,.cid,.icd');
    const insertedIeds = Array.isArray(edits[0])
      ? edits[0].filter(edit => 'node' in edit && edit.node.nodeName === 'IED')
      : [];
    expect(insertedIeds).to.have.length(1);
    const insertion = insertedIeds[0];
    if (!('node' in insertion) || !(insertion.node instanceof Element)) {
      throw new Error('Expected an IED insertion');
    }
    expect(insertion.node.getAttribute('name')).to.equal('First');
  });

  it('imports communication and nested dependent types as one undoable shell transaction', async () => {
    const shell = await fixture<OscdShell>(html`<oscd-shell></oscd-shell>`);
    expect(shell).to.be.instanceOf(OscdShell);
    shell.docs = { 'test.scd': plugin.doc! };
    shell.docName = 'test.scd';
    await shell.updateComplete;
    shell.append(plugin);
    const before = new XMLSerializer().serializeToString(shell.doc);

    selectFiles(new File([source], 'devices.iid'));
    await waitUntil(() => shell.doc.querySelector('IED[name="First"]') !== null);
    expect(shell.doc.querySelector('IED[name="Second"]')).to.equal(null);
    expect(shell.doc.querySelector('ConnectedAP')?.getAttribute('iedName')).to.equal('First');
    for (const tag of ['LNodeType', 'DOType', 'DAType', 'EnumType']) {
      expect(shell.doc.querySelectorAll(tag)).to.have.length(1);
    }
    const after = new XMLSerializer().serializeToString(shell.doc);
    expect(shell.xmlEditor.past).to.have.length(1);
    shell.undo();
    expect(new XMLSerializer().serializeToString(shell.doc)).to.equal(before);
    shell.redo();
    expect(new XMLSerializer().serializeToString(shell.doc)).to.equal(after);
  });

  it('uses the supported helper conflict naming without replacing an existing IED', async () => {
    const shell = await fixture<OscdShell>(html`<oscd-shell></oscd-shell>`);
    plugin.doc = project(`<IED name="Existing"/>
      <DataTypeTemplates><LNodeType id="ln1" lnClass="LLN0" desc="different"/></DataTypeTemplates>`);
    shell.docs = { 'test.scd': plugin.doc };
    shell.docName = 'test.scd';
    shell.append(plugin);

    selectFiles(new File([source], 'devices.iid'));
    await waitUntil(() => shell.doc.querySelector('IED[name="First"]') !== null);
    expect(shell.doc.querySelector('IED[name="Existing"]')).not.to.equal(null);
    expect(shell.doc.querySelector('LN0')?.getAttribute('lnType')).to.equal('ln1@First#1');
    expect(shell.doc.querySelectorAll('LNodeType')).to.have.length(2);
  });

  it('does not introduce an Edition or missing-dependency admission gate', async () => {
    plugin.doc = parse('<SCL xmlns="http://www.iec.ch/61850/2003/SCL" version="2007" revision="C" release="5"><Header id="test"/></SCL>');
    const incompleteSource = source.replace(/<DataTypeTemplates>[\s\S]*<\/DataTypeTemplates>/, '');
    selectFiles(new File([incompleteSource], 'incomplete.iid'));
    await waitUntil(() => edits.length === 1);
    expect(dialog.open).to.equal(false);
  });

  it('preserves the original first-IED lookup even in a partially parsed document', async () => {
    selectFiles(new File(['<SCL><IED name="Partial"></SCL>'], 'partial.iid'));
    await waitUntil(() => edits.length === 1);
    expect(dialog.open).to.equal(false);
  });

  it('explains duplicate-name rejection without dispatching edits', async () => {
    plugin.doc = project('<IED name="First"/>');
    selectFiles(new File([source], 'duplicate.iid'));
    await expectError('an IED named "First" already exists');
    expect(plugin.doc.querySelectorAll('IED')).to.have.length(1);
  });

  it('explains a missing destination', async () => {
    plugin.doc = undefined;
    selectFiles(new File([source], 'device.iid'));
    await expectError('Open an SCL project');
  });

  for (const [name, xml] of [
    ['missing.iid', '<SCL/>'],
    ['malformed.iid', '<SCL><broken></SCL>'],
  ]) {
    it(`explains why ${name} cannot supply an IED`, async () => {
      selectFiles(new File([xml], name));
      await expectError(`No IED could be read from "${name}"`);
    });
  }

  it('shows file-reading errors instead of rejecting silently', async () => {
    const file = new File([source], 'unreadable.iid');
    Object.defineProperty(file, 'text', {
      value: () => Promise.reject(new Error('Read failed')),
    });
    selectFiles(file);
    await expectError('Read failed');
  });

  it('surfaces helper errors without applying destination edits', async () => {
    const cyclic = source.replace('</DataTypeTemplates>', '<DOType id="loop" cdc="SPS"><SDO name="child" type="loop"/></DOType></DataTypeTemplates>');
    const before = new XMLSerializer().serializeToString(plugin.doc!);
    selectFiles(new File([cyclic], 'cyclic.iid'));
    await expectError('Could not import "cyclic.iid"');
    expect(new XMLSerializer().serializeToString(plugin.doc!)).to.equal(before);
  });

  it('allows dismissing the error dialog and retrying the same file', async () => {
    const file = new File([source], 'device.iid');
    plugin.doc = project('<IED name="First"/>');
    selectFiles(file);
    await expectError('already exists');
    const close = dialog.querySelector('oscd-text-button')!;
    await dialog.updateComplete;
    const actions = dialog.querySelector('[slot="actions"]')!;
    const buttonBounds = close.getBoundingClientRect();
    const actionsBounds = actions.getBoundingClientRect();
    expect(buttonBounds.width).to.be.greaterThan(0);
    expect(buttonBounds.width).to.be.lessThan(actionsBounds.width / 2);
    expect(actionsBounds.right - buttonBounds.right).to.be.closeTo(24, 1);
    close.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    await waitUntil(() => !dialog.open);

    plugin.doc = project();
    selectFiles(file);
    await waitUntil(() => edits.length === 1);
    expect(dialog.open).to.equal(false);
  });

  it('keeps cancellation silent and resets the native picker for repeated use', async () => {
    selectFiles();
    await plugin.updateComplete;
    expect(dialog.open).to.equal(false);
    expect(edits).to.have.length(0);

    input.addEventListener('click', event => event.preventDefault());
    selectFiles(new File([source], 'device.iid'));
    await waitUntil(() => edits.length === 1);
    expect(input.value).not.to.equal('');
    await plugin.run();
    expect(input.value).to.equal('');
  });
});
