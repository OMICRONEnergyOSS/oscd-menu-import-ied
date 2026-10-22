import { LitElement } from 'lit';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdTextButton } from '@omicronenergy/oscd-ui/button/OscdTextButton.js';
declare const OscdMenuImportIed_base: typeof LitElement & import("@open-wc/dedupe-mixin").Constructor<import("@open-wc/scoped-elements/types.js").ScopedElementsHost> & import("@open-wc/scoped-elements/types.js").ScopedElementsHostConstructor;
/** Imports the first IED from one selected SCL file. */
export default class OscdMenuImportIed extends OscdMenuImportIed_base {
    static scopedElements: {
        'oscd-dialog': typeof OscdDialog;
        'oscd-text-button': typeof OscdTextButton;
    };
    doc?: XMLDocument;
    docVersion?: unknown;
    private errorMessage;
    private input;
    private errorDialog;
    run(): Promise<void>;
    private handleImport;
    private handleCloseError;
    private showError;
    render(): import("lit-html").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
export {};
