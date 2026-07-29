/**
 * SHARED ANALYSIS PANEL
 *
 * One panel language for every analytical workspace surface: primary tables,
 * charts, comparison blocks, historical analysis and breakdown sections.
 *
 * Routes provide only content and (optionally) a toolbar/footer. Header
 * typography, border, radius, spacing, and the loading / empty / error state
 * placement are owned here so no route re-implements them.
 *
 * Visual values come from the analytical variant presets (src/design/analytical.ts)
 * which resolve to the semantic tokens in src/styles.css — nothing is hardcoded.
 */
import * as React from "react";
import { cn } from "@/lib/utils";
import {
  ANALYTICAL_CARD_FLUSH,
  ANALYTICAL_SECTION_HEAD,
  ANALYTICAL_CONTROLS,
  ANALYTICAL_STATE,
} from "@/design/analytical";
import { MetricInfoTip } from "./metric-header";
import { EmptyState, ErrorState } from "./index";

export interface AnalysisPanelProps {
  /** Small uppercase context label. */
  eyebrow?: string;
  /** Localized panel title (Turkish). */
  title: string;
  /** Concise supporting description. */
  description?: string;
  /** Optional metric explanation shown next to the title. */
  info?: string;
  /** Optional secondary information (freshness, counts…) shown in the header. */
  meta?: React.ReactNode;
  /** Optional header action(s) — keep to one or two restrained controls. */
  actions?: React.ReactNode;
  /** Toolbar row rendered between header and content (search, filters…). */
  toolbar?: React.ReactNode;
  /** Footer row rendered below the content (pagination…). */
  footer?: React.ReactNode;

  /* ---- shared states ---- */
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  /** Distinguishes "no data at all" from "no data for the current filters". */
  isFiltered?: boolean;
  errorDescription?: string;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActions?: React.ReactNode;

  children: React.ReactNode;
  className?: string;
  /** Content wrapper class — usually the shared table shell preset. */
  contentClassName?: string;
}

export function AnalysisPanel({
  eyebrow,
  title,
  description,
  info,
  meta,
  actions,
  toolbar,
  footer,
  isLoading,
  isError,
  isEmpty,
  isFiltered,
  errorDescription = "Veriler yüklenemedi.",
  onRetry,
  emptyTitle,
  emptyDescription,
  emptyActions,
  children,
  className,
  contentClassName,
}: AnalysisPanelProps) {
  const showError = !!isError;
  const showEmpty = !showError && !isLoading && !!isEmpty;

  return (
    <section className={cn(ANALYTICAL_CARD_FLUSH, className)}>
      <header
        className={cn(
          "flex flex-wrap items-end justify-between gap-3 border-b border-[color:var(--border)] px-4 py-3 sm:px-5",
          ANALYTICAL_SECTION_HEAD,
        )}
      >
        <div className="min-w-0">
          {eyebrow && <div className="eyebrow mb-1">{eyebrow}</div>}
          <div className="flex min-w-0 items-center gap-1.5">
            <h2 className="type-section-title truncate">{title}</h2>
            {info && <MetricInfoTip label={title} text={info} />}
          </div>
          {description && (
            <p className="mt-1 max-w-2xl text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {(meta || actions) && (
          <div className={cn(ANALYTICAL_CONTROLS, "flex flex-wrap items-center gap-2")}>
            {meta}
            {actions}
          </div>
        )}
      </header>

      {toolbar && (
        <div
          className={cn(
            ANALYTICAL_CONTROLS,
            "flex flex-wrap items-center gap-2 border-b border-[color:var(--border)] px-4 py-2.5 sm:px-5",
          )}
        >
          {toolbar}
        </div>
      )}

      {showError ? (
        <ErrorState
          className={cn(ANALYTICAL_STATE, "m-5")}
          description={errorDescription}
          onRetry={onRetry}
        />
      ) : showEmpty ? (
        <EmptyState
          className={cn(ANALYTICAL_STATE, "m-5")}
          title={emptyTitle ?? (isFiltered ? "Filtrelerle eşleşen kayıt yok" : "Kayıt bulunamadı")}
          description={
            emptyDescription ??
            (isFiltered
              ? "Filtreleri gevşetin veya aramanızı değiştirin."
              : "Bu görünüm için henüz veri yok.")
          }
          action={emptyActions}
        />
      ) : (
        <div className={cn("min-w-0", contentClassName)}>{children}</div>
      )}

      {footer && !showError && !showEmpty && <div className="min-w-0">{footer}</div>}
    </section>
  );
}
