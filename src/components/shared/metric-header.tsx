/**
 * SharedMetricHeader — the single analytical table-header component.
 *
 * Responsibilities (all shared, none page-specific):
 *  - column label (1–2 lines, no mid-word breaks)
 *  - optional short/abbreviated label
 *  - sort affordance + active sort indicator
 *  - restrained information icon + accessible tooltip from the central
 *    metric dictionary (`./metric-definitions`)
 *  - trailing slot (e.g. column menu) that never collides with the
 *    resize handle owned by the grid header cell
 *
 * Keyboard: label button and info button are both focusable; the tooltip
 * opens on focus. Logical spacing utilities keep it RTL-safe for future
 * Arabic localization.
 */
import * as React from "react";
import { ArrowUp, ArrowDown, ArrowUpDown, Info } from "lucide-react";
import type { Column } from "@tanstack/react-table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getMetricDefinition } from "./metric-definitions";

export interface SharedMetricHeaderProps<T> {
  column: Column<T, unknown>;
  /** Visible label. Falls back to the metric dictionary label. */
  label?: string;
  /** Metric key or alias; defaults to `column.id`. */
  metricKey?: string;
  /** Explicit tooltip override — prefer the central dictionary. */
  info?: string;
  /** Prefer the metric's short label as the visible label. */
  useShortLabel?: boolean;
  align?: "left" | "right" | "center";
  /** Trailing controls (column menu, …). */
  trailing?: React.ReactNode;
  /** Custom label rendering (app avatars, icons…). Sorting/tooltip stay shared. */
  renderLabel?: () => React.ReactNode;
  /** Keep the label's source casing (proper nouns such as app names). */
  preserveLabelCase?: boolean;
  className?: string;
}

/** Small restrained info button + tooltip. Never a text question mark. */
export function MetricInfoTip({
  label,
  text,
  className,
}: {
  label: string;
  text: string;
  className?: string;
}) {
  // Controlled so hover, keyboard focus AND touch/click all reveal the same
  // explanation (pointer-only tooltips are unreachable on touch devices).
  const [open, setOpen] = React.useState(false);
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();
  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`${label} — metrik açıklaması`}
            onClick={(e) => {
              stop(e);
              setOpen((o) => !o);
            }}
            onMouseDown={stop}
            onPointerDown={stop}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") e.stopPropagation();
            }}
            className={cn(
              "grid h-3.5 w-3.5 shrink-0 place-items-center rounded-sm",
              "text-muted-foreground/55 transition-colors hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--cobalt)]/60 focus-visible:text-foreground",
              className,
            )}
          >
            <Info className="h-3 w-3" aria-hidden="true" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          collisionPadding={12}
          className="max-w-[320px] text-[11.5px] leading-relaxed"
        >
          <div className="mb-0.5 font-medium">{label}</div>
          <div className="text-muted-foreground">{text}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function SharedMetricHeader<T>({
  column,
  label,
  metricKey,
  info,
  useShortLabel,
  align = "left",
  trailing,
  renderLabel,
  preserveLabelCase,
  className,
}: SharedMetricHeaderProps<T>) {
  const def = getMetricDefinition(metricKey ?? column.id);
  const fullLabel = label ?? def?.label ?? column.id;
  const visibleLabel = useShortLabel ? (def?.short ?? fullLabel) : fullLabel;
  const tooltip = info ?? def?.tooltip;
  const sortable = column.getCanSort();
  const sorted = column.getIsSorted();
  const SortIcon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown;

  const labelText = (
    // Outer box owns flex shrinking (basis-0 + min-w-0); the inner block owns
    // the 2-line clamp. Keeping them separate is required — `line-clamp`
    // switches display to -webkit-box, which does not shrink inside flex.
    <span
      className={cn(
        "min-w-0 flex-1 basis-0 overflow-hidden",
        align === "right" && "text-right",
        align === "center" && "text-center",
      )}
    >
      <span
        className={cn(
          "line-clamp-2 block text-[10.5px] font-semibold leading-[1.2] tracking-[0.01em] text-muted-foreground",
          // Proper nouns (app names) must keep their source casing — Turkish
          // locale uppercasing corrupts them (MyFitnessPal → MYFİTNESSPAL).
          !preserveLabelCase && "uppercase",
        )}
      >
        {renderLabel ? renderLabel() : visibleLabel}
      </span>
    </span>
  );

  return (
    <div
      className={cn(
        "flex h-full w-full min-w-0 items-stretch",
        align === "right" && "flex-row-reverse",
        className,
      )}
    >
      <div
        className={cn(
          "flex min-w-0 flex-1 items-center gap-0.5",
          align === "right" && "flex-row-reverse justify-start",
          align === "center" && "justify-center",
        )}
      >
        {sortable ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (sorted === false) column.toggleSorting(false);
              else if (sorted === "asc") column.toggleSorting(true);
              else column.clearSorting();
            }}
            title={fullLabel}
            aria-label={`${fullLabel} — sırala`}
            className={cn(
              "group/sort inline-flex min-w-0 flex-1 items-center gap-1 rounded-sm text-left",
              "transition-colors hover:[&>span]:text-foreground",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--cobalt)]/60",
              align === "right" && "flex-row-reverse text-right",
              align === "center" && "justify-center text-center",
            )}
          >
            {labelText}
            <SortIcon
              className={cn(
                "h-3 w-3 shrink-0 transition-opacity",
                sorted !== false
                  ? "text-primary opacity-100"
                  : "text-muted-foreground opacity-0 group-hover/th:opacity-50",
              )}
              aria-hidden="true"
            />
          </button>
        ) : (
          <span className="flex min-w-0 flex-1" title={fullLabel}>
            {labelText}
          </span>
        )}
        {tooltip && <MetricInfoTip label={fullLabel} text={tooltip} />}
      </div>

      {trailing && (
        <div className="flex w-[24px] shrink-0 items-center justify-center pe-1">{trailing}</div>
      )}
    </div>
  );
}
