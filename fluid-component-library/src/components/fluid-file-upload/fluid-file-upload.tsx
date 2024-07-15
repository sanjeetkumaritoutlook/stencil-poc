import {
  FluidAlertConfig,
  FluidFileListHeaderConfiguration,
  FluidFileUploadActionsConfig,
  FluidSeverity,
  FluidTheme,
  FluidThemeInterface,
} from '@lmig/fluid-core';
import {
  Component,
  ComponentInterface,
  Element,
  Event,
  EventEmitter,
  h,
  Method,
  Prop,
  State,
} from '@stencil/core';
import { timer } from 'rxjs';

import {
  FILE_UPLOAD_DEFAULT_EMPTY_STATE_CONFIG,
  FILE_UPLOAD_DEFAULT_POPULATED_STATE_CONFIG,
  INVALID_FILE_TYPE_UPLOADED,
} from '../../constants/constants';
import { useI18n } from '../../providers/fluid-i18n-provider/adapter/fluid-i18n.adapter';
import { FluidI18nStore } from '../../providers/fluid-i18n-provider/store/fluid-i18n.store';
import { Utils } from '../../utils/utils';
import {
  FileList,
  FileUploadActions,
  FileUploadArea,
  FluidFileUploadEmptyConfig,
  FluidFileUploadPopulatedConfig,
  FluidFileUploadTranslationOptions,
} from './components/fluid-file-upload.components';

/**
 * @displayName File Upload
 * @contextData The FLUID file upload component lets the user choose one or more files from their device storage, which is displayed as an
 * editable table list of files. When the filelist changes in the table, the actual files are emitted from the fileListUpdated event for the
 * consuming application to handle from then on.
 */
@Component({
  tag: 'fluid-file-upload',
  styleUrl: 'fluid-file-upload.less',
  shadow: true,
})
export class FluidFileUpload
  implements FluidThemeInterface, ComponentInterface
{
  // ================================================================ //
  // -- Host Element

  /**
   * Get a reference to the host element
   */
  @Element() host: HTMLFluidFileUploadElement;

  // ================================================================ //
  // -- Props

  /**
   * What theme settings should the component use?
   */
  @Prop({ mutable: true }) overrideGlobalTheme: boolean;

  /**
   * If FluidThemeProvider is used, should this component override the
   * global theme with its local theme?
   */
  @Prop({ mutable: true }) theme: FluidTheme = FluidTheme.CORP;

  /**
   * Whether the file upload should allow multiple files to be uploaded -
   * if true, file list is displayed as a table beneath the drop zone.
   * @default true
   */
  @Prop() acceptMultiple = true;

  /**
   * If supplied, file upload will be restricted to the given filetypes only,
   * otherwise, all file types are accepted.
   *
   * Please note - in some cases, the file type presented by different operating systems uses
   * different casing (example macroenabled vs macroEnabled). As the FLUID uploader simply
   * concatenates the array you provide to the native elements 'accept' property, you may need
   * to both casing versions to support multiple operating systems.
   */
  @Prop() acceptFileTypes: string[] = [];

  /**
   * Where a file upload allows multiple files, you can configure a set of action buttons to be
   * displayed beneath the table that displays the files ready for upload.
   */
  @Prop() uploadControlConfig: FluidFileUploadActionsConfig;

  /**
   * If there is any additional information to be displayed in the drop zone, such as maximum accepted
   * file size, or restrictions of filetype, use this property to provide it.
   */
  @Prop() supplementaryInformation: string;

  /**
   * If provided, overrides the default table headers for the filelist when
   * using multiple file upload.
   */
  @Prop() fileListHeaderConfig: FluidFileListHeaderConfiguration;

  /**
   * If false, this will hide the table which displays the file list
   */
  @Prop() showFileList = true;

  /**
   * Allows content customization in the default (empty) state.
   */
  @Prop({ mutable: true }) emptyStateConfig: FluidFileUploadEmptyConfig =
    FILE_UPLOAD_DEFAULT_EMPTY_STATE_CONFIG;

  /**
   * Allows content customization when the control is populated with files.
   */
  @Prop({ mutable: true })
  populatedStateConfig: FluidFileUploadPopulatedConfig =
    FILE_UPLOAD_DEFAULT_POPULATED_STATE_CONFIG;
  /**
   * Allows a custom message to be configured for the popover that is shown on the warning
   * icon when a restricted file type has been attempted upload via drag and drop.
   */
  @Prop() restrictedFileTypeMessage = INVALID_FILE_TYPE_UPLOADED;

  /**
   * If true, all actions will be disabled, unless they are configured with an `enabledIf` property which
   * overrides this propertyl.
   */
  @Prop() actionsDisabled: boolean;

  _elementRef: HTMLInputElement;

  @State() _files: File[] = [];
  @State() _errorState: FluidAlertConfig;
  @State() _uploadError: string;

  // ================================================================ //
  // -- Events

  @Event() fileListUpdated: EventEmitter<File[]>;
  @Event() uploadClicked: EventEmitter<File[]>;
  @Event() actionClicked: EventEmitter<{ eventKey: string; files: File[] }>;

  // ================================================================ //
  // -- Methods

  /**
   * Clears the file list when called.
   */
  @Method() async clearFileList() {
    this.clearFiles();
  }

  /**
   * Called every time the component is connected to the DOM.
   * @action: setGlobalTheme - updates theme to match global theme & subscribes to changes
   */
  connectedCallback(): void {
    Utils.setGlobalTheme(this);
    useI18n.bind(this)({
      init: () => (this._i18nBound = true),
    });
  }

  /**
   * Called every time the component is disconnected from the DOM.
   * @action deregisterElement - removes the element from the i18n Store registry
   */
  disconnectedCallback() {
    this._i18nStore?.deregisterElement(this._translateId);
  }

  updateFiles() {
    this._uploadError = undefined;
    const files = [...this._files];
    for (let i = 0; i < this._elementRef.files.length; i++) {
      const file = this._elementRef.files.item(i);
      /**
       * If file types are restricted, check each file before adding, and
       * show a warning if restricted file-type upload is attempted.
       */
      if (!this.droppedFilePassesRestrictions(file)) {
        this._uploadError = this.restrictedFileTypeMessage;
      } else {
        if (!files.find((f) => f.name === file.name)) {
          files.push(file);
        } else {
          this.showError(file);
        }
      }
    }

    this._files = files;
    this.fileListUpdated.emit(this._files);
    this._elementRef.value = null;
  }

  /**
   * When a list of files is dropped in, but only one is required, find the first acceptable
   * file that passes restrictions where they exist, otherwise, the first file in the array.
   * @param files
   */
  findFirstAcceptableFile(files: File[]): File {
    if (!this.acceptFileTypes || this.acceptFileTypes?.length === 0) {
      return files[0];
    } else {
      const passingFiles: File[] = Array.from(files)?.filter((file) =>
        this.droppedFilePassesRestrictions(file)
      );
      return passingFiles?.length > 0 ? passingFiles[0] : null;
    }
  }

  /**
   * Handles te file list dropped in to the dropzone.
   * @param files
   */
  addDroppedFiles(files: File[]) {
    this._uploadError = undefined;
    /**
     * If only single upload is allowed, choose the first in the list.
     */
    if (!this.acceptMultiple && files?.length > 0) {
      const firstAcceptableFile: File | undefined =
        this.findFirstAcceptableFile(files);
      if (firstAcceptableFile) {
        this._files = [this.findFirstAcceptableFile(files)];
      } else {
        this._uploadError = this.restrictedFileTypeMessage;
      }
    } else {
      /**
       * Otherwise, iterate all dropped files.
       */
      Array.from(files).forEach((file: File) => {
        /**
         * If file types are restricted, check each file before adding, and
         * show a warning if restricted file-type upload is attempted.
         */
        if (!this.droppedFilePassesRestrictions(file)) {
          this._uploadError = this.restrictedFileTypeMessage;
        } else {
          /**
           * Otherwise, add to file list.
           */
          this._files.push(file);
        }
      });
    }
    this.updateFiles();
  }

  /**
   * Checks if the given file passes the accepted file types restrictions (if applicable)
   * @param file
   */
  droppedFilePassesRestrictions(file: File) {
    if (!this.acceptFileTypes || this.acceptFileTypes?.length === 0) {
      return true;
    }
    return this.acceptFileTypes.indexOf(file.type) !== -1;
  }

  showError(file: File) {
    this._errorState = {
      message: `${file.name} is already present in the file list.`,
      timeout: 3000,
      visible: true,
      severity: FluidSeverity.ERROR,
    };
    timer(3500).subscribe(() => (this._errorState = undefined));
  }

  clearFiles() {
    this._uploadError = undefined;
    this._files = [];
    this._elementRef.value = '';
    this.fileListUpdated.emit(this._files);
  }

  /**
   * Main Render function
   */
  render() {
    const componentWrapper = `fluid-file-upload ${this.theme}`;

    const dragHandlers = {
      onDragOver: (event) => event.preventDefault(),
      onDragEnter: (event) => event.preventDefault(),
      onDragExit: (event) => event.preventDefault(),
      onDrop: (event) => {
        event.preventDefault();
        const droppedFiles = event.dataTransfer.files;
        this.addDroppedFiles(droppedFiles);
      },
    };

    return (
      <div class={componentWrapper}>
        <FileUploadArea
          onClicked={() => this._elementRef.click()}
          dragHandlers={dragHandlers}
          supplementaryInformation={this.supplementaryInformation}
          onClear={() => this.clearFiles()}
          files={this._files}
          emptyStateConfig={this.emptyStateConfig}
          populatedStateConfig={this.populatedStateConfig}
          uploadError={this._uploadError}
          fluidTranslate={this.fluidTranslate}
          i18nStore={this._i18nStore}
        />
        <input
          style={{ display: 'none' }}
          multiple={this.acceptMultiple}
          type={'file'}
          onInput={() => this.updateFiles()}
          ref={(el) => {
            this._elementRef = el;
            if (this.acceptFileTypes.length > 0) {
              this._elementRef.accept = this.acceptFileTypes.join(',');
            }
          }}
        />
        {!!this._errorState && <fluid-alert config={this._errorState} />}
        {this.acceptMultiple && this.showFileList && (
          <FileList
            files={this._files}
            fluidTranslate={this.fluidTranslate}
            fileListHeaderConfig={this.fileListHeaderConfig}
            fileListUpdated={(newFileList: File[]) => {
              if (newFileList.length === 0) {
                this._uploadError = undefined;
              }
              this._files = newFileList;
              this.fileListUpdated.emit(newFileList);
            }}
          />
        )}
        {!!this.uploadControlConfig && this._files.length > 0 && (
          <FileUploadActions
            onClear={() => this.clearFiles()}
            onUpload={() => this.uploadClicked.emit(this._files)}
            actionsDisabled={this.actionsDisabled}
            i18nStore={this._i18nStore}
            fluidTranslate={this.fluidTranslate}
            files={this._files}
            onActionClick={(eventKey: string) =>
              this.actionClicked.emit({ eventKey, files: this._files })
            }
            actions={this.uploadControlConfig}
          />
        )}
      </div>
    );
  }

  // ================================================================ //
  // -- Internationalisation

  /* @internal */
  @Prop() fluidTranslate: FluidFileUploadTranslationOptions;
  private _translateId: string;
  private _i18nStore: FluidI18nStore | undefined;
  @State() _i18nBound: boolean;
}
