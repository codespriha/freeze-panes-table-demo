"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdvancedTable = createAdvancedTable;
const layout_js_1 = require("./layout.js");
const styles_js_1 = require("./styles.js");
const raf = typeof requestAnimationFrame === 'undefined' ? null : requestAnimationFrame;
const caf = typeof cancelAnimationFrame === 'undefined' ? null : cancelAnimationFrame;
const LAYER_CLASSES = [
    'aft__cell--row',
    'aft__cell--col',
    'aft__cell--col-right',
    'aft__cell--corner',
    'aft__cell--corner-right',
    'aft__cell--pinned',
];
function isNode(value) {
    return typeof Node !== 'undefined' && value instanceof Node;
}
function isImageContent(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'type' in value &&
        value.type === 'image' &&
        'src' in value);
}
function isTextContent(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'type' in value &&
        value.type === 'text' &&
        'text' in value);
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
function createAdvancedTable(container, options) {
    (0, styles_js_1.injectAdvancedTableStyles)();
    let state = { ...options };
    let mode;
    let resolved = (0, layout_js_1.resolveAdvancedFreeze)({}, 0);
    let sizes = { rowHeights: [], colWidths: [] };
    const wrapper = document.createElement('div');
    wrapper.className = state.className ? `aft ${state.className}` : 'aft';
    const toolbar = document.createElement('div');
    toolbar.className = 'aft__toolbar';
    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.textContent = '\u25C0';
    prevBtn.setAttribute('aria-label', 'Scroll left');
    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.textContent = '\u25B6';
    nextBtn.setAttribute('aria-label', 'Scroll right');
    toolbar.append(prevBtn, nextBtn);
    const scrollEl = document.createElement('div');
    scrollEl.className = 'aft__scroll';
    if (typeof state.maxHeight === 'number')
        scrollEl.style.maxHeight = `${state.maxHeight}px`;
    if (typeof state.maxWidth === 'number')
        scrollEl.style.maxWidth = `${state.maxWidth}px`;
    const table = document.createElement('table');
    table.className = 'aft__table';
    const colgroup = document.createElement('colgroup');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    table.append(colgroup, thead, tbody);
    scrollEl.appendChild(table);
    wrapper.append(toolbar, scrollEl);
    container.appendChild(wrapper);
    const cells = [];
    function scrollByPage(direction) {
        const page = Math.max(100, Math.floor(scrollEl.clientWidth * 0.8));
        scrollEl.scrollLeft = Math.max(0, scrollEl.scrollLeft + direction * page);
    }
    const onPrev = () => scrollByPage(-1);
    const onNext = () => scrollByPage(1);
    prevBtn.addEventListener('click', onPrev);
    nextBtn.addEventListener('click', onNext);
    function applyTheme() {
        wrapper.dataset.theme = state.theme ?? 'light';
        wrapper.dataset.density = state.density ?? 'comfortable';
        wrapper.classList.toggle('aft--header-normal', state.boldHeader === false);
        toolbar.style.display = state.headerArrows ? '' : 'none';
    }
    function resolveMode() {
        const requested = state.mode ?? 'auto';
        if (requested === 'advanced')
            return 'advanced';
        if (requested === 'table')
            return 'table';
        const freeze = state.freeze;
        const hasFreeze = !!(freeze &&
            (freeze.freezeRows ||
                freeze.freezeCols ||
                freeze.freezeAt ||
                freeze.freezeRightCols ||
                (freeze.pinnedCells && freeze.pinnedCells.length > 0)));
        if (hasFreeze)
            return 'advanced';
        return state.rows.length > (state.advancedThreshold ?? 50) ? 'advanced' : 'table';
    }
    function renderColumns() {
        colgroup.replaceChildren();
        let hasFixedWidth = false;
        for (const column of state.columns) {
            const colEl = document.createElement('col');
            if (typeof column.width === 'number') {
                colEl.style.width = `${column.width}px`;
                hasFixedWidth = true;
            }
            colgroup.appendChild(colEl);
        }
        table.style.tableLayout = hasFixedWidth ? 'fixed' : '';
    }
    function buildCell(rowIndex, colIndex, isHeader) {
        const cell = document.createElement(isHeader ? 'th' : 'td');
        cell.className = 'aft__cell';
        if (isHeader)
            cell.classList.add('aft__cell--header');
        const value = isHeader
            ? (state.columns[colIndex]?.key ?? '')
            : state.rows[rowIndex]?.[colIndex];
        const custom = isHeader
            ? state.renderHeader?.(state.columns[colIndex], colIndex)
            : state.renderCell?.(value, rowIndex, colIndex);
        let align = state.textAlign;
        if (custom !== undefined && custom !== null) {
            if (isNode(custom)) {
                cell.appendChild(custom);
            }
            else {
                cell.textContent = String(custom);
            }
        }
        else if (isImageContent(value)) {
            const img = document.createElement('img');
            img.className = 'aft__img';
            img.src = value.src;
            if (value.alt !== undefined)
                img.alt = value.alt;
            img.style.objectFit = value.fit ?? state.imageFit ?? 'contain';
            if (value.width !== undefined)
                img.style.width = `${value.width}px`;
            if (value.height !== undefined)
                img.style.height = `${value.height}px`;
            align = value.align ?? align;
            cell.appendChild(img);
        }
        else {
            const text = isTextContent(value) ? value.text : String(value ?? '');
            if (isTextContent(value))
                align = value.align ?? align;
            cell.textContent = text;
        }
        if (align && align !== 'left')
            cell.style.textAlign = align;
        return cell;
    }
    function renderBody() {
        thead.replaceChildren();
        tbody.replaceChildren();
        cells.length = 0;
        const headerRows = Math.max(0, Math.floor(state.headerRows ?? 0));
        for (let r = 0; r < state.rows.length; r++) {
            const rowEl = document.createElement('tr');
            const isHeader = r < headerRows;
            (isHeader ? thead : tbody).appendChild(rowEl);
            const rowCells = [];
            for (let c = 0; c < state.columns.length; c++) {
                const cell = buildCell(r, c, isHeader);
                rowEl.appendChild(cell);
                rowCells.push(cell);
            }
            cells.push(rowCells);
        }
    }
    function measure() {
        const allRows = [...thead.rows, ...tbody.rows];
        const rowHeights = state.rowHeights ?? allRows.map((tr) => tr.offsetHeight);
        const colWidths = state.columns.map((column, c) => {
            if (typeof column.width === 'number')
                return column.width;
            const firstCell = cells[0]?.[c];
            return firstCell ? firstCell.offsetWidth : 0;
        });
        return { rowHeights, colWidths };
    }
    function setCellStyle(cell, style) {
        cell.classList.remove(...LAYER_CLASSES, 'aft__cell--pane-bold');
        if (style.layer === 'normal') {
            cell.classList.remove('aft__cell--sticky');
            cell.style.top = '';
            cell.style.left = '';
            cell.style.right = '';
            cell.style.zIndex = '';
            return;
        }
        cell.classList.add('aft__cell--sticky', `aft__cell--${style.layer}`);
        cell.style.top = style.top !== undefined ? `${style.top}px` : '';
        cell.style.left = style.left !== undefined ? `${style.left}px` : '';
        cell.style.right = style.right !== undefined ? `${style.right}px` : '';
        cell.style.zIndex = String(style.zIndex);
        if (state.boldFrozenLeft !== false && (style.layer === 'col' || style.layer === 'corner')) {
            cell.classList.add('aft__cell--pane-bold');
        }
    }
    function clearStickyStyles() {
        for (let r = 0; r < cells.length; r++) {
            const rowCells = cells[r];
            if (!rowCells)
                continue;
            for (let c = 0; c < rowCells.length; c++) {
                const cell = rowCells[c];
                if (!cell)
                    continue;
                cell.classList.remove(...LAYER_CLASSES, 'aft__cell--sticky', 'aft__cell--pane-bold');
                cell.style.top = '';
                cell.style.left = '';
                cell.style.right = '';
                cell.style.zIndex = '';
            }
        }
    }
    function applyLayout() {
        mode = resolveMode();
        const isAdvanced = mode === 'advanced';
        table.classList.toggle('aft__table--advanced', isAdvanced);
        table.classList.toggle('aft__table--plain', !isAdvanced);
        if (!isAdvanced) {
            clearStickyStyles();
            return;
        }
        resolved = (0, layout_js_1.resolveAdvancedFreeze)(state.freeze ?? {}, state.columns.length);
        sizes = measure();
        for (let r = 0; r < cells.length; r++) {
            const rowCells = cells[r];
            if (!rowCells)
                continue;
            for (let c = 0; c < rowCells.length; c++) {
                const cell = rowCells[c];
                if (!cell)
                    continue;
                setCellStyle(cell, (0, layout_js_1.freezeCellStyleAdvanced)(resolved, r, c, sizes));
            }
        }
    }
    let rafId = 0;
    function scheduleRelayout() {
        if (!raf || !caf)
            return;
        caf(rafId);
        rafId = raf(() => applyLayout());
    }
    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(scheduleRelayout);
    resizeObserver?.observe(scrollEl);
    resizeObserver?.observe(table);
    function scrollToCell(row, col) {
        if (mode !== 'advanced') {
            scrollEl.scrollTop = 0;
            scrollEl.scrollLeft = 0;
            return;
        }
        let top = 0;
        if (row >= resolved.freezeRows) {
            top =
                sizes.rowHeights.slice(0, row).reduce((total, h) => total + h, 0) -
                    sizes.rowHeights.slice(0, resolved.freezeRows).reduce((total, h) => total + h, 0);
        }
        let left = 0;
        if (col >= resolved.freezeCols) {
            left =
                sizes.colWidths.slice(0, col).reduce((total, w) => total + w, 0) -
                    sizes.colWidths.slice(0, resolved.freezeCols).reduce((total, w) => total + w, 0);
        }
        scrollEl.scrollTop = Math.max(0, top);
        scrollEl.scrollLeft = Math.max(0, left);
    }
    function update(patch) {
        state = { ...state, ...patch };
        applyTheme();
        renderColumns();
        renderBody();
        applyLayout();
    }
    function destroy() {
        if (caf)
            caf(rafId);
        resizeObserver?.disconnect();
        prevBtn.removeEventListener('click', onPrev);
        nextBtn.removeEventListener('click', onNext);
        wrapper.remove();
    }
    applyTheme();
    renderColumns();
    renderBody();
    applyLayout();
    return { element: wrapper, update, scrollToCell, destroy };
}
