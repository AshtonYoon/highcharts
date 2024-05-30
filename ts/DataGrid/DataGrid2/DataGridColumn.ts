/* *
 *
 *  Data Grid class
 *
 *  (c) 2020-2024 Highsoft AS
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 *  Authors:
 *  - Dawid Dragula
 *
 * */

'use strict';

/* *
 *
 *  Imports
 *
 * */

import DataGridCell from './DataGridCell.js';
import DataGridTable from './DataGridTable.js';
import DataTable from '../../Data/DataTable.js';
import Globals from './Globals.js';


/* *
 *
 *  Class
 *
 * */

/**
 * Represents a column in the data grid.
 */
class DataGridColumn {

    /* *
    *
    *  Properties
    *
    * */

    /**
     * The viewport (table) the column belongs to.
     */
    public viewport: DataGridTable;

    /**
     * The width ratio of the column.
     */
    public widthRatio: number = 1;

    /**
     * The cells of the column.
     */
    public cells: DataGridCell[] = [];

    /**
     * The name of the column.
     */
    public name: string;

    /**
     * The data of the column.
     */
    public data?: DataTable.Column;

    /**
     * The type of the column data.
     */
    public type?: DataGridColumn.Type;

    /**
     * The head element of the column.
     */
    public headElement?: HTMLElement;

    /**
     * The head element of the column.
     */
    public index: number;


    /* *
    *
    *  Constructor
    *
    * */

    /**
     * Constructs a column in the data grid.
     *
     * @param viewport The viewport (table) the column belongs to.
     * @param name The name of the column.
     */
    constructor(viewport: DataGridTable, name: string, index: number) {
        this.name = name;
        this.viewport = viewport;
        this.data = viewport.dataTable.getColumn(name);
        this.index = index;
    }


    /* *
    *
    *  Methods
    *
    * */

    /**
     * Registers a cell in the column.
     *
     * @param cell The cell to register.
     */
    public registerCell(cell: DataGridCell): void {
        this.cells.push(cell);
    }

    /**
     * Calculates the width of the column. The width is based on the width of
     * the viewport, the number of columns and the width ratio of the column.
     */
    public getWidth(): number {
        const { viewport } = this;
        return (
            viewport.tbodyElement.clientWidth / viewport.columns.length
        ) * this.widthRatio;
    }

    /**
     * Sets the column hover state.
     *
     * @param hovered Whether the column should be hovered.
     */
    public setHover(hovered: boolean): void {
        this.headElement?.classList[hovered ? 'add' : 'remove'](
            Globals.classNames.hoveredColumn
        );

        for (let i = 0, iEnd = this.cells.length; i < iEnd; ++i) {
            this.cells[i].htmlElement.classList[hovered ? 'add' : 'remove'](
                Globals.classNames.hoveredColumn
            );
        }
    }

    /* *
    *
    *  Static Methods
    *
    * */

}


/* *
 *
 *  Class Namespace
 *
 * */

namespace DataGridColumn {
    export type Type = 'number'|'date'|'string'|'boolean';
}


/* *
 *
 *  Default Export
 *
 * */

export default DataGridColumn;
