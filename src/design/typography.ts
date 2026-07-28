/**
 * CENTRAL TYPOGRAPHY REGISTRY (Phase 3)
 *
 * One semantic typography scale for the whole application — public pages,
 * dashboard pages, tables, charts, overlays and forms.
 *
 * Rules:
 * - Pages/components must NOT define their own heading sizes.
 * - Use `typography.<role>` (or the `type-*` utility of the same name defined
 *   in src/styles.css) everywhere a text role is needed.
 * - Numeric roles carry tabular numbers; there is no separate mono font.
 */

export type TypographyRole =
  | "display"
  | "pageTitle"
  | "sectionTitle"
  | "cardTitle"
  | "body"
  | "bodyCompact"
  | "caption"
  | "eyebrow"
  | "tableHeader"
  | "tableCell"
  | "kpiLabel"
  | "kpiValue"
  | "tooltip"
  | "button"
  | "input"
  | "navItem";

/** Tailwind class for each semantic role. Backed by `@utility type-*`. */
export const typography: Record<TypographyRole, string> = {
  display: "type-display",
  pageTitle: "type-page-title",
  sectionTitle: "type-section-title",
  cardTitle: "type-card-title",
  body: "type-body",
  bodyCompact: "type-body-compact",
  caption: "type-caption",
  eyebrow: "type-eyebrow",
  tableHeader: "type-table-header",
  tableCell: "type-table-cell",
  kpiLabel: "type-kpi-label",
  kpiValue: "type-kpi-value",
  tooltip: "type-tooltip",
  button: "type-button",
  input: "type-input",
  navItem: "type-nav-item",
};

/** Documented metrics of the scale (px), for review + design docs. */
export const TYPOGRAPHY_SCALE: Record<
  TypographyRole,
  { size: number; leading: number; weight: number }
> = {
  display: { size: 40, leading: 44, weight: 700 },
  pageTitle: { size: 28, leading: 34, weight: 650 },
  sectionTitle: { size: 20, leading: 28, weight: 600 },
  cardTitle: { size: 15, leading: 22, weight: 600 },
  body: { size: 14, leading: 21, weight: 400 },
  bodyCompact: { size: 13, leading: 19, weight: 450 },
  caption: { size: 12, leading: 16, weight: 400 },
  eyebrow: { size: 11, leading: 16, weight: 600 },
  tableHeader: { size: 11, leading: 16, weight: 600 },
  tableCell: { size: 13, leading: 18, weight: 400 },
  kpiLabel: { size: 12, leading: 16, weight: 500 },
  kpiValue: { size: 28, leading: 32, weight: 650 },
  tooltip: { size: 12, leading: 17, weight: 450 },
  button: { size: 14, leading: 20, weight: 500 },
  input: { size: 14, leading: 20, weight: 400 },
  navItem: { size: 13, leading: 20, weight: 500 },
};

/** Class applied to any numeric metric surface (tabular numbers, no mono). */
export const NUMERIC_CLASS = "tabular-nums";

export function typeClass(role: TypographyRole, extra?: string) {
  return extra ? `${typography[role]} ${extra}` : typography[role];
}
