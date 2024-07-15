import {
  FluidComponentDefinition,
  FluidTableHeader,
  FluidTheme,
} from '@lmig/fluid-core';
import { newSpecPage } from '@stencil/core/testing';

import { TestUtils } from '../../utils/test/test-utils';
import { Utils } from '../../utils/utils';
import { FluidTable } from './fluid-table';
import any = jasmine.any;

// @ts-ignore
window.ResizeObserver = TestUtils.resizeObserverMock();

describe('fluid-table', () => {
  let page, component;

  const tableId = 'mock-table-id';

  let dataItems: any[];

  let headers: FluidTableHeader[];

  /************************************************************************************
   * Render tests
   ***********************************************************************************/

  describe('Basic Table Rendering', () => {
    async function componentSetup(tableHeaders = true, tableData = true) {
      component.tableId = tableId;
      component.headers = tableHeaders ? headers : undefined;
      component.dataItems = tableData ? dataItems : undefined;
      page.root.appendChild(component);
      await page.waitForChanges();
      expect(page.root.shadowRoot).toBeTruthy();
      const el = page.root.shadowRoot.querySelector('.fluid-table');
      expect(el).toBeTruthy();
      return el;
    }

    beforeEach(async () => {
      dataItems = [
        {
          firstName: 'Joe',
          surname: 'Flynn',
          role: 'Developer',
          location: 'Bangor',
        },
        {
          firstName: 'Stefan',
          surname: 'Kennedy',
          role: 'Developer',
          location: 'Belfast',
        },
        {
          firstName: 'Suzanne',
          surname: 'Shek',
          role: 'UX',
          location: 'Belfast',
        },
        {
          firstName: 'Troy',
          surname: 'Holleman',
          role: 'UX',
          location: 'Indianapolis',
        },
        {
          firstName: 'Nathan',
          surname: 'Beaulieu',
          role: 'Developer',
          location: 'Dover',
        },
      ];
      headers = [
        { label: 'First Name', dataPath: 'firstName' },
        { label: 'Last Name', dataPath: 'surname' },
        { label: 'Role', dataPath: 'role' },
        { label: 'Location', dataPath: 'location' },
      ];
      page = await newSpecPage({
        components: [FluidTable],
        html: '<div></div>',
      });
      component = page.doc.createElement('fluid-table');
    });

    // ================================================================ //
    // -- Shadow DOM & Theme

    describe('Shadow DOM & Theme', () => {
      it('should render a Table with shadow DOM', async () => {
        await componentSetup();
      });

      it('should render a table with corporate theme by default', async () => {
        const el = await componentSetup();
        expect(el.closest('.fluid-table-wrapper')).toHaveClass(FluidTheme.CORP);
      });

      it('should render a Table with Legacy theme', async () => {
        component.theme = FluidTheme.LEGACY;
        const el = await componentSetup();
        expect(el.closest('.fluid-table-wrapper')).toHaveClass(
          FluidTheme.LEGACY
        );
      });

      it('should render a Table with LM theme', async () => {
        component.theme = FluidTheme.LM;
        const el = await componentSetup();
        expect(el.closest('.fluid-table-wrapper')).toHaveClass(FluidTheme.LM);
      });

      it('should render a Table with Corp theme', async () => {
        component.theme = FluidTheme.CORP;
        const el = await componentSetup();
        expect(el.closest('.fluid-table-wrapper')).toHaveClass(FluidTheme.CORP);
      });
    });

    // ================================================================ //
    // -- Table Structure

    describe('Table Structure', () => {
      it('should render a basic table', async () => {
        await componentSetup();
      });

      it('should render when headers is set to undefined', async () => {
        await componentSetup(false, true);
      });
    });

    // ================================================================ //
    // -- Table Striping & Row Borders

    describe('Table Striping & Row Borders', () => {
      // ==== Legacy Theme

      it('should render a Legacy theme Table WITH row striping & WITHOUT row borders by default', async () => {
        component.theme = FluidTheme.LEGACY;
        const el = await componentSetup();
        const rows = el.querySelectorAll('tbody tr');

        expect(rows[0]).not.toHaveClass('striped-bg');
        expect(rows[0]).not.toHaveClass('row-border');
        expect(rows[1]).toHaveClass('striped-bg');
        expect(rows[1]).not.toHaveClass('row-border');
      });

      it('should render a Legacy theme Table WITHOUT row striping & WITH row borders when @Prop overrides set', async () => {
        component.theme = FluidTheme.LEGACY;
        component.striped = false;
        component.rowBorders = true;
        const el = await componentSetup();
        const rows = el.querySelectorAll('tbody tr');

        expect(rows[0]).not.toHaveClass('striped-bg');
        expect(rows[0]).toHaveClass('row-border');
        expect(rows[1]).not.toHaveClass('striped-bg');
        expect(rows[1]).toHaveClass('row-border');
      });

      // ==== LM Theme

      it('should render an LM theme Table WITHOUT row striping & WITH row borders by default', async () => {
        component.theme = FluidTheme.LM;
        const el = await componentSetup();
        const rows = el.querySelectorAll('tbody tr');

        expect(rows[0]).not.toHaveClass('striped-bg');
        expect(rows[0]).toHaveClass('row-border');
        expect(rows[1]).not.toHaveClass('striped-bg');
        expect(rows[1]).toHaveClass('row-border');
      });

      it('should render an LM theme Table WITH row striping & WITHOUT row borders when @Prop overrides set', async () => {
        component.theme = FluidTheme.LM;
        component.striped = true;
        component.rowBorders = false;
        const el = await componentSetup();
        const rows = el.querySelectorAll('tbody tr');

        expect(rows[0]).not.toHaveClass('striped-bg');
        expect(rows[0]).not.toHaveClass('row-border');
        expect(rows[1]).toHaveClass('striped-bg');
        expect(rows[1]).not.toHaveClass('row-border');
      });

      // ==== Corp Theme

      it('should render a Corp theme Table WITHOUT row striping & WITH row borders by default', async () => {
        component.theme = FluidTheme.CORP;
        const el = await componentSetup();
        const rows = el.querySelectorAll('tbody tr');

        expect(rows[0]).not.toHaveClass('striped-bg');
        expect(rows[0]).toHaveClass('row-border');
        expect(rows[1]).not.toHaveClass('striped-bg');
        expect(rows[1]).toHaveClass('row-border');
      });

      it('should render a Corp theme Table WITH row striping & WITHOUT row borders when @Prop overrides set', async () => {
        component.theme = FluidTheme.CORP;
        component.striped = true;
        component.rowBorders = false;
        const el = await componentSetup();
        const rows = el.querySelectorAll('tbody tr');

        expect(rows[0]).not.toHaveClass('striped-bg');
        expect(rows[0]).not.toHaveClass('row-border');
        expect(rows[1]).toHaveClass('striped-bg');
        expect(rows[1]).not.toHaveClass('row-border');
      });
    });

    // ================================================================ //
    // -- Additional Header Row

    describe('Additional Header Row', () => {
      beforeEach(() => {
        dataItems = [
          {
            customServices: 'Claims Reviews',
            groupingType: 'Account Management',
            cost: '4500 ',
          },
          {
            customServices: 'Field Investigation',
            groupingType: 'Claim Investigation',
            cost: '4200 ',
          },
          {
            customServices: 'Reserve Change',
            groupingType: 'Financials',
            cost: '12000 ',
          },
          {
            customServices: 'Reserve Change',
            groupingType: 'Financials',
            cost: '1000 ',
          },
          {
            customServices: 'Field Investigation',
            groupingType: 'Claim Investigation',
            cost: '5500 ',
          },
          {
            customServices: 'Field Investigation',
            groupingType: 'Claim Investigation',
            cost: '4200 ',
          },
          {
            customServices: 'Field Investigation',
            groupingType: 'Claim Investigation',
            cost: '4200',
          },
        ];
      });

      it('should render an additional header row when additionalHeaderRow is TRUE', async () => {
        headers = [
          {
            label: 'Grouping type',
            dataPath: 'groupingType',
            // @ts-ignore
            grouping: {
              headerValue: (group: any[]) => {
                return group[0].groupingType;
              },
              additionalHeaderRow: true,
            },
          },
          { dataPath: 'customServices', label: 'Service' },
          { dataPath: 'cost', label: 'Cost' },
        ];
        const el = await componentSetup();
        const rows = el.querySelectorAll('tbody tr');

        expect(rows[0]).toHaveClass('fluid-table-additional-header-row');
      });

      it('should NOT render an additional header row when additionalHeaderRow is FALSE', async () => {
        headers = [
          {
            label: '',
            dataPath: 'groupingType',
            // @ts-ignore
            grouping: {
              headerValue: (group: any[]) => {
                return group[0].groupingType;
              },
              additionalHeaderRow: false,
            },
          },
          { dataPath: 'customServices', label: 'Service' },
          { dataPath: 'cost', label: 'Cost' },
        ];
        const el = await componentSetup();
        const rows = el.querySelectorAll('tbody tr');

        expect(rows[0]).not.toHaveClass('fluid-table-additional-header-row');
      });
    });

    // ================================================================ //
    // -- Table Footer

    describe('Table Footer', () => {
      beforeEach(() => {
        dataItems = [
          {
            customServices: 'Claims Reviews',
            cost: '4500 ',
          },
          {
            customServices: 'Field Investigation',
            cost: '4200 ',
          },
          {
            customServices: 'Reserve Change',
            cost: '12000 ',
          },
        ];
      });

      it('should render a Table Footer when footerValue is present', async () => {
        function createFooterCell(
          value,
          isNumber = true
        ): FluidComponentDefinition {
          return {
            component: 'fluid-text',
            props: {
              strong: true,
              align: isNumber ? 'right' : 'left',
            },
            content: value,
          };
        }

        headers = [
          { dataPath: 'customServices', label: 'Service' },
          {
            dataPath: 'cost',
            label: 'Cost',
            // @ts-ignore
            footerValue: (dataItems) => 'Total Cost: $0',
            footerRenderComponent: (value) => createFooterCell(value, false),
          },
        ];
        const el = await componentSetup();
        const footer = el.querySelector('.fluid-table-footer');

        expect(footer).not.toBeNull();
      });

      it('should NOT render a Table Footer when footerValue is NOT present', async () => {
        headers = [
          { dataPath: 'customServices', label: 'Service' },
          { dataPath: 'cost', label: 'Cost' },
        ];
        const el = await componentSetup();
        const footer = el.querySelector('.fluid-table-footer');

        expect(footer).toBeNull();
      });
    });
  });

  /************************************************************************************
   * Functional tests
   ***********************************************************************************/

  describe('Functional Tests', () => {
    let component: FluidTable;

    beforeEach(() => {
      component = new FluidTable();
    });

    describe('prepareHeaders', () => {
      it('should default _headers to empty array if headers is undefined', () => {
        component.headers = undefined;
        component.prepareHeaders();
        expect(component._headers).toEqual([]);
      });
    });

    it('should place a header to the end of the headers array if additionalHeaderRow is TRUE', () => {
      component._headers = [
        {
          label: '',
          dataPath: 'groupingType',
          grouped: true,
          // @ts-ignore
          grouping: {
            collapsedIf: () => true,
            hideValueWhenGrouped: true,
            additionalHeaderRow: true,
          },
        },
        { dataPath: 'one', label: 'One', columnGroupId: 'one' },
        { dataPath: 'two', label: 'Two', columnGroupId: 'one' },
        { dataPath: 'three', label: 'Three' },
        { dataPath: 'four', label: 'Four', columnGroupId: 'two' },
      ];
      component.prepareAdditionalHeaderRows();
      expect(component._headers).toEqual([
        { dataPath: 'one', label: 'One', columnGroupId: 'one' },
        { dataPath: 'two', label: 'Two', columnGroupId: 'one' },
        { dataPath: 'three', label: 'Three' },
        { dataPath: 'four', label: 'Four', columnGroupId: 'two' },
        {
          label: '',
          dataPath: 'groupingType',
          grouped: true,
          // @ts-ignore
          grouping: {
            collapsedIf: any(Function),
            hideValueWhenGrouped: true,
            additionalHeaderRow: true,
          },
        },
      ]);
    });

    describe('validateColumnGroups', () => {
      it('should set _canUseColumnGroups to false if not all headers have a column group defined', () => {
        component._headers = [
          { dataPath: 'one', label: 'One', columnGroupId: 'one' },
          { dataPath: 'two', label: 'Two', columnGroupId: 'one' },
          { dataPath: 'three', label: 'Three' },
          { dataPath: 'four', label: 'Four', columnGroupId: 'two' },
        ];
        component.columnGroups = [
          { columnGroupId: 'one', label: 'Column Group One' },
          { columnGroupId: 'two', label: 'Column Group Two' },
        ];
        component.validateColumnGroups();
        expect(component._canUseColumnGroups).toEqual(false);
      });

      it('should log a warning when column groups are defined incorrectly', () => {
        const consoleWarnSpy = jest.spyOn(Utils, 'consoleWarn');
        component._headers = [
          { dataPath: 'one', label: 'One', columnGroupId: 'one' },
          { dataPath: 'two', label: 'Two', columnGroupId: 'one' },
          { dataPath: 'three', label: 'Three' },
          { dataPath: 'four', label: 'Four', columnGroupId: 'two' },
        ];
        component.columnGroups = [
          { columnGroupId: 'one', label: 'Column Group One' },
          { columnGroupId: 'two', label: 'Column Group Two' },
        ];
        component.validateColumnGroups();
        expect(consoleWarnSpy).toHaveBeenCalled();
      });

      it('should set _canUseColumnGroups to false if not all headers have a column group defined, but not all are valid', () => {
        component._headers = [
          { dataPath: 'one', label: 'One', columnGroupId: 'one' },
          { dataPath: 'two', label: 'Two', columnGroupId: 'one' },
          { dataPath: 'three', label: 'Three', columnGroupId: 'three' },
          { dataPath: 'four', label: 'Four', columnGroupId: 'two' },
        ];
        component.columnGroups = [
          { columnGroupId: 'one', label: 'Column Group One' },
          { columnGroupId: 'two', label: 'Column Group Two' },
        ];
        component.validateColumnGroups();
        expect(component._canUseColumnGroups).toEqual(false);
      });

      it('should call collectHeadersToColumnGroups if all headers have a valid column group defined', () => {
        const collectColumnGroupsSpy = jest.spyOn(
          component,
          'collectHeadersToColumnGroups'
        );
        component._headers = [
          { dataPath: 'one', label: 'One', columnGroupId: 'one' },
          { dataPath: 'two', label: 'Two', columnGroupId: 'one' },
          { dataPath: 'three', label: 'Three', columnGroupId: 'two' },
          { dataPath: 'four', label: 'Four', columnGroupId: 'two' },
        ];
        component.columnGroups = [
          { columnGroupId: 'one', label: 'Column Group One' },
          { columnGroupId: 'two', label: 'Column Group Two' },
        ];
        component.validateColumnGroups();
        expect(collectColumnGroupsSpy).toHaveBeenCalled();
      });
    });

    describe('collectHeadersToColumnGroups', () => {
      it('should adorn the configured column groups with an array of headers matching each columnGroupId', () => {
        component._headers = [
          { dataPath: 'one', label: 'One', columnGroupId: 'one' },
          { dataPath: 'two', label: 'Two', columnGroupId: 'one' },
          { dataPath: 'three', label: 'Three', columnGroupId: 'two' },
          { dataPath: 'four', label: 'Four', columnGroupId: 'two' },
        ];
        component.columnGroups = [
          { columnGroupId: 'one', label: 'Column Group One' },
          { columnGroupId: 'two', label: 'Column Group Two' },
        ];

        component.collectHeadersToColumnGroups();

        expect(component.columnGroups).toEqual([
          {
            columnGroupId: 'one',
            label: 'Column Group One',
            headers: [
              { dataPath: 'one', label: 'One', columnGroupId: 'one' },
              { dataPath: 'two', label: 'Two', columnGroupId: 'one' },
            ],
          },
          {
            columnGroupId: 'two',
            label: 'Column Group Two',
            headers: [
              { dataPath: 'three', label: 'Three', columnGroupId: 'two' },
              { dataPath: 'four', label: 'Four', columnGroupId: 'two' },
            ],
          },
        ]);
      });

      it('should reorder the headers based on the column group order they belong to', () => {
        component._headers = [
          { dataPath: 'one', label: 'One', columnGroupId: 'two' },
          { dataPath: 'two', label: 'Two', columnGroupId: 'two' },
          { dataPath: 'three', label: 'Three', columnGroupId: 'one' },
          { dataPath: 'four', label: 'Four', columnGroupId: 'one' },
        ];
        component.columnGroups = [
          { columnGroupId: 'one', label: 'Column Group One' },
          { columnGroupId: 'two', label: 'Column Group Two' },
        ];

        component.collectHeadersToColumnGroups();

        expect(component._headers).toEqual([
          { dataPath: 'three', label: 'Three', columnGroupId: 'one' },
          { dataPath: 'four', label: 'Four', columnGroupId: 'one' },
          { dataPath: 'one', label: 'One', columnGroupId: 'two' },
          { dataPath: 'two', label: 'Two', columnGroupId: 'two' },
        ]);
      });
    });
  });
});
