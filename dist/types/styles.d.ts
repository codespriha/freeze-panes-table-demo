/**
 * Premium styles, injected once. All colors and spacing are driven by CSS
 * custom properties set on the `.aft` root, so the `theme` and `density`
 * options can re-theme the whole table without re-rendering.
 */
export declare const ADVANCED_TABLE_CSS: string;
/** Inject the premium styles once. Safe to call multiple times; no-ops in SSR. */
export declare function injectAdvancedTableStyles(): void;
