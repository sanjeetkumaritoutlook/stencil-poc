import {
  FluidAnalyticsInterface,
  FluidButtonConfig,
  FluidComponentDefinition,
  FluidDataLayerComponentConfiguration,
  FluidEmptyStateConfig,
  FluidExpandedPosition,
  FluidExportOptions,
  FluidFilterSet,
  FluidFormConfig,
  FluidFormElementConfig,
  FluidFormElementState,
  FluidFormState,
  FluidMutationUpdate,
  FluidPaginationState,
  FluidPaginatorTranslationOptions,
  FluidRowMutation,
  FluidSearchBoxTranslationOptions,
  FluidSearchOptions,
  FluidSortOrder,
  FluidTableAction,
  FluidTableCellUpdate,
  FluidTableColumnAdjustments,
  FluidTableColumnGroup,
  FluidTableConditionalDisableOptions,
  FluidTableFormActionsConfig,
  FluidTableGroupedDataset,
  FluidTableHeader,
  FluidTableRowData,
  FluidTableRowMetadata,
  FluidTableSelectionOptions,
  FluidTableSortedEvent,
  FluidTheme,
  FluidThemeInterface,
  FluidToggleType,
  FluidVerticalPosition,
  isNullOrUndefined,
} from '@lmig/fluid-core';
import { generateUniqueId } from '@lmig/fluid-core/lib/helpers/string.helpers';
import { FluidButtonTranslations } from '@lmig/fluid-core/lib/i18n/types/temp-element-translations';
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
  Watch,
} from '@stencil/core';

import { DeleteIcon } from '../../common/fluid-common-icon.components';
import { FluidComponent } from '../../common/fluid-component-rendering.components';
import {
  EXPANDED,
  FILTERED,
  FORM_EXPANDED,
  ID,
  SELECTED,
  TABLE_CONFIG_WARNING,
  TABLE_INVALID_COLUMN_GROUPS,
  TABLE_STICKY_HEADERS,
  VISIBLE,
} from '../../constants/constants';
import { defaultSearchOptions } from '../../model/table/fluid-table-search-options.interface';
import { DataItem } from '../../model/typings/fluid-generic.type';
import { useI18n } from '../../providers/fluid-i18n-provider/adapter/fluid-i18n.adapter';
import { FluidI18nStore } from '../../providers/fluid-i18n-provider/store/fluid-i18n.store';
import { FluidResizeObserver } from '../../utils/resize/resize-observer.class';
import { themeVar } from '../../utils/themes/theme.variables';
import { Utils } from '../../utils/utils';
import {
  FluidDataLayerUtils,
  sendEvent,
} from '../fluid-data-layer/fluid-data-layer.utils';
import { checkDisabledUpdateForCache } from '../fluid-form/util/fluid-form.cache';
import { getDefaultPageSizeOptions } from '../fluid-paginator/utils/fluid-paginator.utils';
import { AdditionalHeaderRow } from './components/fluid-table-additional-header-row.components';
import {
  ExpandPanelCell,
  SelectCell,
  TableSelectCellProps,
} from './components/fluid-table-cell-types.components';
import {
  TableControlBar,
  TableControlsPlacement,
  TableSearchBar,
} from './components/fluid-table-controls.components';
import {
  FluidTableEmptyStateConfig,
  TableEmptyFilterState,
  TableEmptyState,
  TableLoadingState,
} from './components/fluid-table-empty-state.components';
import { TableFooter } from './components/fluid-table-footer.component';
import { TableForm } from './components/fluid-table-form.components';
import {
  GroupedItems,
  GroupFooter,
  GroupHeader,
} from './components/fluid-table-grouping.components';
import { TableHeaderCellProps } from './components/fluid-table-header-cell.components';
import { TableActionButton } from './components/fluid-table-misc.components';
import { Paginator } from './components/fluid-table-pagination.components';
import {
  CellPlaceholder,
  hasSplitHeaders,
  SlottedTableHeader,
  SplitPointHeader,
  TableCellSet,
  TableHeaderCell,
  TableHeaderRow,
} from './components/fluid-table-structure.components';
import {
  filtersAreApplied,
  getVisibleDataItems,
  processTableFilters,
} from './internal/filter/fluid-table-filter.utils';
import { tableStateCache } from './internal/fluid-table-cache.utils';
import {
  canUseIdentifiers,
  is,
  prepareDataSource,
} from './internal/fluid-table-data-management.utils';
import {
  restoreOriginalTableConfiguration,
  setFieldsDisabledConditionally,
  setTableDisabled,
} from './internal/fluid-table-disable.util';
import {
  commitEditableCellChanges,
  createTableMutationUpdate,
  emitTableUpdates,
  getEditableCellReferences,
  getEditableCellStates,
  resetEditableCells,
} from './internal/fluid-table-editable-cell-management.utils';
import {
  createExportAction,
  createExportHandler,
} from './internal/fluid-table-export.utils';
import {
  formExpanded,
  getEditableFormReferences,
  getEditableFormStates,
  resetEditableForms,
  updateFormData,
} from './internal/fluid-table-form.utils';
import {
  groupDataSource,
  includeRowActions,
  isAdditionalHeaderTable,
  isGroupedTable,
  toggleExpand,
} from './internal/fluid-table-grouping.utils';
import { flattenHeaders } from './internal/fluid-table-header.utils';
import { emitFilterEvent } from './internal/fluid-table-misc.utils';
import {
  applyPagination,
  paginate,
  setPaginationState,
} from './internal/fluid-table-pagination.utils';
import { searchDataSource } from './internal/fluid-table-search.utils';
import {
  getCheckBoxRestrictionRules,
  isSelected,
  selectRow,
} from './internal/fluid-table-select.utils';
import { applyDefaultSort, sortBy } from './internal/fluid-table-sort.utils';
import { getTableStyles } from './internal/fluid-table-structure.utils';
import { TableDisplayStateStore } from './stores/table-display-state.store';
import { TableElementStore } from './stores/table-element.store';
import { TableStateStore } from './stores/table-state.store';
import {
  upgradeEmptyStateConfig,
  upgradeFormActions,
} from './util/fluid-table-deprecation.utils';

export type FluidTranslatableTableHeader = FluidTableHeader & {
  fluidTranslate?: { label?: string; helpText?: string };
};

/**
 * @displayName Table
 *
 * @contextData A table is a structured set of data made up of rows and columns (tabular data).
 * A table allows you to quickly and easily look up values that indicate some kind of connection between
 * different types of data, for example a person and their age, or a day of the week, or the timetable
 * for a local swimming pool.
 *
 * @advancedUsage /table/dynamic-data
 *
 * @slot table-header-row - A named slot to allow an additional header row to be applied at the head of the table;
 *
 * @analyticsAware ['tableSearched', 'tableSorted', 'tableFiltered']
 *
 */
@Component({
  tag: 'fluid-table',
  styleUrl: 'fluid-table.less',
  shadow: true,
})
export class FluidTable
  implements ComponentInterface, FluidThemeInterface, FluidAnalyticsInterface
{
  /**
   * Stores the applied filters in a map, so we can extract them when required.
   */
  filters: object = {};

  /**
   * When true, Table's first column will be "sticky" on horizontal
   * scroll (similar to Microsoft Excel "freeze pane" functionality).
   */
  _stickyColumn = false;

  // ================================================================ //
  // -- Own Properties (Private)

  /**
   * Index of current visible row being rendered. Used to ensure Table striping
   * isn't skewed by hidden rows.
   */
  private _rowIndex = 0;

  /**
   * Local copies of @Props that allow default values to be set based
   * on current theme.
   */
  private _striped: boolean;
  private _rowBorders: boolean;

  // ================================================================ //
  // -- Host Element

  /**
   * Reference to the host element
   */
  @Element() host: HTMLFluidTableElement;

  _resizeObserver: FluidResizeObserver;
  @State() _containerWidth: number;
  @State() _containerHeight: number;

  // ================================================================ //
  // -- Props

  /**
   * What theme settings should the component use?
   */
  @Prop({ mutable: true }) theme: FluidTheme = FluidTheme.CORP;

  /**
   * If FluidThemeProvider is used, should this component override the
   * global theme with its local theme?
   */
  @Prop({ mutable: true }) overrideGlobalTheme: boolean;

  /**
   * The initial dataSet to work from - duplicated in _tableState to allow
   * data mutation in the table without affecting the original data
   */
  @Prop() dataItems: FluidTableRowData<DataItem>[] = [];

  /**
   * The list of column definitions used to draw the table
   */
  @Prop() headers: FluidTranslatableTableHeader[];

  /**
   * An array of column groups to apply to the table
   */
  @Prop() columnGroups: FluidTableColumnGroup[] = [];

  /**
   * A unique ID for the table
   * @required - Required prop - we'll need this to store table
   * state, so the table will fail to render with an error message
   * if not provided.
   */
  @Prop() tableId: string = generateUniqueId();

  /**
   * If true, the table will have a search bar
   */
  @Prop() enableSearch: boolean;

  /**
   * If true, filters are only applied after clicking the 'Apply Filters' button
   * on the filter menu - this helps improve performance on large datasets.
   */
  @Prop() disableActiveFiltering: boolean;

  /**
   * Set the options for the export feature.
   */
  @Prop() exportOptions: FluidExportOptions;

  /**
   * Configure the table search (searchable headers, dynamic search, etc.)
   */
  @Prop({ mutable: true }) searchOptions: FluidSearchOptions;

  /**
   * If the table is stateful, modifications to filters/visible columns/sorting etc.
   * are stored locally to keep the table state on return visits (defaults to false);
   */
  @Prop() stateful = false;

  /**
   * Provide a template to render in an expandable panel for each row.
   * Row template will receive the entire row object to render in template.
   * Each row will display a "trigger" button for the expandable panel on
   * the right side of the Table by default, or on the left side of the Table
   * by setting "expandedButtonPosition: left".
   */
  @Prop() expandableRowTemplate: (
    data: FluidTableRowData<DataItem>
  ) => FluidComponentDefinition | string;

  /**
   * Allows a table subset to be created as an expandable panel beneath each row.
   *
   * Each subset uses the same headers as the main row, and passes the current dataItem
   * as the parameter to the function to return an array of child rows for the subset table.
   */
  @Prop() rowSubset: (
    data: FluidTableRowData<DataItem>
  ) => FluidTableRowData<DataItem>[];

  /**
   * Overrides default position of each row's "expand" button (rendered when
   * "expandableForm" or "expandableRowTemplate" Props used). By default,
   * the "expandableForm" Prop will render the "expand" buttons on the LEFT side
   * of the Table (e.g. "right" will override the default position). The
   * "expandableRowTemplate" Prop will render the "expand" buttons on the
   * RIGHT side of the Table by default (i.e. "left" will override the
   * default position).
   */
  @Prop() expandedButtonPosition: FluidExpandedPosition;

  /**
   * If an expandable form template is given, set this to true if your configuration returns
   * a FluidComponentDefinition and the table will use component renderer to render it.
   */
  @Prop() useRenderer: boolean;

  /**
   * Sets a maximum height for the displayed table, if there is still visible data
   * beyond the maximum height, the table will become scrollable.
   */
  @Prop() maxHeight: number;
  @Prop() minHeight: number;

  /**
   * When true, Table headers will be "sticky" on vertical scroll. NOTE:
   * Table MUST have a maximum height defined (i.e. "maxHeight" Prop) for
   * this Prop to function.
   */
  @Prop() stickyHeaders: boolean;

  /**
   * Lets the table know if data from above is loading (from an API for example) so that
   * it can show a loading spinner until it has the data (Must be managed from consuming
   * application)
   */
  @Prop() dataLoading: boolean;

  /**
   * When the dataItems array is changed, the table enters a 'refresh' state - this is to ensure all the
   * operations the table has to carry out on the new data set can complete before rendering the table nodes.
   * This value determines how long the table is in that refresh state, so it can be fine-tuned if there any
   * issues with larger, or more complex datasets.
   */
  @Prop() refreshDelay = 300;

  /**
   * Allows a custom message to be shown when there are no dataItems available, and the table is not marked
   * as loading.
   */
  @Prop() emptyStateConfig: FluidTableEmptyStateConfig | FluidEmptyStateConfig;

  /**
   * If true, horizontal scrolling will be allowed on tables with many columns. NB - If allowOverflow is true,
   * horizontal scrolling will be enabled, however, filter menu style will be switched to compact to prevent overflow on the Y axis from cutting off the view.
   */
  @Prop() allowOverflow: boolean;

  /**
   * If true, the table emit the form state of each nested form for each change - if you do not need
   * to know the forms state (validity, etc) prior to hitting the save button (and receiving mutations),
   * you can set this to false to improve performance.
   */
  @Prop() trackFormState = true;

  /**
   * Actions to be rendered for each row.
   */
  @Prop() rowActions: FluidTableAction[];

  /**
   * Contextual action buttons for each
   */
  @Prop() tableActions: FluidTableAction[];

  /**
   * Allows you to adjust the width of all columns in a single prop, including columns
   * added by FLUID.
   *
   * NB - Column widths will shrink *where possible* - certain column elements (such as icons) may dictate the column
   * width be larger than what is configured - in this case, the column will shrink as much as it can.
   */
  @Prop() columnAdjustments: FluidTableColumnAdjustments;

  /**
   * Provides the ability to further customise the edit actions for a table with editable cells/forms.
   *
   * Deprecates several properties via the mapFormActionsToConfig() method
   */
  @Prop({ mutable: true }) formActionsConfig: FluidTableFormActionsConfig;

  /**
   * Configuration for an expandable form to be rendered with each row, which
   * allows the dataItem in that row to be edited. Each row will display a
   * "trigger" button for the expandable panel on the left side of the Table
   * by default, or on the right side of the Table by setting
   * "expandedButtonPosition: right".
   */
  @Prop() expandableForm: FluidFormConfig;

  /**
   * Provides selection options for the selectable row table type.
   */
  @Prop({ mutable: true }) selectionOptions: FluidTableSelectionOptions;

  /**
   * If true, Table rows will be styled with "zebra stripes" (alternating rows
   * will have gray background).
   */
  @Prop() striped: boolean;

  /**
   * If true, each Table row will have a bottom border.
   */
  @Prop() rowBorders: boolean;

  /**
   * If true, disables the column visibility filters
   */
  @Prop() disableColumnVisibility = false;

  /**
   * Sets the visibility button config (Icon)
   * The default is `icon:'ellipsis_vertical'`
   * You can override all the properties from `FluidIconConfig`
   * Example: the `color` and `size` of the icon
   * @type { FluidButtonConfig }
   */
  @Prop() columnVisibilityButtonConfig: FluidButtonConfig;

  /**
   * If true, the table will provide the ability to delete a row, without
   * having to supplement with a defined action.
   */
  @Prop() handleDelete = false;

  /**
   * If true (default), a table with an expandable form or editable field, and
   * table-rendered edit actions with automatically commit the changes to the forms
   * to its own internal memory on click of the Save button if the forms are valid.
   *
   * This will fire the dataMutated event, which lets the consuming application know
   * the new data set values.
   */
  @Prop() commitOnValidSave = true;

  /**
   * Where a table has nested forms or editable cells with validation configured, the table
   * will not emit a dataMutated event when the save button is clicked unless all are valid.
   * When this prop is set to true, the table will validate the cells when save is clicked and
   * cells are not valid, offering immediate visual feedback to the user.
   */
  @Prop() validateOnSave: boolean;

  /**
   * If true, the save and cancel buttons will be disabled.
   */
  @Prop() actionsDisabled: boolean;

  /**
   * If a particular property within the given dataItems can be used to uniquely
   * identify the item, this property tells the table to use it rather than generated
   * IDs
   */
  @Prop() rowIdentifier: Extract<keyof DataItem, string>;

  /**
   * FLUID adds certain properties to the data to help it manage internal state - these properties
   * are then stripped out of any data that is emitted from the table, so data retains the same shape
   * on the way out, as what was put in. If the consuming application relies on any of these properties,
   * it can request that FLUID doesn't strip them out, by adding the required properties to this array.
   */
  @Prop() retainTransientProperties: (keyof FluidTableRowMetadata)[] = [];

  /**
   * Provides the ability to pass a function that receives the row data as a parameter, and returns a
   * boolean. If true, the row will be highlighted.
   */
  @Prop() highlightRowIf: (rowData: FluidTableRowData<DataItem>) => boolean;

  /**
   * Provides the ability to pass a function that receives the row data as a parameter, and returns a
   * boolean. If true, the row will be disabled, and all interactive elements in the row will be disabled.
   */
  @Prop() disableRowIf: (rowData: FluidTableRowData<DataItem>) => boolean;

  /**
   * When true, all interaction on the table will be disabled.
   */
  @Prop({ reflect: true, mutable: true }) disabled = false;

  // ================================================================ //
  // -- Pagination Settings

  /**
   * Determines if the table is pageable - default is true, so needs
   * to be explicitly set to false if we don't want pagination
   */
  @Prop() paginated = true;

  /**
   * If paginated, sets the items per page options for the paginator
   */
  @Prop() paginationItemsPerPageOptions: number[] = getDefaultPageSizeOptions();

  /**
   * Allows the paginators range indicator wording to be customised
   */
  @Prop() rangeIndicatorTemplate: string;

  /**
   * Allows the paginators items per page selector wording to be customised
   */
  @Prop() itemsPerPageTemplate: string;

  @Prop() allowTabIndexRows = false;

  @Prop() allowTabIndexCells = false;

  /**
   * If true the total items of the paginator (last item of the select box) will not be an option
   */
  @Prop() isPaginatorTotalItemsDisabled = false;

  // ================================================================ //
  // -- Events

  @Event() firstRender: EventEmitter<boolean>;

  /**
   * Emits the row actionKey that was clicked, along with the rowData from
   * the row that was clicked
   */
  @Event() actionClicked: EventEmitter<{
    actionKey: string;
    rowData?: FluidTableRowData<DataItem>;
  }>;

  /**
   * Emits the cell data whenever a cell is clicked
   */
  @Event() cellClicked: EventEmitter<{
    rowId: string;
    dataPath: string;
    row: FluidTableRowData<DataItem>;
  }>;

  /**
   * Emits when one of the form actions is clicked, in case the parent component
   * has any external validations etc to do
   */
  @Event() formActionClicked: EventEmitter<string>;

  /**
   * Emits whenever an editable cell changes value. Emits the new value, along with the
   * row data for the row it changed on.
   */
  @Event() editableCellChange: EventEmitter<FluidTableCellUpdate>;

  /**
   * Emits when the tables 'Save' action is clicked. Emits both the new, now
   * updated dataset, along with a list of mutated rows. This allows the
   * consuming component to intercept changes and decide whether to commit
   * the change, or to reset the data;
   */
  @Event() dataMutated: EventEmitter<FluidMutationUpdate>;

  /**
   * Fired whenever an element in a nested form value changes
   */
  @Event() formValueChanged: EventEmitter<FluidTableCellUpdate>;

  /**
   * Emits when the state of the nested forms changes.
   */
  @Event() nestedFormState: EventEmitter;

  /**
   * Emits when the expansion state of a group is toggled.
   */
  @Event() groupToggled: EventEmitter<{
    groupedByValue: unknown;
    collapsed: boolean;
  }>;

  /**
   * Emits the group state when all are expanded/collapsed
   */
  @Event() groupsToggled: EventEmitter<{ [key: string]: boolean }>;

  /**
   * Emits whenever the table search is executed
   */
  @Event() tableSearched: EventEmitter<{
    searchTerm: string;
    searchResults: FluidTableRowData<DataItem>[];
  }>;

  /**
   * Emits whenever the table is sorted
   */
  @Event() tableSorted: EventEmitter<FluidTableSortedEvent>;

  /**
   * Emits whenever the table is filtered
   */
  @Event() tableFiltered: EventEmitter;

  /**
   * Emits whenever the table column visibility has changed.
   */
  @Event() columnVisibility: EventEmitter<FluidTableHeader[]>;

  /**
   * Emits whenever a table row is expanded.
   */
  @Event() expansionToggled: EventEmitter<{
    expanded: boolean;
    rowData: FluidTableRowData<any>;
  }>;

  // ================================================================ //
  // -- Main Datasource for rendering

  /**
   * Internal data state of the table - this is derived from the dataItems passed in, and FLUID
   * data attributes are applied on first load, and when changed.
   */
  @State() _dataSource: FluidTableRowData<DataItem>[] = [];

  /**
   * Internal header state of the table - this is derived from the headers passed in, and some preparation
   * is done to prepare data paths and visibility for column filtering.
   */
  @State() _headers: FluidTableHeader[] = [];

  /**
   * In order to support grouping, we convert the datasource into groups, based on the grouping configuration
   * of a particular header. If there is no grouping configured, we convert the data source into a single group,
   * and display it without the group header, is if the table wasn't grouped.
   */
  @State() _groupedDataSource: FluidTableGroupedDataset[] = [];

  @State() _tableDisabled: boolean;

  /**
   * When the data is refreshing, set a state to allow the table to alert the user.
   */
  @State() _dataRefreshing: boolean;

  _tableStateCache = tableStateCache;
  _firstRenderedFlag = false;

  // ================================================================ //
  // -- Editable Cell Management

  /**
   * Internal store of editable cell references for when we have to carry out any additional
   * functions other than user input (such as getting value, marking touched and validating, etc)
   */
  _editableCells: Record<
    string,
    Record<string, { reference: HTMLFluidFormElementElement }>
  > = {};

  /**
   * Internal store of form references for when we have to carry out any additional
   * functions other than user input (such as getting value, marking touched and validating, etc.)
   */
  _editableForms: Record<string, HTMLFluidFormElement> = {};

  /**
   * Internal store of updates to each row - if any editable cell or form is mutated, we store a FluidRowMutation
   * reference here, in the shape of;
   * {
   *   rowId: {
   *     dataPath: FluidRowMutation
   *   }
   * }
   */
  _updatedRows: Record<string, Record<string, FluidRowMutation>> = {};
  _filteredRows: FluidTableRowData<DataItem>[] = [];
  _deletedRows: Record<string, FluidTableRowData<DataItem>> = {};
  _expandedForms: Record<string, boolean> = {};
  _paginator: HTMLFluidPaginatorElement;
  _canUseColumnGroups: boolean;
  _renderActionsColumn: boolean;

  /**
   * Stores the search box input value
   */
  _searchTerm: string;

  /**
   * Holds a reference to each filter menu so that we can reset the toggles on each when we clearFilters
   */
  _filterMenus: Record<
    string,
    HTMLFluidContextMenuElement | HTMLFluidComboBoxElement
  > = {};
  _appliedFilters: Record<string, FluidFilterSet[]> = {};
  _appliedFilterStore: Record<string, FluidFilterSet[]> = {};
  _selectedFilters: Record<string, FluidFilterSet[]> = {};

  // ================================================================ //
  // -- Stores

  tableStateStore: TableStateStore;
  tableElementStore: TableElementStore;
  tableDisplayStateStore: TableDisplayStateStore;

  // ================================================================ //
  // -- Lifecycle Hooks

  /**
   * Runs before componentWillLoad - initialise data and theme here.
   */
  connectedCallback() {
    this.initialiseStores();
    useI18n.bind(this)();
    Utils.setGlobalTheme(this);
    if (this.enableResizeObserver()) {
      this.setupContainerWidthObserver();
    }
    this.upgradeDeprecatedProperties();
    this.validateStickyHeaders();
  }

  /**
   * Checks if we should enable the resize observer or not. No point observing if
   * we aren't going to use the observed sizes.
   */
  enableResizeObserver() {
    // @TODO - Check if breakpoint settings exist to determine if we should enable the resizer.
    return false;
  }

  /**
   * Creates a FluidResizeObserver to monitor the containing elements width
   */
  setupContainerWidthObserver() {
    this._resizeObserver = new FluidResizeObserver(
      this.host.parentNode,
      (width, height) => {
        this._containerWidth = width;
        this._containerHeight = height;
      }
    );
  }

  /**
   * Called once when the component is first connected to the DOM.
   *
   * Prepare headers, initial datasource and apply default sort and pagination in
   * preparation for first render.
   */
  componentWillLoad() {
    this.setPropDefaults();
    if (!this.headers) {
      Utils.consoleWarn(this.host, TABLE_CONFIG_WARNING);
    } else {
      this.prepareHeaders();
      Utils.asyncFunction(this.initialiseDataSource.bind(this));
    }
    this.setupAnalytics();
    this._tableDisabled = this.disabled;
  }

  initialiseDataSource() {
    this._dataSource = prepareDataSource(this, this.dataItems || []);
    applyDefaultSort(this);
    applyPagination(this);
    this.upgradeDeprecatedProperties();
    this.initialiseStores();
  }

  initialiseStores() {
    this.tableElementStore = new TableElementStore({});
    this.tableDisplayStateStore = new TableDisplayStateStore({});
    this.tableStateStore = new TableStateStore({}, this.tableElementStore);
  }

  componentDidLoad() {
    if (this.enableResizeObserver()) {
      this._resizeObserver.observe();
    }
    if (this.serverMode) {
      Utils.consoleWarn(
        this.host,
        'Please Note: Server mode is in BETA, and is released to non-production environments for community testing purposes only. Upon successful completion ' +
          'of community testing, we will remove the experimental tag and release to production.'
      );
    }
  }

  componentDidRender() {
    if (!this._firstRenderedFlag) {
      this._firstRenderedFlag = true;
      emitFilterEvent(this);
      this.firstRender.emit(true);
    }
  }

  /**
   * Called when component will be updated due to @Prop or @State change.
   */
  componentWillUpdate() {
    this._rowIndex = 0;
  }

  /**
   * Called every time the component is disconnected from the DOM.
   */
  disconnectedCallback() {
    this._editableCells = {};
    this._editableForms = {};
    if (this.enableResizeObserver()) {
      this._resizeObserver.unobserve();
    }
    this._i18nStore?.deregisterElement(this._translateId);
  }

  // ================================================================ //
  // -- Dev Warnings

  /**
   * Warns if stickyHeaders is configured without a maximum height.
   * Nothing will break, it just won't work without a max height.
   */
  validateStickyHeaders() {
    if (this.stickyHeaders && !this.maxHeight) {
      Utils.consoleWarn(this.host, TABLE_STICKY_HEADERS, true);
    }
  }

  // ================================================================ //
  // -- Data Preparation

  /**
   * Checks if any of the properties that should set defaults have changed
   * @param _newVal
   * @param _oldVal
   * @param propName
   */
  componentShouldUpdate(
    _newVal: HTMLFluidTableElement[keyof HTMLFluidTableElement],
    _oldVal: HTMLFluidTableElement[keyof HTMLFluidTableElement],
    propName: keyof HTMLFluidTableElement
  ): boolean | void {
    if (
      [
        'rowBorders',
        'rowActions',
        'striped',
        'disableColumnVisibility',
      ].indexOf(propName) !== -1
    ) {
      this.setPropDefaults();
    }
    return true;
  }

  /**
   * Sets theme-specific default values for @Props if @Props aren't provided.
   */
  setPropDefaults(): void {
    this._striped = Utils.isFunction(this.rowSubset)
      ? false
      : this.striped ??
        themeVar<boolean>(this.theme, 'prop_defaults.table.striped');
    this._rowBorders = Utils.isFunction(this.rowSubset)
      ? true
      : this.rowBorders ??
        themeVar<boolean>(this.theme, 'prop_defaults.table.rowBorders');
    this._renderActionsColumn = includeRowActions(
      this.rowActions,
      this.disableColumnVisibility
    );
    if (this.searchOptions?.searchTerm) {
      this._searchTerm = this.searchOptions?.searchTerm;
    }
    this.setSelectableProperties();
  }

  setSelectableProperties() {
    this.selectionOptions = {
      toggleType: this.selectionOptions?.toggleType || FluidToggleType.CHECKBOX,
      selectAllDisabled: this.selectionOptions?.selectAllDisabled,
      ...this.selectionOptions,
    };
    this.selectable = this.selectable || this.selectionOptions?.selectable;
    this.selectableDataPath =
      this.selectableDataPath || this.selectionOptions?.selectableDataPath;
    this.selectableHeaderLabel =
      this.selectableHeaderLabel ||
      this.selectionOptions?.selectableHeaderLabel;
  }

  /**
   * To support older version of the table, which still use dataKey, this function
   * remaps all those headers to use dataPath instead, which is much more flexible
   * and is the now go-forward solution for data retrieval to support nested objects.
   */
  prepareHeaders() {
    const prepare = (
      header: FluidTableHeader,
      isSplitHeader = false,
      parent?: FluidTableHeader
    ) => {
      header.dataPath = header.dataPath ? header.dataPath : header.dataKey;
      header.visible = !isNullOrUndefined(header.visible)
        ? header.visible
        : true;
      header.dataKey = undefined;
      header.disableFilters =
        header.disableFilters || (header.splitDataPoints || []).length > 0;
      header.disableSort =
        header.disableSort || (header.splitDataPoints || []).length > 0;

      header._headerId = generateUniqueId();
      header._isSplitHeader = isSplitHeader;
      header._parentHeaderId = parent?._headerId;

      if (
        !header.dataPath &&
        hasSplitHeaders([header]) &&
        header.splitDataPoints[0].dataPath
      ) {
        header.dataPath = header.splitDataPoints[0].dataPath.split('.')[0];
      }

      return header;
    };

    this._headers = (this.headers || []).map((header) => ({
      ...prepare(header),
      splitDataPoints: header.splitDataPoints?.map((h) =>
        prepare(h, true, header)
      ),
    }));

    this._stickyColumn = !!this._headers.find((h) => h.stickyColumn);
    if (this._stickyColumn) {
      // sort for stickyColumn
      this._headers = this._headers.sort((a, b) => {
        if (a.stickyColumn && !b.stickyColumn) {
          return -1;
        }
        if (!a.stickyColumn && b.stickyColumn) {
          return 1;
        }
        return 0;
      });
    }

    isAdditionalHeaderTable(this._headers) &&
      this.prepareAdditionalHeaderRows();
    if (this.columnGroups.length > 0) {
      this.validateColumnGroups();
    }
    this.searchOptions = {
      ...defaultSearchOptions(
        flattenHeaders(this._headers).map((header) => header.dataPath)
      ),
      ...this.searchOptions,
    };
  }

  /**
   * If a header has additionalHeaderRow as TRUE, set required grouping parameters and place header at end of headers array
   */
  prepareAdditionalHeaderRows() {
    for (let i = 0; i < this._headers.length; i++) {
      const currentHeader = this._headers[i];
      if (currentHeader.grouping.additionalHeaderRow) {
        currentHeader.grouped = true;
        currentHeader.grouping.hideValueWhenGrouped = true;
        currentHeader.grouping.collapsedIf = () => false;
        this._headers.push(currentHeader);
        this._headers.splice(i, 1);
        break;
      }
    }
  }

  /**
   * Checks if column groups are defined, and if so, checks if all headers are correctly configured to use them
   */
  validateColumnGroups() {
    const invalidGroups = [];
    const headersConfiguredCorrectly = this._headers
      .reduce((isValid: boolean[], h: FluidTableHeader) => {
        const isValidColumnGroup = !!this.columnGroups.find((c) => {
          return c.columnGroupId === h.columnGroupId;
        });
        if (!isValidColumnGroup) {
          invalidGroups.push(h);
        }
        return [...isValid, !!h.columnGroupId && isValidColumnGroup];
      }, [])
      .every((isValid) => isValid);
    if (headersConfiguredCorrectly) {
      this.collectHeadersToColumnGroups();
    } else {
      Utils.consoleWarn(this.host, TABLE_INVALID_COLUMN_GROUPS(invalidGroups));
      this._canUseColumnGroups = false;
    }
  }

  /**
   * Where column groups are used, collect the headers into groups, before re-ordering the _headers array
   * to be in the correct order per column group
   */
  collectHeadersToColumnGroups() {
    this.columnGroups = this.columnGroups.reduce(
      (
        withHeaders: FluidTableColumnGroup[],
        currentGroup: FluidTableColumnGroup
      ) => {
        return [
          ...withHeaders,
          {
            ...currentGroup,
            headers: this._headers.filter(
              (h) => h.columnGroupId === currentGroup.columnGroupId
            ),
          },
        ];
      },
      []
    );
    this._headers = this.columnGroups.reduce(
      (headers: FluidTableHeader[], cg: FluidTableColumnGroup) => {
        return [...headers, ...cg.headers];
      },
      []
    );
    this._canUseColumnGroups = true;
  }

  @Watch('theme')
  @Watch('rowSubset')
  @Watch('striped')
  @Watch('rowBorders')
  handleStyleChange() {
    this._striped = Utils.isFunction(this.rowSubset)
      ? false
      : this.striped ??
        themeVar<boolean>(this.theme, 'prop_defaults.table.striped');
    this._rowBorders = Utils.isFunction(this.rowSubset)
      ? true
      : this.rowBorders ??
        themeVar<boolean>(this.theme, 'prop_defaults.table.rowBorders');
  }

  /**
   * Runs whenever the disabled flag is changed to ensure the _tableDisabled
   * state variable is updated accordingly
   */
  @Watch('disabled') onDisabledChanged() {
    this._tableDisabled = this.disabled;
  }

  /**
   * Runs when the table detects a change to dataItems - updates the state and
   * re-sorts the table
   */
  @Watch('dataItems')
  handleDataItemsChange() {
    this._editableCells = {};
    this._dataRefreshing = true;
    this._tableDisabled = true;
    this._dataSource = [];
    this.resetFilterState();
    Utils.delayBy(this.refreshDelay, () => {
      this._dataSource = prepareDataSource(this, this.dataItems);
      updateFormData(this, this._dataSource);
      resetEditableCells(this);
      applyPagination(this);
      applyDefaultSort(this);
      this._dataRefreshing = false;
      this._tableDisabled = this.disabled;
    });
  }

  /**
   * Resets the filtered rows, selected filters and applied filters stores
   */
  resetFilterState() {
    this._filteredRows = [];
    this._selectedFilters = {};
    this._appliedFilters = {};
  }

  /**
   * Watches for changes to the headers, and re-prepares them on changes.
   *
   * This is to support applications where headers are created dynamically based
   * on data delivered after first render.
   */
  @Watch('headers')
  handleHeadersChange() {
    this.prepareHeaders();
  }

  // ================================================================ //
  // -- Data Management

  /**
   * Given a row ID, returns the matching row.
   * @param rowId - the rowId of the dataItem we need.
   */
  getRowData(rowId: string) {
    return this._dataSource.find((d) => d[ID] === rowId);
  }

  /**
   * Given a rowId, and partial FluidRowData update, finds the given row in the
   * data source, applies the update, and re-assigns the datasource to update state.
   *
   * @param rowId - the row ID to update
   * @param update - the partial update
   * @param emit - if true, the mutation will be emitted from dataMutated event
   */
  updateDataSource<DataItem extends Partial<FluidTableRowData<unknown>>>(
    rowId: string,
    update: DataItem,
    emit?: boolean
  ): void {
    const rowIdx: number = this._dataSource.findIndex((ds) => ds[ID] === rowId);
    this._dataSource = this._dataSource.map((ds, idx) =>
      idx === rowIdx ? { ...ds, ...update } : ds
    );
    if (emit) {
      emitTableUpdates(this);
    }
  }

  /**
   * Given a header, and a partial FluidTableHeader update, finds the header in
   * the _headers array, and applies the update before reassigning the headers to
   * update header state.
   * @param header
   * @param update
   */
  updateHeader(
    header: FluidTableHeader,
    update: Partial<FluidTableHeader>
  ): void {
    const headerIdx: number = this._headers.findIndex(
      (h) => h.dataPath === header.dataPath
    );
    this._headers = this._headers.map((header, idx) =>
      idx === headerIdx ? { ...header, ...update } : header
    );
  }

  /**
   * Given the split header and a partial update, finds the correct header, finds its child, and
   * updates the state.
   * @param header
   * @param parent
   * @param update
   */
  updateSplitHeader(
    header: FluidTableHeader,
    parent: FluidTableHeader,
    update: Partial<FluidTableHeader>
  ): void {
    const splitHeaderIdx: number = parent.splitDataPoints.findIndex(
      (h) => h.dataPath === header.dataPath
    );
    this._headers = this._headers.map((h: FluidTableHeader) => {
      if (h.dataPath === parent.dataPath) {
        h.splitDataPoints = h.splitDataPoints.map((s, sidx) =>
          sidx === splitHeaderIdx ? { ...s, ...update } : s
        );
      }
      return h;
    });
  }

  // ================================================================ //
  // -- Publicly Exposed Methods

  /**
   * Disables or enables the entire Table (including actions, selectable
   * row Toggles, Form Elements, etc).
   * @param disabled - disables entire Table when true, enables entire Table when false
   * @param opts - configuration options
   */
  @Method() async setDisabled(
    disabled: boolean,
    opts?: FluidTableConditionalDisableOptions[]
  ) {
    if (!opts) {
      setTableDisabled(this, disabled);
      this.disabled = disabled;
      this._tableDisabled = disabled;
    } else {
      opts.forEach((opt) =>
        setFieldsDisabledConditionally(this, disabled, opt)
      );
    }
  }

  /**
   * Sets the pagination state for the table. Given a page number (0-indexed) and an
   * items per page, it first sets the selected items per page, before going to the
   * given page.
   *
   * If no itemsPerPage is provided, the table just goes to the specific page.
   * @param page
   * @param itemsPerPage
   */
  @Method() async setPaginationState(page: number, itemsPerPage?: number) {
    const paginator: HTMLFluidPaginatorElement =
      this.tableStateStore.getPaginator();
    if (paginator) {
      const setPage = async (page: number) => await paginator.setPage(page);
      if (!itemsPerPage) {
        await setPage(page);
      } else {
        const setItems: number = await paginator.setItemsPerPage(itemsPerPage);
        if (setItems !== -1) await setPage(page);
      }
    }
    return this.tableStateStore.getPaginationState();
  }

  @Method() async restoreOriginalConfiguration() {
    restoreOriginalTableConfiguration(this);
  }

  /**
   * Clears all filters and search terms.
   */
  @Method() async clearFilters() {
    this._headers = this._headers.map((header) => ({
      ...header,
      searchResults: [],
      _appliedFilters: {},
    }));
    this._searchTerm = '';
    for (const header of this.headers) {
      await this.resetFilterMenu(header);
    }
    processTableFilters(this);
  }

  /**
   * Where a table has an expandable form configured, expandAllFormRows offers a way to expand all of those rows in
   * one click. Call from a reference to the HTML element produced by <fluid-table>
   */
  @Method() async expandAllFormRows() {
    this._dataSource = this._dataSource.map((ds) => {
      this._expandedForms[ds[ID]] = true;
      return { ...ds, [FORM_EXPANDED]: true };
    });
  }

  /**
   * Where a table has an expandable form configured, collapseAllFormRows offers a way to collapse all of those rows in
   * one click. Call from a reference to the HTML element produced by <fluid-table>
   */
  @Method() async collapseAllFormRows() {
    this._dataSource = this._dataSource.map((ds) => {
      this._expandedForms[ds[ID]] = false;
      return { ...ds, [FORM_EXPANDED]: true };
    });
  }

  /**
   * Where a table has an expandable form configured, expandRow offers a way to expand an individual row by
   * providing that table's id.
   * Call from a reference to the HTML element produced by <fluid-table>
   */
  @Method() async expandRow(id: string) {
    this.tableDisplayStateStore.toggleRowExpanded(id, true);
    this.updateDataSource(id, {
      [FORM_EXPANDED]: true,
    });
    this._expandedForms[id] = true;
  }

  /**
   * Where a table has an expandable form configured, collapseRow offers a way to collapse an individual row by
   * providing that table's id.
   * Call from a reference to the HTML element produced by <fluid-table>
   */
  @Method() async collapseRow(id: string) {
    this.tableDisplayStateStore.toggleRowExpanded(id, false);
    this.updateDataSource(id, {
      [FORM_EXPANDED]: false,
    });
    this._expandedForms[id] = false;
  }

  /**
   * Where a table has an expandable template configured, expandAllTemplateRows offers a way to expand all of those rows in
   * one click. Call from a reference to the HTML element produced by <fluid-table>
   */
  @Method() async expandAllTemplateRows() {
    this._dataSource = this._dataSource.map((ds) => ({
      ...ds,
      [EXPANDED]: true,
    }));
  }

  /**
   * Where a table has an expandable template configured, collapseAllTemplateRows offers a way to expand all of those rows in
   * one click. Call from a reference to the HTML element produced by <fluid-table>
   */
  @Method() async collapseAllTemplateRows() {
    this._dataSource = this._dataSource.map((ds) => ({
      ...ds,
      [EXPANDED]: false,
    }));
  }

  /**
   * Utility method to set data items from the consuming application. This method takes an array of data objects, and effectively
   * resets the table to the data items.
   * @param dataItems
   */
  @Method() async setDataItems(
    dataItems: FluidTableRowData<DataItem>[]
  ): Promise<FluidTableRowData<DataItem>[]> {
    this.dataItems = [...dataItems];
    return new Promise<FluidTableRowData<DataItem>[]>((resolve) => {
      Utils.delayBy(this.refreshDelay + 100, () => resolve(this.dataItems));
    });
  }

  /**
   * Where a table has an expandable form configured, setElementConfig offers a way to update the configuration for a particular
   * form control, and apply it to all forms in the table (for example, updating a validation rule in response to an action outside
   * of the table). Call from a reference to the HTML element produced by <fluid-table>
   * @param controlName - the name of the control config to update.
   * @param key - the configuration property to update.
   * @param value - the value to set for the configuration property.
   */
  @Method()
  async setElementConfig(controlName: string, key: string, value: unknown) {
    //Update the expandableForm configuration
    this.expandableForm.elements = [
      ...this.expandableForm.elements.map((el: FluidFormElementConfig) => {
        if (el.controlName === controlName) {
          el[key] = value;
        }
        return el;
      }),
    ];

    //Update the form configuration instances for each row.
    await Promise.all(
      Object.keys(this._editableForms).map(async (formKey) =>
        this.setElementConfigForFormInstance(formKey, controlName, key, value)
      )
    );
  }

  /**
   * Where a table has an expandable form configured, setElementConfigForFormInstance offers a way to update the configuration for a particular
   * form control, on a specific form instance or row (for example, setting a control as disabled on a particular row/instance and
   * leaving the same control on other row/instances as enabled). Call from a reference to the HTML element produced by <fluid-table>
   * @param rowId - the rowId containing the form configuration to be changed.
   * @param controlName - the name of the control config to update.
   * @param key - the configuration property to update.
   * @param value - the value to set for the configuration property.
   */
  @Method()
  async setElementConfigForFormInstance(
    rowId: string,
    controlName: string,
    key: string,
    value: unknown
  ) {
    this._editableForms[rowId].config.elements = [
      ...(this._editableForms[rowId]?.config?.elements || []).map(
        (el: FluidFormElementConfig) => {
          if (el.controlName === controlName) {
            el[key] = value;
          }
          return el;
        }
      ),
    ];
    checkDisabledUpdateForCache(
      this._editableForms[rowId],
      key,
      value,
      null,
      this._editableForms[rowId].config.elements
        .filter((el): el is FluidFormElementConfig => 'controlName' in el)
        .find((el) => el.controlName === controlName)?.dataPath
    );
  }

  /**
   * Where a table has an expandable form or editable cells configured, markTouchedAndValidate offers a way
   * of marking the entire form and/or editable cells as touched, run their validation rules.
   *
   * @param formId - if given a formId (rowId), will only mark that particular form touched.
   */
  @Method()
  async markAsTouchedAndValidate(formId?: string): Promise<void> {
    if (formId) {
      await this._editableForms[formId].markTouchedAndValidate();
    } else {
      await Promise.all(
        getEditableCellReferences(this._editableCells).map(
          (ref: { reference: HTMLFluidFormElementElement }) =>
            ref.reference.markTouchedAndValidate()
        )
      );
      await Promise.all(
        getEditableFormReferences(this._editableForms).map(
          (ref: HTMLFluidFormElement) => ref.markTouchedAndValidate()
        )
      );
    }
    this.updateAndEmitFormState();
  }

  /**
   * Commits the internal store of updated rows to the datasource, first checking that the cells and forms are valid,
   * before emitting the mutation update, and clearing the _updateRows store.
   *
   *
   * @param host - a reference to the component, defaulted to 'this', but function can be called from a utility as well.
   */
  @Method()
  async commitRowMutations(host = this) {
    const values = await Promise.all([
      host.allFormsValid(),
      host.allCellsValid(),
    ]);

    if (values.every((valid) => valid)) {
      commitEditableCellChanges(host);
      emitTableUpdates(host, false);
      host._updatedRows = {};
    } else {
      if (host.validateOnSave) {
        await host.markAsTouchedAndValidate();
      }
    }
  }

  /**
   * Resets all editable cells and form values to the state they were in when the data was first prepared, effectively
   * cancelling all changes to the table.
   *
   * @param host - a reference to the component, defaulted to 'this', but function can be called from a utility as well.
   */
  @Method()
  async resetRowMutations(host = this) {
    resetEditableCells(host);
    resetEditableForms(host);
  }

  /**
   * Returns a mutation update, regardless of whether any changes have been made, or if any of the changes that have been made
   * are invalid - allows the consuming application to get a picture of the table state at any given moment.
   */
  @Method()
  async getTableState() {
    const tableIsValid = await this.tableIsValid();
    const pagination = this.tableStateStore.getValue(
      'pagination'
    ) as FluidPaginationState;
    return {
      ...createTableMutationUpdate(this, tableIsValid, true),
      pagination,
    };
  }

  /**
   * Executes a new search term
   * @param term string
   */
  @Method()
  async searchByTerm(term: string) {
    this._searchTerm = term;
    this.searchTable();
  }

  /**
   * Returns true if all editable forms in the table have passed their
   * validation rules.
   */
  async allFormsValid() {
    return (
      await Promise.all(getEditableFormStates(this._editableForms))
    ).every((formState: FluidFormState) => formState?.valid);
  }

  /**
   * Returns true if all editable cells in the table have passed their
   * validation rules.
   */
  async allCellsValid() {
    return (
      await Promise.all(getEditableCellStates(this._editableCells))
    ).every((cellState: FluidFormElementState) => cellState?.valid);
  }

  /**
   * Checks the validity of all forms and cells in the table and returns
   * an overall validity for the table.
   */
  async tableIsValid(): Promise<boolean> {
    const [formsValid, cellsValid] = await Promise.all([
      this.allFormsValid(),
      this.allCellsValid(),
    ]);

    return formsValid && cellsValid;
  }

  // ================================================================ //
  // -- Render Functions

  /**
   * Determine if we should apply the highlight class to the row
   * @param dataItem
   */
  shouldHighlightRow(dataItem: FluidTableRowData<DataItem>): boolean {
    return (
      (this.highlightRowIf && this.highlightRowIf(dataItem)) ||
      (this.selectionOptions?.highlightSelected && dataItem[SELECTED])
    );
  }

  /**
   * Renders a single row
   * @param dataItem
   * @param host
   * @param groupHeader
   * @param isSubsetItem
   * @param applyClass
   */
  renderRow(
    dataItem: FluidTableRowData<DataItem>,
    host: FluidTable,
    groupHeader = false,
    isSubsetItem = false,
    applyClass: { [key: string]: boolean } = {}
  ) {
    const { expandedButtonPosition } = host;
    const {
      mutuallyExclusive,
      toggleType,
      toggleConfig,
      disabledIf,
      selectableIf,
    } = this.selectionOptions ?? {};

    const { disabledRow, disabled, unselectable } = getCheckBoxRestrictionRules(
      this.disableRowIf,
      disabledIf,
      selectableIf,
      dataItem
    );

    const _hasSplitHeaders = hasSplitHeaders(this._headers);

    const selectCellProps: TableSelectCellProps = {
      allowTabIndexCells: this.allowTabIndexCells,
      disabled: this._tableDisabled || disabledRow || disabled,
      doRender: this.selectable || this.selectionOptions?.selectable,
      mutuallyExclusive,
      onSelected: () => selectRow(this, dataItem, mutuallyExclusive),
      selected: isSelected(this, dataItem),
      stickyColumn: !_hasSplitHeaders && !!this._stickyColumn,
      toggleConfig,
      toggleId: dataItem[ID],
      toggleStyle: toggleType,
      unselectable,
    };

    const row = [
      // Grouped Table Placeholder Cell
      <CellPlaceholder
        conditionalOn={
          isGroupedTable(this._headers) &&
          !isAdditionalHeaderTable(this._headers)
        }
      />,

      // Selectable Row Column
      <SelectCell {...selectCellProps} />,

      // User Defined Headers
      <TableCellSet
        rowDisabled={disabledRow || this._dataRefreshing || this._tableDisabled}
        isSubsetItem={isSubsetItem}
        groupHeader={groupHeader}
        headers={this._headers}
        dataItem={dataItem}
        rowId={dataItem[ID]}
        host={this}
        allowTabIndexCells={this.allowTabIndexCells}
        selectionOptions={this.selectionOptions}
      />,

      // Delete Column
      this.handleDelete && (
        <td
          class="table-data-cell action-cell"
          style={{ width: this.columnAdjustments?.delete }}
        >
          <DeleteIcon
            doRender={true}
            disabled={this._tableDisabled || disabledRow}
            asButton={true}
            theme={this.theme}
            handleDelete={() => {
              !this._tableDisabled && !disabledRow && this.deleteRow(dataItem);
            }}
          />
        </td>
      ),
    ];

    // ==== Expandable Row

    const _hasExpansionPanel =
      Utils.isFunction(this.expandableRowTemplate) &&
      !!this.expandableRowTemplate(dataItem);

    const _hasSubsetPanel =
      Utils.isFunction(this.rowSubset) && this.rowSubset(dataItem)?.length > 0;

    const _isExpandable =
      !isSubsetItem && (_hasExpansionPanel || _hasSubsetPanel);

    const _renderExpandPanelCell =
      Utils.isFunction(this.expandableRowTemplate) ||
      Utils.isFunction(this.rowSubset);

    const _isSubsetHeader = !isSubsetItem && Utils.isFunction(this.rowSubset);
    const _isExpanded = is(dataItem, this._dataSource, EXPANDED);

    const expandPanelCell = !this.expandableForm ? (
      <ExpandPanelCell
        expanded={this.tableDisplayStateStore.isRowExpanded(dataItem[ID])}
        placeholderCell={!_isExpandable}
        conditionalOn={_renderExpandPanelCell}
        theme={this.theme}
        onClick={() => {
          this.tableDisplayStateStore.toggleRowExpanded(dataItem[ID]);
          this.updateDataSource(dataItem[ID], {
            [EXPANDED]: !_isExpanded,
          });
          this.expansionToggled.emit({
            expanded: !_isExpanded,
            rowData: dataItem,
          });
        }}
      />
    ) : (
      <ExpandPanelCell
        expanded={formExpanded(
          this._expandedForms,
          dataItem,
          this._dataSource,
          this.rowIdentifier
        )}
        conditionalOn={!!this.expandableForm}
        theme={this.theme}
        onClick={() => {
          this.tableDisplayStateStore.toggleRowExpanded(dataItem[ID]);
          this._expandedForms[dataItem[ID]] =
            !this._expandedForms[dataItem[ID]];
          this.updateDataSource(dataItem[ID], {
            [FORM_EXPANDED]: this._expandedForms[dataItem[ID]],
          });
          this.expansionToggled.emit({
            expanded: !_isExpanded,
            rowData: dataItem,
          });
        }}
      />
    );

    /*
     * add the expanded cell to the right or to the left
     * expandable row template default is to the right
     * expandable form default is to the left
     */

    if (!expandedButtonPosition) {
      // set default behavior
      if (this.expandableForm) {
        row.unshift(expandPanelCell);
      } else {
        row.push(expandPanelCell);
      }
    } else {
      if (expandedButtonPosition === 'left') {
        row.unshift(expandPanelCell);
      } else {
        row.push(expandPanelCell);
      }
    }

    // add action column to the end of the array
    if (this._renderActionsColumn) {
      row.push(this.renderActionColumn(dataItem, disabledRow));
    }

    const rowClass = {
      hidden: !dataItem[VISIBLE] && !applyClass['expanded'],
      'additional-header': isAdditionalHeaderTable(this._headers),
      'group-header': groupHeader,
      grouped: !!this._headers.some((h) => h.grouped),
      highlight: dataItem[VISIBLE] && this.shouldHighlightRow(dataItem),
      'row-disabled': this._tableDisabled || disabledRow,
      'striped-bg':
        this._striped && dataItem[VISIBLE] && ++this._rowIndex % 2 === 0,
      'row-border': this._rowBorders,
      'subset-header': _isSubsetHeader,
      'subset-rows-visible': _isSubsetHeader && _isExpandable && _isExpanded,
      ...applyClass,
    };

    const rowWrapper = (
      <tr
        class={rowClass}
        key={dataItem[ID]}
        tabIndex={Utils.setTabIndex(this.allowTabIndexRows)}
      >
        {row}
      </tr>
    );

    return !isSubsetItem && (this.expandableRowTemplate || this.rowSubset)
      ? [
          rowWrapper,
          this.renderExpandableRow(dataItem, !this.disableColumnVisibility),
        ]
      : this.expandableForm
      ? [
          rowWrapper,
          <TableForm
            host={this}
            dataItem={dataItem}
            visible={is(dataItem, this._dataSource, VISIBLE)}
            formExpanded={formExpanded(
              this._expandedForms,
              dataItem,
              this._dataSource,
              this.rowIdentifier
            )}
            allowTabIndexRows={this.allowTabIndexRows}
            allowTabIndexCells={this.allowTabIndexCells}
            expandedButtonPosition={expandedButtonPosition}
            colSpan={this.headers.length}
            isActionColumnDisplayed={!this.disableColumnVisibility}
          />,
        ]
      : [rowWrapper];
  }

  /**
   * Deletes the given dataItem by reassigning the dataSource with the dataItem filtered out, adds it to
   * the _deletedRows store, recalculates the groupings and emits the new table state.
   * @param dataItem - the dataItem to delete.
   */
  deleteRow(dataItem: FluidTableRowData<DataItem>) {
    this._deletedRows[dataItem[ID]] = dataItem;
    this._dataSource = this._dataSource.filter((ds) => ds[ID] !== dataItem[ID]);
    this._groupedDataSource = groupDataSource(this._headers, this._dataSource);
    emitTableUpdates(this);
  }

  /**
   * Marks all rows as deleted, and refreshes the data source.
   * (Used in File Upload Component)
   */
  deleteAll() {
    if (!this.enableDeleteAll) return;
    this._deletedRows = this._dataSource.reduce(
      (
        deletedRows: Record<string, FluidTableRowData<DataItem>>,
        current: FluidTableRowData<DataItem>
      ) => {
        deletedRows[current[ID]] = current;
        return deletedRows;
      },
      {}
    );
    this._dataSource = [];
    this._groupedDataSource = groupDataSource(this._headers, this._dataSource);
    this.dataMutated.emit(createTableMutationUpdate(this, true));
  }

  /**
   * Renders action column
   */
  renderActionColumn(dataItem: FluidTableRowData<DataItem>, rowDisabled) {
    const rowActionsStyle =
      this.columnAdjustments && this.columnAdjustments.rowActions
        ? {
            width: this.columnAdjustments.rowActions,
          }
        : {};
    return (
      <td class="table-data-cell action-cell" style={rowActionsStyle}>
        {(this.rowActions || []).reduce(
          (actions: HTMLElement[], action: FluidTableAction) => {
            if (action.conditionalOn ? action.conditionalOn(dataItem) : true) {
              const actionIsDisabled =
                (this._tableDisabled || rowDisabled) &&
                !action.overrideDisabled?.(dataItem);
              actions.push(
                <TableActionButton
                  action={action}
                  disabled={actionIsDisabled}
                  dataItem={dataItem}
                  actionClicked={this.actionClicked}
                  handleCellClicked={() =>
                    this.cellClicked.emit({
                      rowId: dataItem[ID],
                      dataPath: 'rowAction',
                      row: dataItem,
                    })
                  }
                  retainTransientProperties={this.retainTransientProperties}
                  theme={this.theme}
                />
              );
            }
            return actions;
          },
          []
        )}
      </td>
    );
  }

  /**
   * Renders a subset of table rows for a particular dataItem, by executing
   * the given function with the current dataItems as its parameter and rendering
   * the returned array of FluidRowData.
   * @param dataItem
   */
  renderSubsetTable(dataItem: FluidTableRowData<DataItem>) {
    const dataItems: FluidTableRowData<DataItem>[] =
      !!this.rowSubset && this.rowSubset(dataItem);
    const rowClass = (first, last) => ({
      'expand-row': true,
      'subset-row': true,
      'subset-first': first,
      'subset-last': last,
      expanded:
        this.getRowData(dataItem[ID])?.[EXPANDED] &&
        this.getRowData(dataItem[ID])?.[VISIBLE],
    });

    /**
     * Apply dataItem identifiers as if they are top level
     * rows
     * @TODO - Use to manage editable cell changes in future version
     * @param dataItems
     */
    const prepareSubsetItems = (dataItems: FluidTableRowData<DataItem>[]) =>
      dataItems.map((dItem, idx) => ({
        ...dItem,
        [ID]: canUseIdentifiers(dataItems, this.rowIdentifier)
          ? `${dataItem[this.rowIdentifier]}_${idx}`
          : `${dataItem[ID]}_${idx}`,
      }));
    return prepareSubsetItems(dataItems).map((dataItem, idx) =>
      this.renderRow(
        dataItem,
        this,
        false,
        true,
        rowClass(idx === 0, idx === dataItems.length - 1)
      )
    );
  }

  /**
   * Renders an expandable row template
   * @param dataItem
   * @param isActionColumnDisplayed
   */
  renderExpandableRow(
    dataItem: FluidTableRowData<DataItem>,
    isActionColumnDisplayed: boolean
  ) {
    if (this.rowSubset && !this.expandableRowTemplate) {
      return this.renderSubsetTable(dataItem);
    }
    const rowClass = {
      'expand-row': true,
      expanded:
        this.getRowData(dataItem[ID])?.[EXPANDED] &&
        this.getRowData(dataItem[ID])?.[VISIBLE],
    };
    return (
      <tr class={rowClass} tabIndex={Utils.setTabIndex(this.allowTabIndexRows)}>
        <td
          colSpan={this._headers.length + 1}
          tabIndex={Utils.setTabIndex(this.allowTabIndexCells)}
        >
          {this.useRenderer ? (
            <FluidComponent
              definition={
                this.expandableRowTemplate(dataItem) as FluidComponentDefinition
              }
            />
          ) : (
            <div innerHTML={this.expandableRowTemplate(dataItem) as string} />
          )}
        </td>
        {isActionColumnDisplayed && <td />}
      </tr>
    );
  }

  /**
   * Collects references to all editable fields and forms, and returns an array of element/form
   * states so the parent can check validity
   */
  updateAndEmitFormState() {
    Promise.all([
      getEditableFormStates(this._editableForms),
      getEditableCellStates(this._editableCells),
    ]).then((values) => {
      // eslint-disable-next-line prefer-spread
      Promise.all([].concat.apply([], values)).then((results) => {
        this.nestedFormState.emit(results.map((r) => ({ state: r })));
      });
    });
  }

  /**
   * Update the _filterMenu ref store
   * @param ref
   * @param header
   */
  setFilterRef(
    ref: HTMLFluidContextMenuElement | HTMLFluidComboBoxElement,
    header: FluidTableHeader
  ) {
    this._filterMenus[header.dataPath] = ref;
  }

  /**
   * Resets the filter menus depending on type - if search (combo-box), reset the
   * search and trigger the value change event to update the filters, or if default/custom,
   * reset the toggles.
   * @param header
   */
  async resetFilterMenu(header: FluidTableHeader) {
    header.enableColumnSearch
      ? await (this._filterMenus[header.dataPath] as HTMLFluidComboBoxElement)
          ?.reset(true)
          .then(() =>
            (
              this._filterMenus[header.dataPath] as HTMLFluidComboBoxElement
            ).triggerValueChange()
          )
      : await (
          this._filterMenus[header.dataPath] as HTMLFluidContextMenuElement
        )?.resetToggles(true);
  }

  /**
   * Get the value of the search box, search the table, then update the datasource
   * to reflect data items that been filtered out.
   */
  searchTable() {
    this._dataRefreshing = true;
    const searchResults = searchDataSource(
      this._dataSource,
      this._headers,
      this._searchTerm,
      this.searchOptions?.searchableColumns,
      this.searchOptions?.excludeFiltered,
      this.searchOptions?.deepSearch
    );

    const searchResultPayload = { searchTerm: this._searchTerm, searchResults };

    //--- start analytics integration
    this.tableSearched.emit(searchResultPayload);
    sendEvent(
      this.host,
      this.parentLayerId,
      'tableSearched',
      searchResultPayload
    );
    //--- end analytics integration

    const updatedDataSource = this._dataSource.map((ds) => {
      const isVisible = !!searchResults.find((sr) => sr[ID] === ds[ID]);
      return {
        ...ds,
        [VISIBLE]: isVisible,
        [FILTERED]: !isVisible,
      };
    });
    this._dataSource = updatedDataSource;
    this._groupedDataSource = groupDataSource(this._headers, this._dataSource);
    paginate(this);
    this._dataRefreshing = false;
  }

  /**
   * Handle the table search. If search is dynamic then debounce search, so we
   * don't fire so often and cause render jitter.
   * @param searchTerm
   */
  async handleSearchTermUpdate(searchTerm: string) {
    const clearSearch = async () => {
      this._searchTerm = '';
      /* this.clearSearch();
       ** TODO https://forge.lmig.com/issues/browse/FLUID-114
       ** Create a separate function to clear search instead of clear filters
       */
      await this.clearFilters();
    };
    const debouncedSearch = Utils.debounce(
      () => this.searchTable(),
      this.searchOptions?.debounceTime
    );
    this._searchTerm = searchTerm;
    if (!this._searchTerm) {
      await clearSearch();
    }
    if (this.searchOptions?.dynamicSearch) {
      debouncedSearch();
    }
  }

  /**
   * Main render function
   */
  render() {
    const {
      wrapperClass,
      tableClass,
      tableWrapperClass,
      tableStyle,
      tableBodyClass,
    } = getTableStyles(this);
    const headerProps = (header, index): TableHeaderCellProps => ({
      header,
      headers: this._headers,
      theme: this.theme,
      host: this,
      dataItems: this._dataSource,
      disableActiveFiltering: this.disableActiveFiltering,
      actionSortBy: (sortedBy: string, direction: FluidSortOrder) =>
        sortBy(this, sortedBy, header, direction, this.serverMode),
      setFilterRef: (
        filterMenuRef: HTMLFluidContextMenuElement | HTMLFluidComboBoxElement
      ) => this.setFilterRef(filterMenuRef, header),
      appliedFilters: this._appliedFilters[header.dataPath],
      selectedFilters: this._selectedFilters[header.dataPath],
      onApplyFilters: () => processTableFilters(this),
      onResetFilterMenu: (header: FluidTableHeader) =>
        this.resetFilterMenu(header).then(() => processTableFilters(this)),
      columnAdjustments: this.columnAdjustments,
      allowOverflow: this.allowOverflow,
      allowTabIndexCells: this.allowTabIndexCells,
      stickyColumn: this._stickyColumn && index === 0,
      selectionOptions: this.selectionOptions,
      serverMode: this.serverMode,
      fluidTranslate: this.fluidTranslate,
      i18nStore: this._i18nStore,
    });

    /**
     * Collect the table header elements
     */
    const headers: HTMLElement[] = this._headers
      .filter((header) => !header.grouping?.additionalHeaderRow)
      .map((header, index) => {
        return <TableHeaderCell {...headerProps(header, index)} />;
      });

    const splitHeaderGroup = this._headers.reduce(
      (headers: HTMLElement[], header: FluidTableHeader, index) => {
        const colSpan = header.splitDataPoints
          ? header.splitDataPoints.length
          : 1;
        const rowSpan = header.splitDataPoints ? 1 : 2;
        headers.push(
          <TableHeaderCell
            {...headerProps(header, index)}
            colSpan={colSpan}
            rowSpan={rowSpan}
            splitLevel={1}
            allowTabIndexCells={this.allowTabIndexCells}
          />
        );
        return headers;
      },
      []
    );

    const splitHeaderSubHeaders = this._headers.reduce(
      (headers: HTMLElement[], header: FluidTableHeader) => {
        if (header.splitDataPoints) {
          headers.push(
            ...(header?.splitDataPoints || []).map((hd, index) => {
              return (
                <TableHeaderCell {...headerProps(hd, index)} splitLevel={2} />
              );
            })
          );
        }
        return headers;
      },
      []
    );

    const _hasEditableCells = this.headers?.some((h) => !!h.editableCellConfig);

    let searchBarActions = this.tableActions || [];
    if (this.exportOptions && this.exportOptions.actionConfig) {
      searchBarActions = [
        ...(searchBarActions || []),
        createExportAction(this.exportOptions.actionConfig),
      ];
    }

    /**
     * Set up the render state before the render, so we only call certain
     * functions once per render
     */
    const renderState = {
      visibleDataItems: getVisibleDataItems(this._groupedDataSource),
      filtersAreApplied: filtersAreApplied(this),
      includeRowActions: includeRowActions(
        this.rowActions,
        this.disableColumnVisibility
      ),
    };

    return (
      <div class={wrapperClass}>
        {/* Table Controls (Form Controls, etc */}
        <TableControlBar host={this} placement={FluidVerticalPosition.TOP} />
        {/* Table Action Bar */}
        <TableSearchBar
          enableSearch={this.enableSearch}
          searchTable={() => this.searchTable()}
          handleSearchTermUpdate={(searchTerm) =>
            this.handleSearchTermUpdate(searchTerm)
          }
          fluidTranslate={this.fluidTranslate}
          searchTerm={this._searchTerm}
          searchOptions={this.searchOptions}
          tableActions={searchBarActions}
          actionClicked={this.actionClicked}
          defaultHandlers={{
            exportVisibleData: () =>
              this.getTableState().then((tableState) =>
                createExportHandler(
                  tableState,
                  this._headers,
                  this.exportOptions,
                  this.tableId
                )
              ),
          }}
        />
        {/* Table Heading Slot @slot = table-header-row */}
        <SlottedTableHeader
          doRender={!!this.host.querySelector('[slot="table-header-row"]')}
        >
          <slot name={'table-header-row'} />
        </SlottedTableHeader>
        {/* Table Wrapper */}
        <div class={tableWrapperClass} style={tableStyle}>
          {/* Table Start */}
          <table class={tableClass} id={this.tableId}>
            {/* Single Level Table Headers */}
            <TableHeaderRow
              headers={headers}
              host={this}
              i18nStore={this._i18nStore}
              selectionOptions={this.selectionOptions}
              allowTabIndexRows={this.allowTabIndexRows}
              allowTabIndexCells={this.allowTabIndexCells}
            />

            {/* Split Level Table Headers */}
            <SplitPointHeader
              host={this}
              topLevelHeaders={splitHeaderGroup}
              secondLevelHeaders={splitHeaderSubHeaders}
              selectionOptions={this.selectionOptions}
            />

            {/* Table Body Start */}
            {this._groupedDataSource.map((ds) => (
              <tbody class={tableBodyClass}>
                {[
                  /* Group Header (if applicable) */
                  <GroupHeader
                    host={this}
                    headers={this._headers}
                    config={ds.groupConfig}
                    externalState={this.externalState}
                    dataItems={ds.groupedData}
                    visibleDataItems={renderState.visibleDataItems}
                    selectable={this.selectionOptions.selectable}
                    expanded={this.tableDisplayStateStore.isGroupExpanded(
                      ds.groupHeader?.[ID]
                    )}
                    groupId={ds.groupHeader?.[ID]}
                    toggleExpand={(groupId) => {
                      this.tableDisplayStateStore.toggleGroupExpanded(groupId);
                      toggleExpand(groupId, this);
                    }}
                    allowTabIndexRows={this.allowTabIndexRows}
                    allowTabIndexCells={this.allowTabIndexCells}
                    theme={this.theme}
                  />,
                  <AdditionalHeaderRow
                    headers={this._headers}
                    dataItems={ds.groupedData}
                    selectable={this.selectionOptions.selectable}
                    allowTabIndexRows={this.allowTabIndexRows}
                    allowTabIndexCells={this.allowTabIndexCells}
                  />,

                  /* Table Rows */
                  <GroupedItems
                    expanded={this.tableDisplayStateStore.isGroupExpanded(
                      ds.groupHeader?.[ID]
                    )}
                    dataItems={ds.groupedData}
                    render={(dataItem) =>
                      (!!this.expandableForm ||
                        _hasEditableCells ||
                        dataItem[VISIBLE]) &&
                      this.renderRow(dataItem, this)
                    }
                  />,

                  /* Group Footer (if applicable) */
                  <GroupFooter
                    headers={this._headers}
                    externalState={this.externalState}
                    dataItems={ds.groupedData}
                    selectable={this.selectionOptions.selectable}
                    includeRowActions={renderState.includeRowActions}
                    allowTabIndexRows={this.allowTabIndexRows}
                    expandedButtonPosition={this.expandedButtonPosition}
                    host={this}
                    hasExpandedElements={
                      !!this.expandableRowTemplate || !!this.expandableForm
                    }
                  />,
                ]}
              </tbody>
            ))}
            <TableFooter
              dataItems={this.dataItems}
              headers={this._headers}
              includeRowActions={renderState.includeRowActions}
              allowTabIndexRows={this.allowTabIndexRows}
            />
          </table>

          {/* Table Empty State - Caused by filters */}
          <TableEmptyFilterState
            filtersApplied={renderState.filtersAreApplied}
            visibleDataItems={renderState.visibleDataItems}
            clearFilters={() => this.clearFilters()}
          />

          {/* Table Empty State - Caused by no data */}
          <TableEmptyState
            showEmptyState={
              !this.dataLoading &&
              !!this.emptyStateConfig &&
              !renderState.filtersAreApplied
            }
            visibleDataItems={renderState.visibleDataItems}
            emptyStateConfig={this.emptyStateConfig as FluidEmptyStateConfig}
            actionClick={(actionKey: string) =>
              this.actionClicked.emit({ actionKey })
            }
            loading={this.dataLoading || this._dataRefreshing}
          />

          {/* Table Loading Indicator */}
          <TableLoadingState
            dataLoading={this.dataLoading || this._dataRefreshing}
            visibleDataItems={renderState.visibleDataItems}
          />
        </div>

        {/* Table Paginator */}
        <Paginator
          paginated={this.paginated}
          fluidTranslate={this.fluidTranslate}
          theme={this.theme}
          overrideGlobalTheme={this.overrideGlobalTheme}
          dataItems={this._dataSource}
          setPaginatorRef={(ref) => this.tableElementStore?.setPaginator(ref)}
          isPaginatorTotalItemsDisabled={this.isPaginatorTotalItemsDisabled}
          rangeIndicatorTemplate={this.rangeIndicatorTemplate}
          itemsPerPageTemplate={this.itemsPerPageTemplate}
          paginationItemsPerPageOptions={this.paginationItemsPerPageOptions}
          onPageChanged={(paginationState: FluidPaginationState) => {
            setPaginationState(this, paginationState);
            applyPagination(this);
          }}
        />
        {/* Table Controls (Form Controls, etc */}
        <TableControlBar host={this} placement={FluidVerticalPosition.BOTTOM} />
        <slot />
      </div>
    );
  }

  // ================================================================ //
  // -- Internal Props
  //
  // -- Note: This is not a public API - these properties
  // -- should only be used internally by FLUID components.

  /**
   * If true, margin will be removed as form is inline with
   * another element
   * @internal
   */
  @Prop() inline = false;

  /**
   * When this Prop is true AND handleDelete Prop is true, the "delete"
   * icon rendered in the Table header will delete ALL rows in the Table.
   * Mainly used in File Upload component.
   * @internal
   */
  @Prop() enableDeleteAll = false;

  /**
   * Allows you to pass an external state object to the table, which it can
   * use in certain computations.
   */
  @Prop() externalState?: Record<string, unknown>;

  /**
   * @experimental
   * If true, the table will enter server mode, which disables filtering, pagination and
   * sorting, in favour of events and custom filters provided by the calling application.
   *
   * The table will not receive all of the data, and thus will not be able to generate its
   * own filters for each column, instead only providing the custom filters passed in from
   * the calling application, and emitting an event when the user selects them.
   */
  @Prop() serverMode?: boolean = false;

  // ================================================================ //
  // -- Deprecated Properties

  upgradeDeprecatedProperties() {
    this.formActionsConfig = upgradeFormActions(
      this.tableId,
      this.showEditActions,
      this.editActionsPlacement,
      this.formActionsConfig
    );
    this.emptyStateConfig = upgradeEmptyStateConfig(this.emptyStateConfig);
  }

  /**
   * @deprecated
   * @internal
   * @default true
   */
  @Prop() showEditActions = true;

  /**
   * @deprecated
   * @internal
   * @default 'bottom'
   */
  @Prop() editActionsPlacement: TableControlsPlacement =
    FluidVerticalPosition.BOTTOM;

  /**
   * @deprecated
   * @internal
   */
  @Prop({ mutable: true }) selectable: boolean;

  /**
   * @deprecated
   * @internal
   */
  @Prop({ mutable: true }) selectableHeaderLabel: string;

  /**
   * @deprecated
   * @internal
   */
  @Prop({ mutable: true }) selectableDataPath: string;

  // ================================================================ //
  // -- Analytics Properties

  /**
   * If the element should be configured at a component level for the FLUID data layer,
   * this configuration dictates how it should be instrumented
   * @internal
   * @experimental
   */
  @Prop() analyticsConfig: FluidDataLayerComponentConfiguration;
  parentLayerId: string;
  setupAnalytics() {
    this.parentLayerId = FluidDataLayerUtils.getClosestDataLayer(this.host)?.id;
  }

  // ================================================================ //
  // -- Internationalisation

  /* @internal */
  @Prop() fluidTranslate: FluidTableTranslationOptions;
  private _translateId: string;
  private _i18nStore: FluidI18nStore | undefined;
}

export interface FluidTableTranslationOptions {
  columnVisibility?: {
    title?: string;
    closeButton?: {
      label?: string;
    };
  };
  filters?: {
    columnFilters?: {
      label?: string;
      toggleAllLabel?: string;
      closeButton?: {
        label?: string;
      };
    };
    columnSearch?: {
      title?: string;
    };
  };
  exportOptions?: {
    buttonConfig?: FluidButtonTranslations;
  };
  paginator?: FluidPaginatorTranslationOptions;
  searchBox?: FluidSearchBoxTranslationOptions;
}
