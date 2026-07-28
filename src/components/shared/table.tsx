/**
 * Real typed adapter over the internal SonarDataGrid.
 *
 * Pages import `SharedDataTable` and receive an implementation-neutral
 * prop surface (`SharedDataTableProps<T>`). The internal table engine
 * (SonarDataGrid today, possibly Tremor/Unovis later) is a hidden
 * detail of this file.
 *
 * Only the shared adapter layer is allowed to touch the internal grid
 * directly (see eslint.config.js).
 */
import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { SonarDataGrid } from "@/components/sonar-data-grid/SonarDataGrid";
import type { SharedDensity } from "./types";
import type { BulkAction } from "@/components/sonar-data-grid/DataGridBulkActionBar";

export interface SharedDataTableProps<T> {
  /** TanStack Table instance — engine detail leaked intentionally for now
   *  (page columns/state already depend on @tanstack/react-table). */
  table: Table<T>;
  density?: SharedDensity;
  onRowClick?: (row: T) => void;
  isRowActive?: (row: T) => boolean;
  isLoading?: boolean;
  loadingRowCount?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActions?: React.ReactNode;
  className?: string;
  maxHeight?: string;
  enableReorder?: boolean;
  onReorder?: (draggedColumnId: string, targetColumnId: string) => void;
  onColumnWidthCommit?: (columnId: string, width: number) => void;
  /**
   * Selection actions. Placement is owned by the shared table shell (integrated
   * row below the data viewport, above pagination) — routes only declare the
   * actions, never floating vs. integrated positioning.
   */
  bulkSelection?: {
    count: number;
    itemNoun?: string;
    primary: BulkAction[];
    more?: BulkAction[];
    onClear: () => void;
  };
}

export function SharedDataTable<T>(props: SharedDataTableProps<T>) {
  return <SonarDataGrid<T> {...props} />;
}
