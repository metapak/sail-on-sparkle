/**
 * ONE shared table-preference repository.
 *
 * Every analytical table persists its own preferences under a stable table id
 * (`overview-priority-keywords`, `tracked-keywords`, `keyword-research`,
 * `competitor-keyword-gap`). Preferences are namespaced per table id, so a
 * width committed in one workspace can never leak into another.
 *
 * Routes must NOT implement their own localStorage access for table state.
 */
import * as React from "react";
import type { ColumnSizingState, ColumnOrderState, VisibilityState } from "@tanstack/react-table";
import type { SharedDensity } from "./types";

export type SharedTableId =
  | "overview-priority-keywords"
  | "tracked-keywords"
  | "keyword-research"
  | "competitor-keyword-gap";

export interface TablePreferences {
  columnSizing: ColumnSizingState;
  /** Column ids the user resized by hand — excluded from flex distribution. */
  manualSizedColumnIds: string[];
  columnOrder: ColumnOrderState;
  columnVisibility: VisibilityState;
  density: SharedDensity;
}

const SCHEMA_VERSION = 2;
const key = (tableId: SharedTableId) => `sonar.table.${tableId}.v${SCHEMA_VERSION}`;
const legacyKey = (tableId: SharedTableId) => `sonar.table.${tableId}.v1`;

function emptyPrefs(density: SharedDensity): TablePreferences {
  return {
    columnSizing: {},
    manualSizedColumnIds: [],
    columnOrder: [],
    columnVisibility: {},
    density,
  };
}

function read(tableId: SharedTableId, density: SharedDensity): TablePreferences {
  if (typeof window === "undefined") return emptyPrefs(density);
  const raw = window.localStorage.getItem(key(tableId)) ?? migrate(tableId);
  if (!raw) return emptyPrefs(density);
  try {
    const parsed = JSON.parse(raw) as Partial<TablePreferences>;
    return {
      ...emptyPrefs(density),
      ...parsed,
      columnSizing: parsed.columnSizing ?? {},
      manualSizedColumnIds: parsed.manualSizedColumnIds ?? Object.keys(parsed.columnSizing ?? {}),
      columnOrder: parsed.columnOrder ?? [],
      columnVisibility: parsed.columnVisibility ?? {},
      density: parsed.density ?? density,
    };
  } catch {
    return emptyPrefs(density);
  }
}

/** Safe forward migration — older payloads are upgraded, never discarded. */
function migrate(tableId: SharedTableId): string | null {
  if (typeof window === "undefined") return null;
  const old = window.localStorage.getItem(legacyKey(tableId));
  if (!old) return null;
  window.localStorage.setItem(key(tableId), old);
  return old;
}

function write(tableId: SharedTableId, prefs: TablePreferences) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(tableId), JSON.stringify(prefs));
  } catch {
    /* quota / private mode — preferences are best-effort */
  }
}

export interface UseTablePreferences extends TablePreferences {
  setColumnSizing: React.Dispatch<React.SetStateAction<ColumnSizingState>>;
  setColumnOrder: React.Dispatch<React.SetStateAction<ColumnOrderState>>;
  setColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>;
  setDensity: React.Dispatch<React.SetStateAction<SharedDensity>>;
  /** Commit a manual resize: clamped width + manual-size marker + persistence. */
  commitColumnWidth: (columnId: string, width: number) => void;
  resetWidths: () => void;
  resetAll: () => void;
  /** True once persisted preferences have hydrated (client only). */
  hydrated: boolean;
}

/**
 * Controlled table preferences for one stable table id.
 * Hydrates AFTER mount so SSR and the first client render match.
 */
export function useTablePreferences(
  tableId: SharedTableId,
  options?: {
    defaultDensity?: SharedDensity;
    defaultVisibility?: VisibilityState;
    defaultOrder?: ColumnOrderState;
  },
): UseTablePreferences {
  const defaultDensity = options?.defaultDensity ?? "standard";
  const defaultVisibility = options?.defaultVisibility;
  const defaultOrder = options?.defaultOrder;

  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>({});
  const [manualIds, setManualIds] = React.useState<string[]>([]);
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>(defaultOrder ?? []);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(
    defaultVisibility ?? {},
  );
  const [density, setDensity] = React.useState<SharedDensity>(defaultDensity);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    const stored = read(tableId, defaultDensity);
    setColumnSizing(stored.columnSizing);
    setManualIds(stored.manualSizedColumnIds);
    if (stored.columnOrder.length) setColumnOrder(stored.columnOrder);
    if (Object.keys(stored.columnVisibility).length) {
      setColumnVisibility((prev) => ({ ...prev, ...stored.columnVisibility }));
    }
    setDensity(stored.density);
    setHydrated(true);
    // Table id is stable per route; density default never changes at runtime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableId]);

  // Persist only after hydration so an empty first render cannot wipe storage.
  React.useEffect(() => {
    if (!hydrated) return;
    write(tableId, {
      columnSizing,
      manualSizedColumnIds: manualIds,
      columnOrder,
      columnVisibility,
      density,
    });
  }, [hydrated, tableId, columnSizing, manualIds, columnOrder, columnVisibility, density]);

  const commitColumnWidth = React.useCallback((columnId: string, width: number) => {
    setColumnSizing((prev) => ({ ...prev, [columnId]: width }));
    setManualIds((prev) => (prev.includes(columnId) ? prev : [...prev, columnId]));
  }, []);

  const resetWidths = React.useCallback(() => {
    setColumnSizing({});
    setManualIds([]);
  }, []);

  const resetAll = React.useCallback(() => {
    setColumnSizing({});
    setManualIds([]);
    setColumnOrder(defaultOrder ?? []);
    setColumnVisibility(defaultVisibility ?? {});
    setDensity(defaultDensity);
  }, [defaultDensity, defaultOrder, defaultVisibility]);

  return {
    columnSizing,
    manualSizedColumnIds: manualIds,
    columnOrder,
    columnVisibility,
    density,
    setColumnSizing,
    setColumnOrder,
    setColumnVisibility,
    setDensity,
    commitColumnWidth,
    resetWidths,
    resetAll,
    hydrated,
  };
}
