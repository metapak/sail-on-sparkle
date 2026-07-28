import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props<T> {
  table: Table<T>;
  totalLabel?: string;
  pageSizes?: number[];
  /** Server-side pagination: override the total row count that the table
   *  cannot compute locally (getFilteredRowModel is page-only in manual mode). */
  totalRows?: number;
}

export function DataGridPagination<T>({
  table,
  totalLabel,
  pageSizes = [25, 50, 100],
  totalRows,
}: Props<T>) {
  const state = table.getState().pagination;
  const total = totalRows ?? table.getFilteredRowModel().rows.length;
  const from = total === 0 ? 0 : state.pageIndex * state.pageSize + 1;
  const to = Math.min(total, from + state.pageSize - 1);
  const selected = table.getFilteredSelectedRowModel().rows.length;
  const totalPages = Math.max(1, table.getPageCount());

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline bg-surface/30 px-4 py-2.5 type-caption sonar-pagination-count text-muted-foreground sm:px-5">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span>Satır:</span>
          <Select
            value={String(state.pageSize)}
            onValueChange={(v) => table.setPageSize(Number(v))}
          >
            <SelectTrigger className="h-7 w-16 border-hairline bg-background/60 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizes.map((n) => (
                <SelectItem key={n} value={String(n)} className="text-xs">
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="tabular-nums">
          {from}–{to} / {total}
        </span>
        {selected > 0 && <span className="tabular-nums text-foreground">· {selected} seçili</span>}
        {totalLabel && <span className="text-muted-foreground/80">· {totalLabel}</span>}
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Önceki
        </Button>
        <span className="tabular-nums">
          Sayfa {state.pageIndex + 1} / {totalPages}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
        >
          Sonraki
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
