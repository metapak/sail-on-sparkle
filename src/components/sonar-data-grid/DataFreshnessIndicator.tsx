import * as React from "react";
import { Loader2, Clock, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type FreshnessKind = "fresh" | "today" | "days" | "stale" | "refreshing";

export interface Freshness {
  kind: FreshnessKind;
  /** Label shown in table cell. */
  label: string;
  /** Absolute date/time. */
  exact?: string;
  /** e.g. "Günlük" */
  frequency?: string;
  /** Absolute next planned refresh. */
  nextRefreshAt?: string;
}

/**
 * Compute freshness bucket from `updatedMinutesAgo`.
 */
export function freshnessFromMinutes(
  minutes: number,
  opts: { frequency?: string; nextRefreshAt?: string; isRefreshing?: boolean } = {},
): Freshness {
  if (opts.isRefreshing) {
    return {
      kind: "refreshing",
      label: "Yenileniyor",
      frequency: opts.frequency,
      nextRefreshAt: opts.nextRefreshAt,
    };
  }
  const exact = new Date(Date.now() - minutes * 60 * 1000).toLocaleString("tr-TR");
  if (minutes < 60)
    return {
      kind: "fresh",
      label: `${Math.max(1, Math.round(minutes))} dakika önce`,
      exact,
      frequency: opts.frequency,
      nextRefreshAt: opts.nextRefreshAt,
    };
  if (minutes < 60 * 24)
    return {
      kind: "today",
      label: "Bugün",
      exact,
      frequency: opts.frequency,
      nextRefreshAt: opts.nextRefreshAt,
    };
  const days = Math.round(minutes / (60 * 24));
  if (days <= 7)
    return {
      kind: "days",
      label: `${days} gün önce`,
      exact,
      frequency: opts.frequency,
      nextRefreshAt: opts.nextRefreshAt,
    };
  return {
    kind: "stale",
    label: "Güncelliğini Yitirmiş",
    exact,
    frequency: opts.frequency,
    nextRefreshAt: opts.nextRefreshAt,
  };
}

const TONE: Record<FreshnessKind, string> = {
  fresh: "text-muted-foreground",
  today: "text-muted-foreground",
  days: "text-muted-foreground",
  stale: "text-[color:var(--warning)]",
  refreshing: "text-primary",
};

export function DataFreshnessIndicator({
  freshness,
  className,
}: {
  freshness: Freshness;
  className?: string;
}) {
  const { kind, label, exact, frequency, nextRefreshAt } = freshness;
  const Icon = kind === "refreshing" ? Loader2 : kind === "stale" ? AlertTriangle : Clock;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[11px] tabular-nums",
              TONE[kind],
              className,
            )}
            data-row-noclick="true"
          >
            <Icon className={cn("h-3 w-3", kind === "refreshing" && "animate-spin")} />
            <span>{label}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-[11px]">
          {exact && <div className="tabular-nums">{exact}</div>}
          {frequency && <div className="mt-0.5 text-muted-foreground">Sıklık: {frequency}</div>}
          {nextRefreshAt && <div className="text-muted-foreground">Sonraki: {nextRefreshAt}</div>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
