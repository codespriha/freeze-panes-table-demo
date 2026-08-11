import { type ColumnDef } from 'freeze-panes-table';
import { type AdvancedFreezeConfig, type ImageFit, type TextAlign } from './layout.js';
/** Rendering mode. `auto` switches on data size and freeze configuration. */
export type TableMode = 'auto' | 'table' | 'advanced';
/** Built-in themes. */
export type ThemeName = 'light' | 'dark';
/** Row density presets. */
export type DensityName = 'compact' | 'comfortable' | 'roomy';
/** Text-only cell content with per-cell alignment. */
export interface TextCellContent {
    type: 'text';
    text: string;
    align?: TextAlign;
}
/** Image cell content with object-fit and alignment. */
export interface ImageCellContent {
    type: 'image';
    src: string;
    alt?: string;
    fit?: ImageFit;
    align?: TextAlign;
    width?: number;
    height?: number;
}
/** Accepted cell values. Anything else is stringified. */
export type CellContent = string | number | boolean | null | undefined | Node | TextCellContent | ImageCellContent;
/** Options for {@link createAdvancedTable}. */
export interface AdvancedTableOptions {
    /** Column definitions. */
    columns: ColumnDef[];
    /** 2D cell values, indexed by row then column. */
    rows: unknown[][];
    /** Freeze configuration (frozen rows, left/right columns, freeze panes, pinned cells). */
    freeze?: AdvancedFreezeConfig;
    /** Leading rows rendered in `<thead>` as `<th>`. Defaults to `0`. */
    headerRows?: number;
    /**
     * Explicit row heights in px, used for sticky offsets. When omitted, heights
     * are measured from the rendered DOM (and re-measured on resize).
     */
    rowHeights?: number[];
    /**
     * `'table'` renders a regular responsive table; `'advanced'` renders the
     * frozen-panes table; `'auto'` (default) picks `'advanced'` when a freeze
     * config is set or when row count exceeds `advancedThreshold`.
     */
    mode?: TableMode;
    /** Row count above which `auto` mode switches to the advanced table. Default `50`. */
    advancedThreshold?: number;
    /** Custom cell renderer. Return a string or a `Node`. */
    renderCell?: (value: unknown, row: number, col: number) => string | Node | null | undefined;
    /** Custom header renderer for `<th>` cells. */
    renderHeader?: (column: ColumnDef, colIndex: number) => string | Node | null | undefined;
    /** Extra class(es) added to the root wrapper. */
    className?: string;
    /** Cap the scroll container height (px). */
    maxHeight?: number;
    /** Cap the scroll container width (px). */
    maxWidth?: number;
    /** Render column titles in bold. Defaults to `true`. */
    boldHeader?: boolean;
    /** Render frozen left-pane cells in bold. Defaults to `true`. */
    boldFrozenLeft?: boolean;
    /** Show a toolbar with left/right scroll arrows above the table. Defaults to `false`. */
    headerArrows?: boolean;
    /** Color theme. Defaults to `'light'`. */
    theme?: ThemeName;
    /** Row density. Defaults to `'comfortable'`. */
    density?: DensityName;
    /** Default horizontal text alignment for text cells. */
    textAlign?: TextAlign;
    /** Default object-fit for image cells. Defaults to `'contain'`. */
    imageFit?: ImageFit;
}
/** Controller returned by {@link createAdvancedTable}. */
export interface AdvancedTableController {
    /** The root wrapper element (toolbar + scroll container), already appended to `container`. */
    readonly element: HTMLElement;
    /** Re-render with merged options. */
    update(patch: Partial<AdvancedTableOptions>): void;
    /** Scroll the container so the cell is aligned at the top-left of the scrollable region. */
    scrollToCell(row: number, col: number): void;
    /** Remove the table from the DOM and release observers. */
    destroy(): void;
}
/**
 * Mount a premium freeze-panes table into `container`.
 *
 * - `auto` mode renders a regular responsive table for small data and switches
 *   to the advanced frozen-panes table for large datasets or configured freezes.
 * - Frozen cells use boundary-stick offsets, so they scroll normally until they
 *   touch their frozen pane edge (top, left, or right) and only then stick.
 * - Right-side freeze, themes, densities, bold panes, header arrows, and
 *   image/text cells are all premium extras.
 */
export declare function createAdvancedTable(container: HTMLElement, options: AdvancedTableOptions): AdvancedTableController;
