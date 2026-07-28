import * as React from "react";
import { LineChart } from "lucide-react";
import { cn } from "@/lib/utils";

interface SonarChartEmptyStateProps {
  message: string;
  pointCount: number;
  firstTrackedAt?: string | null;
  nextRefreshAt?: string | null;
  className?: string;
}

export function SonarChartEmptyState({
  message,
  pointCount,
  firstTrackedAt,
  nextRefreshAt,
  className,
}: SonarChartEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-hairline bg-surface/30 p-6 text-center",
        className,
      )}
    >
      <div className="grid h-10 w-10 place-items-center rounded-full bg-surface-2 ring-1 ring-hairline">
        <LineChart className="h-5 w-5 text-muted-foreground" aria-hidden />
      </div>
      <p className="max-w-sm text-sm text-foreground">{message}</p>
      <dl className="grid grid-cols-3 gap-3 text-[11px] text-muted-foreground">
        <div>
          <dt className="uppercase tracking-wide">Ölçüm</dt>
          <dd className="mt-0.5 tabular-nums text-foreground">{pointCount}</dd>
        </div>
        {firstTrackedAt && (
          <div>
            <dt className="uppercase tracking-wide">İlk Takip</dt>
            <dd className="mt-0.5 tabular-nums text-foreground">{firstTrackedAt}</dd>
          </div>
        )}
        {nextRefreshAt && (
          <div>
            <dt className="uppercase tracking-wide">Sonraki Yenileme</dt>
            <dd className="mt-0.5 tabular-nums text-foreground">{nextRefreshAt}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
