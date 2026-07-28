import * as React from "react";
import type { Column } from "@tanstack/react-table";
import { SharedMetricHeader } from "@/components/shared/metric-header";

interface Props<T> {
  column: Column<T, unknown>;
  label: string;
  align?: "left" | "right" | "center";
  className?: string;
  /** Metric key / alias override; defaults to the column id. */
  metricKey?: string;
  /** Explicit tooltip override — prefer the central metric dictionary. */
  info?: string;
}

/**
 * Thin bridge kept for existing call sites. The real implementation is the
 * shared `SharedMetricHeader` (label + sort indicator + metric info tooltip),
 * so a single change propagates to every analytical table.
 */
export function DataGridColumnHeader<T>({
  column,
  label,
  align = "left",
  className,
  metricKey,
  info,
}: Props<T>) {
  return (
    <SharedMetricHeader
      column={column}
      label={label}
      align={align}
      metricKey={metricKey}
      info={info}
      className={className}
    />
  );
}
