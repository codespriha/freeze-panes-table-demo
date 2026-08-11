/**
 * Premium styles, injected once. All colors and spacing are driven by CSS
 * custom properties set on the `.aft` root, so the `theme` and `density`
 * options can re-theme the whole table without re-rendering.
 */
export const ADVANCED_TABLE_CSS = `
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
let injected = false;
/** Inject the premium styles once. Safe to call multiple times; no-ops in SSR. */
export function injectAdvancedTableStyles() {
    if (injected)
        return;
    if (typeof document === 'undefined')
        return;
    const style = document.createElement('style');
    style.setAttribute('data-advanced-freeze-table', '');
    style.textContent = ADVANCED_TABLE_CSS;
    document.head.appendChild(style);
    injected = true;
}
