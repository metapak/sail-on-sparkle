/**
 * SHARED ANALYTICAL VISUAL VARIANT ("analytical")
 *
 * The approved NEXUS Overview pilot, promoted into one opt-in visual variant
 * that analytical dashboard routes can mount. It is NOT the unconditional
 * default for shared components: a page (or a section) opts in by rendering
 * `ANALYTICAL_VARIANT` on a wrapper, then tagging its surfaces with the
 * class presets below.
 *
 * All visual values live in `src/styles.css` under `.surface-analytical`
 * (semantic `--an-*` tokens). Nothing here hardcodes a color.
 */

/** Variant name — use this one name everywhere. */
export const ANALYTICAL_VARIANT = "surface-analytical";

/** Page/section stack spacing of the variant. */
export const ANALYTICAL_STACK = "an-stack";

/** Analytical card surface: one radius, 1px border, no shadow, one padding. */
export const ANALYTICAL_CARD = "an-card";

/** Card that owns its own inner padding (table shells, split sections). */
export const ANALYTICAL_CARD_FLUSH = "an-card an-card-flush";

/** Denser analytical card for data-heavy workspaces. */
export const ANALYTICAL_CARD_DENSE = "an-card an-card-dense";

/** Quiet nested surface — one level of nesting, no second hard border. */
export const ANALYTICAL_NESTED = "an-nested";

/** Equal-height metric-card composition (aligned sparkline baselines). */
export const ANALYTICAL_KPI = "an-kpi";

/** Calm data-table container: readable two-line headers, no mid-word clipping. */
export const ANALYTICAL_TABLE = "an-table";

/** Filter / saved-view / toolbar control container (shared control language). */
export const ANALYTICAL_CONTROLS = "an-controls";

/** Section header block inside an analytical card. */
export const ANALYTICAL_SECTION_HEAD = "an-section-head";

/** Empty / loading / error surfaces inside the variant. */
export const ANALYTICAL_STATE = "an-state";
