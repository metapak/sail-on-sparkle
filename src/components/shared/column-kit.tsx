/**
 * ONE typed column contract for every analytical table.
 *
 * Routes never hand-write `size`/`minSize`/`header` markup any more: they
 * declare *what* a column is (`role`, `label`/`metricKey`, `cell`) and this
 * module derives the shared behaviour — width contract, alignment, sorting
 * affordance, metric tooltip, and the localized label used by the column
 * manager.
 *
 * Widths come from `COLUMN_WIDTHS` in ./table-presets, so a global width
 * change is a one-line edit and can never drift per page.
 */
import * as React from "react";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { SharedMetricHeader } from "./metric-header";
import { getMetricDefinition, metricLabel } from "./metric-definitions";
import {
  COLUMN_WIDTHS,
  CENTERED_ROLES,
  FLEX_DATA_COLUMN,
  UTILITY_COLUMN,
  type ColumnWidthRole,
} from "./table-presets";

import type { SharedColumnMeta } from "./types";

export interface SharedColumnSpec<T> {
  id: string;
  /** Visible label. Falls back to the metric dictionary entry for `metricKey`/`id`. */
  label?: string;
  /** Metric dictionary key/alias; defaults to `id`. */
  metricKey?: string;
  /** Width contract role. Defaults to `metric`. */
  role?: ColumnWidthRole;
  align?: "left" | "right" | "center";
  /** Sortable columns get the shared sort affordance. Default true. */
  sortable?: boolean;
  /** Resizable columns get the shared resize handle. Default true. */
  resizable?: boolean;
  /** Only `primary` columns absorb leftover viewport width. */
  flex?: boolean;
  flexWeight?: number;
  /** Explicit tooltip override — prefer the central metric dictionary. */
  info?: string;
  /** Prefer the metric's short label in the header. */
  useShortLabel?: boolean;
  /** Custom header node (icons, app avatars…) rendered instead of the label. */
  headerContent?: React.ReactNode;
  /** Keep the header label's source casing (proper nouns such as app names). */
  preserveLabelCase?: boolean;
  accessorFn?: (row: T) => unknown;
  cell: (row: T, ctx: { row: Row<T> }) => React.ReactNode;
  /** Width overrides — use sparingly; the role preset is the default truth. */
  size?: number;
  minSize?: number;
  maxSize?: number;
  canHide?: boolean;
  pinnable?: boolean;
  reorderable?: boolean;
  /** Cell contains interactive controls — row click is suppressed inside. */
  interactive?: boolean;
}

/** Resolve the human label used by headers AND the column manager. */
export function resolveColumnLabel(spec: {
  id: string;
  label?: string;
  metricKey?: string;
}): string {
  if (spec.label) return spec.label;
  const def = getMetricDefinition(spec.metricKey ?? spec.id);
  if (def) return def.label;
  return metricLabel(spec.metricKey ?? spec.id, humanizeColumnId(spec.id));
}

/** Last-resort readable label — never expose a raw internal id to the user. */
export function humanizeColumnId(id: string): string {
  const cleaned = id.replace(/^__?/, "").replace(/[_-]+/g, " ").trim();
  if (!cleaned) return id;
  return cleaned
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .replace(/^\w/, (c) => c.toLocaleUpperCase("tr-TR"));
}

/** Build one analytical column from the shared contract. */
export function defineColumn<T>(spec: SharedColumnSpec<T>): ColumnDef<T> {
  const role: ColumnWidthRole = spec.role ?? "metric";
  const preset = COLUMN_WIDTHS[role];
  const label = resolveColumnLabel(spec);
  const align = spec.align ?? (CENTERED_ROLES.has(role) ? "center" : "left");
  const sortable = spec.sortable ?? true;
  const resizable = spec.resizable ?? (role !== "utility" && role !== "actions");
  const isPrimary = role === "primary" || role === "primaryText" || role === "primaryTextDense";
  const flex = spec.flex ?? isPrimary;

  const meta: SharedColumnMeta = {
    label,
    widthRole: role,
    align,
    info: spec.info,
    canHide: spec.canHide,
    interactive: spec.interactive,
    pinnable: spec.pinnable,
    reorderable: spec.reorderable ?? true,
    ...(flex ? FLEX_DATA_COLUMN(spec.flexWeight ?? 1) : {}),
  };

  return {
    id: spec.id,
    accessorFn: spec.accessorFn as never,
    enableSorting: sortable,
    enableResizing: resizable,
    size: spec.size ?? preset.size,
    minSize: spec.minSize ?? preset.minSize,
    maxSize: spec.maxSize ?? preset.maxSize,
    meta,
    header: ({ column }) =>
      spec.headerContent ? (
        <SharedMetricHeader
          column={column}
          label={label}
          metricKey={spec.metricKey}
          info={spec.info}
          align={align}
          preserveLabelCase={spec.preserveLabelCase}
          renderLabel={() => spec.headerContent}
        />
      ) : (
        <SharedMetricHeader
          column={column}
          label={label}
          metricKey={spec.metricKey}
          info={spec.info}
          align={align}
          preserveLabelCase={spec.preserveLabelCase}
          useShortLabel={spec.useShortLabel}
        />
      ),
    cell: ({ row }) => spec.cell(row.original, { row }),
  } as ColumnDef<T>;
}

/** Selection / favorite / actions column — fixed width, never sortable. */
export function defineUtilityColumn<T>(spec: {
  id: string;
  label: string;
  role?: "utility" | "actions";
  header?: ColumnDef<T>["header"];
  cell: (row: T, ctx: { row: Row<T> }) => React.ReactNode;
  align?: "left" | "right" | "center";
  size?: number;
}): ColumnDef<T> {
  const preset = COLUMN_WIDTHS[spec.role ?? "utility"];
  return {
    id: spec.id,
    header: spec.header ?? "",
    enableSorting: false,
    enableResizing: false,
    enableHiding: false,
    size: spec.size ?? preset.size,
    minSize: spec.size ?? preset.minSize,
    maxSize: spec.size ?? preset.maxSize,
    meta: {
      ...UTILITY_COLUMN,
      widthRole: spec.role ?? "utility",
      label: spec.label,
      align: spec.align ?? "center",
      canHide: false,
      interactive: true,
      reorderable: false,
    } satisfies SharedColumnMeta,
    cell: ({ row }) => spec.cell(row.original, { row }),
  } as ColumnDef<T>;
}

/** Grouped (two-level) header. Children keep the same shared contract. */
export function defineColumnGroup<T>(
  id: string,
  label: string,
  columns: ColumnDef<T>[],
): ColumnDef<T> {
  return {
    id,
    header: label,
    meta: { label } satisfies SharedColumnMeta,
    columns,
  } as ColumnDef<T>;
}
