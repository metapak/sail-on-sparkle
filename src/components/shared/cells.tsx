/**
 * Shared table cell primitives.
 *
 * Score, rank and change cells render one consistent visual language across
 * every analytical table. Kept in a leaf module (no table/chart imports) so
 * domain column definitions can consume them without import cycles.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

const SCORE_BANDS = [
  { min: 67, label: "Yüksek", color: "var(--success)" },
  { min: 34, label: "Orta", color: "var(--warning)" },
  { min: -Infinity, label: "Düşük", color: "var(--danger)" },
] as const;

export interface ScoreCellProps {
  /** 0–100 metric value. */
  value: number;
  /** Show the compact semantic label next to the number. */
  showLabel?: boolean;
  /**
   * Invert the semantic tone: for metrics where a high value is unfavourable
   * (e.g. difficulty), "Yüksek" reads as risk rather than success.
   */
  invert?: boolean;
  className?: string;
}

/**
 * 0–100 score cell — semibold number plus a compact semantic label.
 * Deliberately renders no filled bar, swatch, or badge chrome.
 */
export function ScoreCell({ value, showLabel = true, invert = false, className }: ScoreCellProps) {
  const band = SCORE_BANDS.find((b) => value >= b.min) ?? SCORE_BANDS[SCORE_BANDS.length - 1];
  const color = invert
    ? band.label === "Yüksek"
      ? "var(--danger)"
      : band.label === "Orta"
        ? "var(--warning)"
        : "var(--success)"
    : band.color;
  return (
    <span className={cn("inline-flex items-baseline gap-1.5 tabular-nums", className)}>
      <span className="text-[13px] font-semibold text-foreground">{value}</span>
      {showLabel && (
        <span className="text-[11px]" style={{ color }}>
          {band.label}
        </span>
      )}
    </span>
  );
}

/** Rank cell — "#14" with tier-aware color and an explicit top-200 fallback. */
export function RankCell({ rank, className }: { rank: number | null; className?: string }) {
  if (rank == null) {
    return (
      <span
        className={cn(
          "line-clamp-2 whitespace-normal text-[11px] italic leading-tight text-muted-foreground",
          className,
        )}
      >
        Top 200 içinde bulunamadı
      </span>
    );
  }
  const color = rank <= 3 ? "var(--success)" : rank <= 10 ? "var(--primary)" : "var(--foreground)";
  return (
    <span className={cn("text-[13px] font-semibold tabular-nums", className)} style={{ color }}>
      #{rank}
    </span>
  );
}
