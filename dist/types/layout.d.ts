/**
 * Extended freeze-panes layout engine for the premium package.
 *
 * Builds on the pure primitives from `freeze-panes-table` (`stickyOffset`,
 * `zIndexForLayer`) and adds premium capabilities: freezing trailing (right)
 * columns, a richer layer model, and boundary-stick sticky offsets for every
 * frozen pane edge (top, left, and right).
 */
import { type CellPosition, type GridSizes } from 'freeze-panes-table';
/** Text alignment used by premium cell rendering. */
export type TextAlign = 'left' | 'center' | 'right';
/** Object-fit mode for image cells. */
export type ImageFit = 'cover' | 'contain' | 'fill';
/** Freeze configuration with premium right-side freeze support. */
export interface AdvancedFreezeConfig {
    /** Freeze the first `freezeRows` rows (sticky top). Ignored when `freezeAt` is set. */
    freezeRows?: number;
    /** Freeze the first `freezeCols` columns (sticky left). Ignored when `freezeAt` is set. */
    freezeCols?: number;
    /** Freeze the trailing `freezeRightCols` columns (sticky right). */
    freezeRightCols?: number;
    /**
     * Excel-style freeze panes at a cell: freezes every row above `freezeAt.row`
     * and every column to the left of `freezeAt.col`. Takes precedence over
     * `freezeRows` / `freezeCols`. `freezeRightCols` still applies independently.
     */
    freezeAt?: CellPosition;
    /** Individual cells pinned in place while the rest of the grid scrolls. */
    pinnedCells?: CellPosition[];
}
/** Which sticky layer a cell belongs to, ranked by z-order. */
export type CellLayerAdvanced = 'normal' | 'row' | 'col' | 'col-right' | 'corner' | 'corner-right' | 'pinned';
/** The resolved freeze plan used by the layout functions. */
export interface ResolvedAdvancedFreeze {
    freezeRows: number;
    freezeCols: number;
    freezeRightCols: number;
    pinnedCells: CellPosition[];
    /** Number of columns, used to compute right-side offsets. */
    columnCount: number;
}
/** Sticky style for a single cell. `right` is used by trailing-frozen columns. */
export interface AdvancedCellStickyStyle {
    layer: CellLayerAdvanced;
    zIndex: number;
    top?: number;
    left?: number;
    right?: number;
}
/**
 * Resolve an `AdvancedFreezeConfig` into a concrete plan. `freezeAt` wins over
 * the row/column counts; `freezeRightCols` is clamped so it cannot overlap the
 * left-frozen region.
 */
export declare function resolveAdvancedFreeze(config: AdvancedFreezeConfig, columnCount: number): ResolvedAdvancedFreeze;
/** Whether a cell is individually pinned. */
export declare function isPinnedAdvanced(resolved: ResolvedAdvancedFreeze, row: number, col: number): boolean;
/** The first column index of the right-frozen region (or `columnCount` if none). */
export declare function rightStartIndex(resolved: ResolvedAdvancedFreeze): number;
/**
 * The layer a cell occupies:
 * - `pinned`: explicitly pinned (highest z-order).
 * - `corner`: inside frozen rows and frozen left columns.
 * - `corner-right`: inside frozen rows and frozen right columns.
 * - `row`: inside the frozen rows only.
 * - `col`: inside the frozen left columns only.
 * - `col-right`: inside the frozen right columns only.
 * - `normal`: everything else.
 */
export declare function cellLayerAdvanced(resolved: ResolvedAdvancedFreeze, row: number, col: number): CellLayerAdvanced;
/** z-index for a layer. Pinned sits above the corners, which sit above the edges. */
export declare function zIndexForLayerAdvanced(layer: CellLayerAdvanced): number;
/**
 * Sticky offset measured from the right edge for the cell at `col`. The sum of
 * widths to the right of (and including) this column, i.e. the distance the
 * cell must sit above the right pane edge.
 */
export declare function stickyOffsetRight(lengths: number[], col: number): number;
/**
 * Compute the sticky style for a single cell. Frozen cells use CSS sticky
 * offsets, so they scroll normally until they touch the edge of their frozen
 * pane and only then stick (Excel-style boundary behavior).
 */
export declare function freezeCellStyleAdvanced(resolved: ResolvedAdvancedFreeze, row: number, col: number, sizes: GridSizes): AdvancedCellStickyStyle;
