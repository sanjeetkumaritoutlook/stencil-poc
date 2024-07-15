import {
  FluidAnchorPosition,
  FluidFlexAlignment,
  FluidFlexJustification,
  FluidFormElementConfig,
  FluidFormElementType,
  FluidTableHeader,
  FluidTableRowMetadata,
} from '@lmig/fluid-core';

// ================================================================ //
// -- Component Grabbers

export const DATA_LAYER = document.querySelector('fluid-data-layer');

// ================================================================ //
// -- Element Registry Names

export const HEADER_ENTRY = 'header';
export const FOOTER_ENTRY = 'footer';
export const SIDEBAR_LEFT_ENTRY = 'sidebar-left';
export const SIDEBAR_RIGHT_ENTRY = 'sidebar-right';

// ================================================================ //
// -- HTML Attributes

/**
 * Global HTML attributes (i.e. can be used on any element) for
 * use in attribute tunneling.
 */
export const GLOBAL_HTML_ATTRS = ['tabindex', 'title', 'role'];

export const ATTR = {
  disabled: 'disabled',
  title: 'title',
  hidden: 'hidden',
};

// ================================================================ //
// -- Style Constants

export const FULL_HEIGHT_DEFAULT = '100vh';

// ================================================================ //
// -- Warning Messages

/**
 * Popover
 */
export const POPOVER_CHROME_INFO =
  'We have had to deprecate our native popover property due to the experimental Popover API having been introduced to Chrome recently. For more information, please see: https://chromestatus.com/feature/5463833265045504';

/**
 * Table
 */
export const TABLE_CONFIG_WARNING =
  'Table configuration is missing - please ensure table has been configured with headers.';

export const TABLE_STICKY_HEADERS =
  'Table is configured with sticky headers, but no maxHeight specified. Sticky headers will not be applied.';

export const MULTIPLE_SELECTED_INITIAL =
  'When setting initial value from selectable options property, only one may be selected. Returning the first selectable option.';

export const TABLE_FILTER_NO_ROWS = 'No results found with applied filters.';

export const TABLE_INVALID_COLUMN_GROUPS = (
  invalidHeaders: FluidTableHeader[]
) => {
  return `Column groups are configured, but the following headers do not have a valid group: ${invalidHeaders
    .map((h) => h.dataPath)
    .join(', ')}`;
};

export const TABLE_ROW_ID_DEFAULT = (tableId: string, idx: number) =>
  `${tableId}_${idx}`;

export const TABLE_HEADER_CELL_ID = (tableId: string, dataPath: string) =>
  `${tableId}_${dataPath}_header`;

export const TABLE_CELL_ID = (dataPath: string, rowIdx: string) =>
  `${rowIdx}_${dataPath}`;

/**
 * Form / Form Array
 */
export const NESTED_FORM_HAS_ERRORS = (formLabel: string) =>
  `Please address the errors in the ${
    formLabel ?? ''
  } entries before proceeding.`;

export const FORM_HORIZONTAL_CONFIG_ERROR =
  'Horizontal layout configured but some elements missing elementWidth property - rendering vertical form instead.';

export const FORM_GRID_CONFIG_ERROR =
  'Grid layout configured with no columnOptions - rendering vertical form instead.';

export const MISSING_GRID_ROW_CONFIG =
  'You must configure gridRow on all elements to define a row and column layout';

export const MISSING_GRID_COLUMN_CONFIG =
  'You must configure all elements with a gridColumn property to use a grid layout - rendering vertical instead.';

export const INVALID_CONFIG =
  'Your form configuration contains invalid element configuration - some elements may not have a valid controlName, dataPath or label.';

export const NO_CONTROL_NAME = (
  returnType: string,
  element: FluidFormElementConfig,
  valueUsed: string
) => {
  return `No controlName configured for element ${
    element.label || ''
  }. Using ${returnType} value of ${valueUsed} to track field state instead.`;
};

/**
 * Accordion
 */
export const ACCORDION_CHILDREN =
  'Must contain at least one fluid-accordion-panel child';

export const ACCORDION_CHILDREN_TYPE =
  'All children must be of type fluid-accordion-panel';

/**
 * Grid
 */
export const GRID_CHILDREN =
  'FLUID Grid must contain at least one FLUID Grid Item child';

export const GRID_CHILDREN_TYPE =
  'All children of FLUID Grid must be FLUID Grid Item components';

export const GRID_JUSTIFY_VALIDATION = (justify: FluidFlexJustification) =>
  `Invalid "justify" Prop value: "${justify}". Resetting to default value`;

export const GRID_ALIGN_ITEMS_VALIDATION = (align: FluidFlexAlignment) =>
  `Invalid "alignItems" Prop value: "${align}". Resetting to default value`;

export const GRID_ITEM_ORDER_VALIDATION =
  '"order" Prop value must be between 1-12';

export const GRID_ITEM_COLUMN_VALIDATION = (colSize: string) =>
  `"${colSize}" Prop value must be between 1-12, "auto", or "fill"`;

/**
 * Icon
 */
export const NO_ICON_BY_KEY = (key: string) =>
  `No icon with key ${key} exists. If you wish to use it in your application, please add it to fluid-icon`;

/**
 * Modal
 */
export const MODAL_PRIMARY_ACTIONS =
  'Modal actions should contain at most ONE primary action.';

export const MODAL_SECONDARY_ACTIONS =
  'Modal actions should have at least ONE secondary action.';

export const MODAL_CLOSE_PREVENTED =
  'Modal has been prevented from closing due to keyboard interception - please ensure you have handled appropriately.';
/**
 * Paginator
 */
export const PAGINATOR_NO_DATA =
  'Paginator has no data to calculate pagination state';

export const PAGINATOR_OPTION_DOES_NOT_EXIST = (itemsPerPage) =>
  `Page size of ${itemsPerPage} is not one of the configured items per page options.`;

/**
 * Alert
 */
export const ALERT_DISMISSIBLE =
  'Alerts with "error" or "warning" severity are not dismissible';

export const ALERT_LOADING =
  'Alerts with "error" or "warning" severity should not be "loading" as they signify an issue, rather than ongoing process.';

/**
 * Tab / Tabs
 */
export const NO_TAB_IDS =
  'All tabs must have an ID if you want to change tab programmatically';

export const NO_TAB_WITH_ID = (tabId) =>
  `No tab with id '${tabId} was found when attempting to programmatically change tabs`;

export const HIDDEN_ACTIVE_TAB = (tabId) =>
  `The Tab with id ${tabId} is active this tab cannot be made hidden`;

export const ACTIVE_HIDDEN_TAB = (tabId) =>
  `The Tab with id ${tabId} is hidden can't be activated`;

/**
 * Toggle
 */
export const SWITCH_LABEL_MAX_LENGTH = 3;

export const SWITCH_LABEL_EXCEEDS_MAX_LENGTH = `Switches should not use internal labels of more than ${SWITCH_LABEL_MAX_LENGTH} characters.`;

/**
 * Carousel
 */
export const CAROUSEL_NO_ELEMENTS = 'You must supply at least one element';

export const CAROUSEL_UNIQUE_IDS = 'Each element must have an unique id!';

export const CAROUSEL_INVALID_ACTIVE_ID =
  'Unable to set active slide, no ID matches';

/**
 * Combo Box
 */
export const COMBO_BOX_MASKING_DISABLED =
  'Masking is only available for custom input. Change "allowCustomInput" to be true to enable masking.';

export const COMBO_BOX_INVALID_VALUES = (invalidVals: string[]) =>
  `Invalid option value(s) provided: ${invalidVals.join(', ')}`;

export const COMBO_BOX_EXCEEDS_MAX_VALUES = (firstSelectedVal: string) =>
  `Only 1 selected option allowed unless "multiSelect" is true. Selecting first option provided: ${firstSelectedVal}`;

/**
 * Radio Group / Select
 */
export const INVALID_OPTION_VALUE = (invalidValue: string) =>
  `Invalid option value provided: ${invalidValue}`;

/**
 * File Upload
 */
export const FILE_UPLOAD_VALID_DATAPATHS = [
  'name',
  'type',
  'size',
  'lastModified',
];

export const FILE_UPLOAD_DEFAULT_EMPTY_STATE_CONFIG = {
  message: 'Drag and drop files or',
  linkText: 'browse.',
};

export const FILE_UPLOAD_DEFAULT_POPULATED_STATE_CONFIG = {
  message: (files: File[]) =>
    files.length === 1
      ? ` Upload ${files[0].name} or `
      : ` Upload (${files.length}) files or `,
  linkText: 'clear',
};
export const INVALID_FILE_TYPE_UPLOADED =
  'Some files were not uploaded due to file-type restrictions';

export const INVALID_FILE_UPLOAD_COLUMN = (dataPath: string) =>
  `${dataPath} is not a valid column for the file upload table - removing from the custom headers`;

/**
 * FLUID Content
 */
export const INVALID_CONTENT_IMPLEMENTATION =
  'FLUID Content should NOT be implemented independently of FLUID Page. Please replace FLUID Content instance with FLUID Container (for in-page content), or FLUID Page (for main page container).';

/**
 * Focus Trap
 */
export const FOCUS_TRAP_INVALID_AUTOFOCUS =
  'Element provided to autoFocusNode() is not a tabbable child of the root element. Resetting to first tabbable child.';

/**
 * Linear Progress
 */
export const LINEAR_PROGRESS_INVALID_VALUE = (
  propName: string,
  defaultVal: number
) =>
  `Prop "${propName}" must be a number. Resetting to default value: ${defaultVal}.`;

/**
 * Header
 */
export const HEADER_INVALID_ALIGNMENT = (invalidAlignment: string) =>
  `"${invalidAlignment}" is not a valid value for the "alignment" Prop. Resetting to default value.`;

export const MEGA_MENU_COLUMN_LENGTH = (title: string, maxColLength: number) =>
  `Mega menu column titled: "${title}" has more links than the recommended maximum of ${maxColLength}. Please reduce the number of links in this column for best user experience.`;

export const MEGA_MENU_MIN_COLUMNS = (minCols: number) =>
  `Mega menu contains less columns than the recommended minimum of ${minCols}. Please increase the number of columns in this mega menu or use standard "dropdown menu(s)" for best user experience.`;

export const MEGA_MENU_MAX_COLUMNS = (maxCols: number) =>
  `Mega menu contains more columns than the recommended maximum of ${maxCols}. Please reduce the number of columns in this mega menu for best user experience.`;

/**
 * In Page Nav
 */
export const IN_PAGE_NAV_INVALID_ANCHOR = (anchor: FluidAnchorPosition) => {
  const inverseAnchor =
    anchor === FluidAnchorPosition.LEFT
      ? FluidAnchorPosition.RIGHT
      : FluidAnchorPosition.LEFT;
  return `In-Page Nav with "anchor: ${anchor}" cannot be used with a ${anchor}-hand Sidebar (i.e. "${anchor}SidebarConfig"). Updating "inPageNavConfig" to have "anchor: ${inverseAnchor}".`;
};

export const IN_PAGE_NAV_INCOMPATIBLE_SIDEBARS =
  'In-Page Nav cannot be implemented when 2 Sidebars exist. To use In-Page Nav, remove one Sidebar config & configure In-Page Nav\'s "anchor" to be on the opposite side of the page (e.g. In-Page Nav with "anchor: right" can be used with "leftSidebarConfig").';

export const IN_PAGE_NAV_INVALID_TARGET = (invalidHref: string) =>
  `Undefined or invalid scroll target "${invalidHref}"`;

/**
 * Tree Menu
 */
export const TREE_MENU_INVALID_ID = (invalidId: string) =>
  `Menu item with "id" property "${invalidId}" does not exist.`;

export const TREE_MENU_DISABLED_ID = (invalidId: string) =>
  `Menu item with "id" property "${invalidId}" is disabled & cannot be selected.`;

/**
 * Sidebar
 */
export const SIDEBAR_MENU_ITEMS =
  'When using "treeMenuConfig" Prop, use "treeMenuConfig.menuItems" to populate menu items instead of separate "menuItems" Prop.';

/**
 * Data Layer
 */
export const DATA_LAYER_WARNING_ELEMENT = {
  tagName: 'DATA LAYER',
} as HTMLElement;
export const NO_TROUX_UUID = (
  appId: string
) => `👋🏻 Data Layer for ${appId} is not configured with a Troux UUID - as of FLUID Core 1.2.17, this is a required field.
  Please ensure you have set one before deploying your application to production.`;
export const STAND_IN_TROUX = (appId: string) =>
  `stand-in-troux-for-${appId}--please-update`;

// ================================================================ //
// -- Global Z-Index Magnitudes

/**
 * Each component that uses the global z-index management system has
 * a "magnitude" that is added to the BASE_ZINDEX value (or the custom
 * "baseZIndex" Prop value set in ThemeProvider) to produce its final
 * z-index value. This system provides a structured z-index hierarchy
 * that ensures that all absolute/fixed-position components display
 * as intended.
 */
export const BASE_ZINDEX = 99000;

export const ZINDEX_MAGNITUDES = {
  fluidComboBox: 1,
  fluidContextMenu: 1,
  fluidDropdownButton: 1,
  fluidPopover: 1,
  fluidFooter: 2,
  fluidLoadingSpinner: 3,
  fluidSidebar: 3,
  fluidStickyButton: 3,
  fluidHeader: 4,
  fluidDrawer: 5,
  fluidModal: 5,
  fluidTour: 5,
  fluidAlert: 6, // Only applies when Alert is used as a snackbar
};

// ================================================================ //
// -- Table Data Keys

export const PATH_DELIM = '.';
export const SELECTED = 'selectedRow';
export const EXPANDED = 'expandedRow';
export const FORM_EXPANDED = 'expandedForm';
export const GROUP_HEADER = 'groupHeader';
export const VISIBLE = 'rowVisible';
export const FILTERED = 'rowFiltered';
export const ID = 'rowId';

export const DATA_KEYS: (keyof FluidTableRowMetadata)[] = [
  ID,
  VISIBLE,
  FILTERED,
  GROUP_HEADER,
  EXPANDED,
  FORM_EXPANDED,
  SELECTED,
];

/**
 * Utility Constants
 */
export const ELEMENTS_WITH_SELECTABLE_OPTIONS = [
  FluidFormElementType.COMBO_BOX,
  FluidFormElementType.SELECT,
  FluidFormElementType.RADIO_GROUP,
];
