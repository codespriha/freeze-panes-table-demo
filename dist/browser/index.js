// node_modules/freeze-panes-table/dist/esm/freeze.js
function stickyOffset(lengths, index) {
  let offset = 0;
  for (let i = 0; i < index; i++) {
    offset += lengths[i] ?? 0;
  }
  return offset;
}

// src/layout.ts
function resolveAdvancedFreeze(config, columnCount) {
  const freezeRows = config.freezeAt !== void 0 ? config.freezeAt.row : config.freezeRows ?? 0;
  const freezeCols = config.freezeAt !== void 0 ? config.freezeAt.col : config.freezeCols ?? 0;
  const clampedCols = Math.max(0, Math.floor(freezeCols));
  const maxRight = Math.max(0, Math.max(0, Math.floor(columnCount)) - clampedCols);
  const freezeRightCols = Math.min(Math.max(0, Math.floor(config.freezeRightCols ?? 0)), maxRight);
  return {
    freezeRows: Math.max(0, Math.floor(freezeRows)),
    freezeCols: clampedCols,
    freezeRightCols,
    pinnedCells: config.pinnedCells ?? [],
    columnCount: Math.max(0, Math.floor(columnCount))
  };
}
function isPinnedAdvanced(resolved, row, col) {
  return resolved.pinnedCells.some((p) => p.row === row && p.col === col);
}
function rightStartIndex(resolved) {
  return resolved.columnCount - resolved.freezeRightCols;
}
function cellLayerAdvanced(resolved, row, col) {
  if (isPinnedAdvanced(resolved, row, col)) return "pinned";
  const colRight = col >= rightStartIndex(resolved);
  const rowFrozen = row < resolved.freezeRows;
  const colFrozen = col < resolved.freezeCols;
  if (rowFrozen && colFrozen) return "corner";
  if (rowFrozen && colRight) return "corner-right";
  if (rowFrozen) return "row";
  if (colFrozen) return "col";
  if (colRight) return "col-right";
  return "normal";
}
function zIndexForLayerAdvanced(layer) {
  switch (layer) {
    case "row":
    case "col":
    case "col-right":
      return 2;
    case "corner":
    case "corner-right":
      return 3;
    case "pinned":
      return 4;
    default:
      return 0;
  }
}
function stickyOffsetRight(lengths, col) {
  return lengths.slice(col + 1).reduce((total, width) => total + (width ?? 0), 0);
}
function freezeCellStyleAdvanced(resolved, row, col, sizes) {
  const layer = cellLayerAdvanced(resolved, row, col);
  const style = { layer, zIndex: zIndexForLayerAdvanced(layer) };
  if (layer === "row" || layer === "corner" || layer === "corner-right" || layer === "pinned") {
    style.top = stickyOffset(sizes.rowHeights, row);
  }
  if (layer === "col" || layer === "corner" || layer === "pinned") {
    style.left = stickyOffset(sizes.colWidths, col);
  }
  if (layer === "col-right" || layer === "corner-right") {
    style.right = stickyOffsetRight(sizes.colWidths, col);
  }
  return style;
}

// src/styles.ts
var ADVANCED_TABLE_CSS = `
.aft {
  --aft-border: rgba(0, 0, 0, 0.12);
  --aft-bg: #ffffff;
  --aft-header-bg: #f5f5f5;
  --aft-sticky-bg: #faf6ee;
  --aft-pinned-outline: rgba(120, 84, 0, 0.45);
  --aft-text: #1c1c1c;
  --aft-muted: #6b7280;
  --aft-cell-pad: 6px 10px;
  position: relative;
  font-family: inherit;
  font-size: 14px;
  color: var(--aft-text);
  max-width: 100%;
}

.aft[data-theme='dark'] {
  --aft-border: rgba(255, 255, 255, 0.14);
  --aft-bg: #1f1f1f;
  --aft-header-bg: #2b2b2b;
  --aft-sticky-bg: #28301c;
  --aft-pinned-outline: rgba(240, 190, 80, 0.55);
  --aft-text: #eaeaea;
  --aft-muted: #9ca3af;
}

.aft[data-density='compact'] {
  --aft-cell-pad: 2px 6px;
  font-size: 12px;
}

.aft[data-density='roomy'] {
  --aft-cell-pad: 10px 16px;
  font-size: 16px;
}

.aft__toolbar {
  display: flex;
  gap: 6px;
  padding: 4px 2px;
}

.aft__toolbar button {
  cursor: pointer;
  border: 1px solid var(--aft-border);
  background: var(--aft-header-bg);
  color: var(--aft-text);
  border-radius: 4px;
  padding: 2px 10px;
  font-size: 12px;
  line-height: 1.5;
}

.aft__toolbar button:hover {
  filter: brightness(0.96);
}

.aft__toolbar button:focus-visible {
  outline: 2px solid var(--aft-pinned-outline);
}

.aft__scroll {
  position: relative;
  overflow: auto;
  max-width: 100%;
}

.aft__table {
  border-collapse: separate;
  border-spacing: 0;
}

.aft__table--advanced {
  width: max-content;
}

.aft__table--plain {
  width: 100%;
}

.aft__cell {
  box-sizing: border-box;
  padding: var(--aft-cell-pad);
  border: 1px solid var(--aft-border);
  background: var(--aft-bg);
  white-space: nowrap;
  vertical-align: middle;
}

.aft__table--plain .aft__cell {
  white-space: normal;
}

.aft__cell--header {
  background: var(--aft-header-bg);
  font-weight: 700;
}

.aft--header-normal .aft__cell--header {
  font-weight: 400;
}

.aft__cell--sticky {
  background: var(--aft-sticky-bg);
}

.aft__cell--row {
  position: sticky;
}

.aft__cell--col {
  position: sticky;
}

.aft__cell--col-right {
  position: sticky;
}

.aft__cell--corner {
  position: sticky;
}

.aft__cell--corner-right {
  position: sticky;
}

.aft__cell--pinned {
  position: sticky;
  outline: 2px solid var(--aft-pinned-outline);
}

.aft__cell--pane-bold {
  font-weight: 600;
}

.aft__img {
  display: block;
  object-fit: contain;
  max-width: 100%;
  max-height: 100%;
}
`.trim();
var injected = false;
function injectAdvancedTableStyles() {
  if (injected) return;
  if (typeof document === "undefined") return;
  const style = document.createElement("style");
  style.setAttribute("data-advanced-freeze-table", "");
  style.textContent = ADVANCED_TABLE_CSS;
  document.head.appendChild(style);
  injected = true;
}

// src/table.ts
var raf = typeof requestAnimationFrame === "undefined" ? null : requestAnimationFrame;
var caf = typeof cancelAnimationFrame === "undefined" ? null : cancelAnimationFrame;
var LAYER_CLASSES = [
  "aft__cell--row",
  "aft__cell--col",
  "aft__cell--col-right",
  "aft__cell--corner",
  "aft__cell--corner-right",
  "aft__cell--pinned"
];
function isNode(value) {
  return typeof Node !== "undefined" && value instanceof Node;
}
function isImageContent(value) {
  return typeof value === "object" && value !== null && "type" in value && value.type === "image" && "src" in value;
}
function isTextContent(value) {
  return typeof value === "object" && value !== null && "type" in value && value.type === "text" && "text" in value;
}
function createAdvancedTable(container, options) {
  injectAdvancedTableStyles();
  let state = { ...options };
  let mode;
  let resolved = resolveAdvancedFreeze({}, 0);
  let sizes = { rowHeights: [], colWidths: [] };
  const wrapper = document.createElement("div");
  wrapper.className = state.className ? `aft ${state.className}` : "aft";
  const toolbar = document.createElement("div");
  toolbar.className = "aft__toolbar";
  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.textContent = "\u25C0";
  prevBtn.setAttribute("aria-label", "Scroll left");
  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.textContent = "\u25B6";
  nextBtn.setAttribute("aria-label", "Scroll right");
  toolbar.append(prevBtn, nextBtn);
  const scrollEl = document.createElement("div");
  scrollEl.className = "aft__scroll";
  if (typeof state.maxHeight === "number") scrollEl.style.maxHeight = `${state.maxHeight}px`;
  if (typeof state.maxWidth === "number") scrollEl.style.maxWidth = `${state.maxWidth}px`;
  const table = document.createElement("table");
  table.className = "aft__table";
  const colgroup = document.createElement("colgroup");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");
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
  prevBtn.addEventListener("click", onPrev);
  nextBtn.addEventListener("click", onNext);
  function applyTheme() {
    wrapper.dataset.theme = state.theme ?? "light";
    wrapper.dataset.density = state.density ?? "comfortable";
    wrapper.classList.toggle("aft--header-normal", state.boldHeader === false);
    toolbar.style.display = state.headerArrows ? "" : "none";
  }
  function resolveMode() {
    const requested = state.mode ?? "auto";
    if (requested === "advanced") return "advanced";
    if (requested === "table") return "table";
    const freeze = state.freeze;
    const hasFreeze = !!(freeze && (freeze.freezeRows || freeze.freezeCols || freeze.freezeAt || freeze.freezeRightCols || freeze.pinnedCells && freeze.pinnedCells.length > 0));
    if (hasFreeze) return "advanced";
    return state.rows.length > (state.advancedThreshold ?? 50) ? "advanced" : "table";
  }
  function renderColumns() {
    colgroup.replaceChildren();
    let hasFixedWidth = false;
    for (const column of state.columns) {
      const colEl = document.createElement("col");
      if (typeof column.width === "number") {
        colEl.style.width = `${column.width}px`;
        hasFixedWidth = true;
      }
      colgroup.appendChild(colEl);
    }
    table.style.tableLayout = hasFixedWidth ? "fixed" : "";
  }
  function buildCell(rowIndex, colIndex, isHeader) {
    const cell = document.createElement(isHeader ? "th" : "td");
    cell.className = "aft__cell";
    if (isHeader) cell.classList.add("aft__cell--header");
    const value = isHeader ? state.columns[colIndex]?.key ?? "" : state.rows[rowIndex]?.[colIndex];
    const custom = isHeader ? state.renderHeader?.(state.columns[colIndex], colIndex) : state.renderCell?.(value, rowIndex, colIndex);
    let align = state.textAlign;
    if (custom !== void 0 && custom !== null) {
      if (isNode(custom)) {
        cell.appendChild(custom);
      } else {
        cell.textContent = String(custom);
      }
    } else if (isImageContent(value)) {
      const img = document.createElement("img");
      img.className = "aft__img";
      img.src = value.src;
      if (value.alt !== void 0) img.alt = value.alt;
      img.style.objectFit = value.fit ?? state.imageFit ?? "contain";
      if (value.width !== void 0) img.style.width = `${value.width}px`;
      if (value.height !== void 0) img.style.height = `${value.height}px`;
      align = value.align ?? align;
      cell.appendChild(img);
    } else {
      const text = isTextContent(value) ? value.text : String(value ?? "");
      if (isTextContent(value)) align = value.align ?? align;
      cell.textContent = text;
    }
    if (align && align !== "left") cell.style.textAlign = align;
    return cell;
  }
  function renderBody() {
    thead.replaceChildren();
    tbody.replaceChildren();
    cells.length = 0;
    const headerRows = Math.max(0, Math.floor(state.headerRows ?? 0));
    for (let r = 0; r < state.rows.length; r++) {
      const rowEl = document.createElement("tr");
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
      if (typeof column.width === "number") return column.width;
      const firstCell = cells[0]?.[c];
      return firstCell ? firstCell.offsetWidth : 0;
    });
    return { rowHeights, colWidths };
  }
  function setCellStyle(cell, style) {
    cell.classList.remove(...LAYER_CLASSES, "aft__cell--pane-bold");
    if (style.layer === "normal") {
      cell.classList.remove("aft__cell--sticky");
      cell.style.top = "";
      cell.style.left = "";
      cell.style.right = "";
      cell.style.zIndex = "";
      return;
    }
    cell.classList.add("aft__cell--sticky", `aft__cell--${style.layer}`);
    cell.style.top = style.top !== void 0 ? `${style.top}px` : "";
    cell.style.left = style.left !== void 0 ? `${style.left}px` : "";
    cell.style.right = style.right !== void 0 ? `${style.right}px` : "";
    cell.style.zIndex = String(style.zIndex);
    if (state.boldFrozenLeft !== false && (style.layer === "col" || style.layer === "corner")) {
      cell.classList.add("aft__cell--pane-bold");
    }
  }
  function clearStickyStyles() {
    for (let r = 0; r < cells.length; r++) {
      const rowCells = cells[r];
      if (!rowCells) continue;
      for (let c = 0; c < rowCells.length; c++) {
        const cell = rowCells[c];
        if (!cell) continue;
        cell.classList.remove(...LAYER_CLASSES, "aft__cell--sticky", "aft__cell--pane-bold");
        cell.style.top = "";
        cell.style.left = "";
        cell.style.right = "";
        cell.style.zIndex = "";
      }
    }
  }
  function applyLayout() {
    mode = resolveMode();
    const isAdvanced = mode === "advanced";
    table.classList.toggle("aft__table--advanced", isAdvanced);
    table.classList.toggle("aft__table--plain", !isAdvanced);
    if (!isAdvanced) {
      clearStickyStyles();
      return;
    }
    resolved = resolveAdvancedFreeze(state.freeze ?? {}, state.columns.length);
    sizes = measure();
    for (let r = 0; r < cells.length; r++) {
      const rowCells = cells[r];
      if (!rowCells) continue;
      for (let c = 0; c < rowCells.length; c++) {
        const cell = rowCells[c];
        if (!cell) continue;
        setCellStyle(cell, freezeCellStyleAdvanced(resolved, r, c, sizes));
      }
    }
  }
  let rafId = 0;
  function scheduleRelayout() {
    if (!raf || !caf) return;
    caf(rafId);
    rafId = raf(() => applyLayout());
  }
  const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(scheduleRelayout);
  resizeObserver?.observe(scrollEl);
  resizeObserver?.observe(table);
  function scrollToCell(row, col) {
    if (mode !== "advanced") {
      scrollEl.scrollTop = 0;
      scrollEl.scrollLeft = 0;
      return;
    }
    let top = 0;
    if (row >= resolved.freezeRows) {
      top = sizes.rowHeights.slice(0, row).reduce((total, h) => total + h, 0) - sizes.rowHeights.slice(0, resolved.freezeRows).reduce((total, h) => total + h, 0);
    }
    let left = 0;
    if (col >= resolved.freezeCols) {
      left = sizes.colWidths.slice(0, col).reduce((total, w) => total + w, 0) - sizes.colWidths.slice(0, resolved.freezeCols).reduce((total, w) => total + w, 0);
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
    if (caf) caf(rafId);
    resizeObserver?.disconnect();
    prevBtn.removeEventListener("click", onPrev);
    nextBtn.removeEventListener("click", onNext);
    wrapper.remove();
  }
  applyTheme();
  renderColumns();
  renderBody();
  applyLayout();
  return { element: wrapper, update, scrollToCell, destroy };
}
export {
  ADVANCED_TABLE_CSS,
  cellLayerAdvanced,
  createAdvancedTable,
  freezeCellStyleAdvanced,
  injectAdvancedTableStyles,
  isPinnedAdvanced,
  resolveAdvancedFreeze,
  stickyOffsetRight,
  zIndexForLayerAdvanced
};
