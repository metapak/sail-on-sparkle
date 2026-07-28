import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ChangeCell, ScoreBar, rankLabel } from "@/lib/dashboard-shared";
import type { DashboardKeyword } from "@/services/dashboard/dashboard.types";
import { defineColumn } from "@/components/shared/column-kit";

/**
 * Column preset for the dashboard-overview "priority keyword opportunities"
 * table. Declared once here through the shared column contract (roles, widths
 * and headers come from the shared layer) so the page only renders
 * `SharedDataTable`.
 */
export const overviewKeywordColumns: ColumnDef<DashboardKeyword>[] = [
  defineColumn<DashboardKeyword>({
    id: "kw",
    label: "Anahtar Kelime",
    role: "primary",
    accessorFn: (r) => r.kw,
    cell: (r) => <span className="truncate font-medium">{r.kw}</span>,
  }),
  defineColumn<DashboardKeyword>({
    id: "rank",
    metricKey: "currentRank",
    role: "numeric",
    accessorFn: (r) => r.rank ?? 999,
    cell: (r) => <span className="tabular-nums">{rankLabel(r.rank)}</span>,
  }),
  defineColumn<DashboardKeyword>({
    id: "change",
    metricKey: "rankChange",
    useShortLabel: true,
    role: "numeric",
    accessorFn: (r) => r.change,
    cell: (r) => <ChangeCell change={r.change} />,
  }),
  defineColumn<DashboardKeyword>({
    id: "volume",
    metricKey: "estimatedVolume",
    role: "metric",
    align: "left",
    accessorFn: (r) => r.volume,
    cell: (r) => <ScoreBar value={r.volume} />,
  }),
  defineColumn<DashboardKeyword>({
    id: "difficulty",
    role: "metric",
    align: "left",
    accessorFn: (r) => r.difficulty,
    cell: (r) => <ScoreBar value={r.difficulty} tone="amber" />,
  }),
  defineColumn<DashboardKeyword>({
    id: "opportunity",
    role: "metric",
    align: "left",
    accessorFn: (r) => r.opportunity,
    cell: (r) => <ScoreBar value={r.opportunity} tone="success" />,
  }),
];
