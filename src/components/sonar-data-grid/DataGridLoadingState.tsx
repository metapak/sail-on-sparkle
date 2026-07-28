import * as React from "react";
import { cn } from "@/lib/utils";

interface Props {
  rowCount: number;
  columnCount: number;
  rowHeight: string;
  cellPad: string;
}

/**
 * Restrained table skeleton rows — preserves column widths & density.
 */
export function DataGridLoadingState({ rowCount, columnCount, rowHeight, cellPad }: Props) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, r) => (
        <tr key={r} className={cn("border-b border-hairline/60", rowHeight)}>
          {Array.from({ length: columnCount }).map((_, c) => (
            <td key={c} className={cn(cellPad, "align-middle")}>
              <div className="h-3 w-[70%] animate-pulse rounded bg-surface-2/70" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
