import { LitElement, css, html } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { msg, str } from '@lit/localize';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdTextButton } from '@omicronenergy/oscd-ui/button/OscdTextButton.js';
import { insertIed } from '@openscd/scl-lib';
import { newEditEventV2 } from '@openscd/oscd-api/utils.js';

/** Imports the first IED from one selected SCL file. */
export default class OscdMenuImportIed extends ScopedElementsMixin(LitElement) {
  static scopedElements = {
    'oscd-dialog': OscdDialog,
    'oscd-text-button': OscdTextButton,
  };

  @property({ attribute: false })
  doc?: XMLDocument;

  @property({ attribute: false })
  docVersion?: unknown;

  @state()
  private errorMessage = '';

  @query('input')
  private input!: HTMLInputElement;

  @query('oscd-dialog')
  private errorDialog!: OscdDialog;

  async run(): Promise<void> {
    await this.updateComplete;
    this.input.click();
  }

  private async handleImport(event: Event): Promise<void> {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    const file = target.files?.item(0);
    if (file === null || file === undefined) {
      return;
    }
    try {
      const text = await file.text();
      const ied = new DOMParser()
        .parseFromString(text, 'application/xml')
        .querySelector('IED');
      const scl = this.doc?.querySelector('SCL');
      if (scl === null || scl === undefined) {
        await this.showError(msg('Open an SCL project before importing an IED.'));
        return;
      }
      if (ied === null) {
        await this.showError(
          msg(str`No IED could be read from "${file.name}". Check that the file contains well-formed SCL XML.`),
        );
        return;
      }
      const name = ied.getAttribute('name');
      const duplicate = scl.querySelector(`IED[name="${name}"]`);
      if (duplicate !== null) {
        await this.showError(
          msg(str`Cannot import "${file.name}": an IED named "${name}" already exists in the project.`),
        );
        return;
      }
      const edits = insertIed(scl, ied);
      if (edits.length === 0) {
        await this.showError(msg(str`The IED in "${file.name}" could not be imported.`));
        return;
      }
      this.dispatchEvent(newEditEventV2(edits));
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      await this.showError(msg(str`Could not import "${file.name}": ${reason}`));
    }
  }

  private handleCloseError(): Promise<void> {
    return this.errorDialog.close();
  }

  private async showError(message: string): Promise<void> {
    this.errorMessage = message;
    await this.updateComplete;
    await this.errorDialog.show();
  }

  render() {
    return html`<input
      @click=${() => {
        this.input.value = '';
      }}
      @change=${this.handleImport}
      .accept=${'.iid,.cid,.icd'}
      type="file"
      aria-label=${msg('Select an IED file')}
    />
    <oscd-dialog .type=${'alert'} aria-label=${msg('IED import failed')}>
      <div slot="headline">${msg('IED import failed')}</div>
      <p slot="content">${this.errorMessage}</p>
      <div slot="actions">
        <oscd-text-button @click=${this.handleCloseError}>
          ${msg('Close')}
        </oscd-text-button>
      </div>
    </oscd-dialog>`;
  }

  static styles = css`
    input {
      width: 0;
      height: 0;
      opacity: 0;
    }

    p {
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
  `;
}
