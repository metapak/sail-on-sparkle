/**
 * Shared types for the SonarDataGrid foundation.
 * Generic — do not put keyword/SERP/competitor logic here.
 */
import type {
  ColumnDef,
  VisibilityState,
  SortingState,
  ColumnPinningState,
} from "@tanstack/react-table";
import {
  TABLE_PRESETS,
  type TableLayoutRole,
  type ColumnWidthRole,
} from "@/components/shared/table-presets";

export type Density = "comfortable" | "standard" | "compact";

export const DENSITY_LABEL: Record<Density, string> = {
  comfortable: "Rahat",
  standard: "Standart",
  compact: "Sıkı",
};

/** Row/cell classes come from the centralized shared table presets. */
export const DENSITY_ROW_CLASS: Record<Density, string> = {
  comfortable: TABLE_PRESETS.comfortable.rowClass,
  standard: TABLE_PRESETS.standard.rowClass,
  compact: TABLE_PRESETS.compact.rowClass,
};

export const DENSITY_CELL_CLASS: Record<Density, string> = {
  comfortable: TABLE_PRESETS.comfortable.cellClass,
  standard: TABLE_PRESETS.standard.cellClass,
  compact: TABLE_PRESETS.compact.cellClass,
};

export const DENSITY_HEADER_HEIGHT: Record<Density, number> = {
  comfortable: TABLE_PRESETS.comfortable.headerHeight,
  standard: TABLE_PRESETS.standard.headerHeight,
  compact: TABLE_PRESETS.compact.headerHeight,
};

/** Extra column meta consumed by SonarDataGrid — attach via `meta:` on columnDef. */
export interface SonarColumnMeta {
  /** Human label used by column manager & header (falls back to column.id) */
  label?: string;
  /**
   * Deterministic layout role. Only `flex-data` columns absorb leftover
   * viewport width; utility columns are always fixed. Declared per table
   * preset — the grid never special-cases a column id.
   */
  layoutRole?: TableLayoutRole;
  /** Semantic width-contract role (selection/primary/metric/action). */
  widthRole?: ColumnWidthRole;
  /** Relative share of the leftover viewport width (flex-data only). */
  flexWeight?: number;

  /** Shorter label to use when the column is narrower than `compactAt`. */
  compactLabel?: string;
  /** Pixel width threshold under which `compactLabel` is preferred. Default 130. */
  compactAt?: number;
  /** Whether column can be hidden. Defaults true. Locked columns cannot. */
  canHide?: boolean;
  /** Show/hide in default view. Defaults true. */
  defaultVisible?: boolean;
  /** Cell horizontal alignment. */
  align?: "left" | "right" | "center";
  /** Preferred px width. */
  width?: number;
  /** Whether cell has interactive controls; skip row-click when clicking inside. */
  interactive?: boolean;
  /** Priority for responsive tightening (lower = kept longer). Unused for now. */
  responsivePriority?: number;
  /** Whether the column may be reordered by drag / menu. Defaults false. */
  reorderable?: boolean;
  /** Whether the column may be pinned left by the user. Defaults false. */
  pinnable?: boolean;
  /** Optional metric-information text rendered as a header info tooltip. */
  info?: string;
}

export interface SavedView<TSnapshot = unknown> {
  id: string;
  name: string;
  snapshot: TSnapshot;
  createdAt: string;
  isDefault?: boolean;
}

/** Re-export commonly-used TanStack types for convenience. */
export type { ColumnDef, VisibilityState, SortingState, ColumnPinningState };
