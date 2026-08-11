/**
 * Extended freeze-panes layout engine for the premium package.
 *
 * Builds on the pure primitives from `freeze-panes-table` (`stickyOffset`,
 * `zIndexForLayer`) and adds premium capabilities: freezing trailing (right)
 * columns, a richer layer model, and boundary-stick sticky offsets for every
 * frozen pane edge (top, left, and right).
 */
import { stickyOffset } from 'freeze-panes-table';
/**
 * Resolve an `AdvancedFreezeConfig` into a concrete plan. `freezeAt` wins over
 * the row/column counts; `freezeRightCols` is clamped so it cannot overlap the
 * left-frozen region.
 */
export function resolveAdvancedFreeze(config, columnCount) {
    const freezeRows = config.freezeAt !== undefined ? config.freezeAt.row : (config.freezeRows ?? 0);
    const freezeCols = config.freezeAt !== undefined ? config.freezeAt.col : (config.freezeCols ?? 0);
    const clampedCols = Math.max(0, Math.floor(freezeCols));
    const maxRight = Math.max(0, Math.max(0, Math.floor(columnCount)) - clampedCols);
    const freezeRightCols = Math.min(Math.max(0, Math.floor(config.freezeRightCols ?? 0)), maxRight);
    return {
        freezeRows: Math.max(0, Math.floor(freezeRows)),
        freezeCols: clampedCols,
        freezeRightCols,
        pinnedCells: config.pinnedCells ?? [],
        columnCount: Math.max(0, Math.floor(columnCount)),
    };
}
/** Whether a cell is individually pinned. */
export function isPinnedAdvanced(resolved, row, col) {
    return resolved.pinnedCells.some((p) => p.row === row && p.col === col);
}
/** The first column index of the right-frozen region (or `columnCount` if none). */
export function rightStartIndex(resolved) {
    return resolved.columnCount - resolved.freezeRightCols;
}
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
export function cellLayerAdvanced(resolved, row, col) {
    if (isPinnedAdvanced(resolved, row, col))
        return 'pinned';
    const colRight = col >= rightStartIndex(resolved);
    const rowFrozen = row < resolved.freezeRows;
    const colFrozen = col < resolved.freezeCols;
    if (rowFrozen && colFrozen)
        return 'corner';
    if (rowFrozen && colRight)
        return 'corner-right';
    if (rowFrozen)
        return 'row';
    if (colFrozen)
        return 'col';
    if (colRight)
        return 'col-right';
    return 'normal';
}
/** z-index for a layer. Pinned sits above the corners, which sit above the edges. */
export function zIndexForLayerAdvanced(layer) {
    switch (layer) {
        case 'row':
        case 'col':
        case 'col-right':
            return 2;
        case 'corner':
        case 'corner-right':
            return 3;
        case 'pinned':
            return 4;
        default:
            return 0;
    }
}
/**
 * Sticky offset measured from the right edge for the cell at `col`. The sum of
 * widths to the right of (and including) this column, i.e. the distance the
 * cell must sit above the right pane edge.
 */
export function stickyOffsetRight(lengths, col) {
    return lengths.slice(col + 1).reduce((total, width) => total + (width ?? 0), 0);
}
/**
 * Compute the sticky style for a single cell. Frozen cells use CSS sticky
 * offsets, so they scroll normally until they touch the edge of their frozen
 * pane and only then stick (Excel-style boundary behavior).
 */
export function freezeCellStyleAdvanced(resolved, row, col, sizes) {
    const layer = cellLayerAdvanced(resolved, row, col);
    const style = { layer, zIndex: zIndexForLayerAdvanced(layer) };
    if (layer === 'row' || layer === 'corner' || layer === 'corner-right' || layer === 'pinned') {
        style.top = stickyOffset(sizes.rowHeights, row);
    }
    if (layer === 'col' || layer === 'corner' || layer === 'pinned') {
        style.left = stickyOffset(sizes.colWidths, col);
    }
    if (layer === 'col-right' || layer === 'corner-right') {
        style.right = stickyOffsetRight(sizes.colWidths, col);
    }
    return style;
}
