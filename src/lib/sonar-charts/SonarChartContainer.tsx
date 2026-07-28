import * as React from "react";
import { cn } from "@/lib/utils";

interface SonarChartContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Desktop min-height in px; mobile falls back to 230. */
  minHeight?: number;
}

/**
 * Standard chart shell: hairline surface, consistent padding, and a
 * responsive min-height so ECharts has a real box to size against.
 */
export function SonarChartContainer({
  children,
  className,
  minHeight = 280,
}: SonarChartContainerProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-lg border border-hairline bg-surface/30",
        className,
      )}
      style={
        {
          "--sonar-chart-min-h": `${minHeight}px`,
        } as React.CSSProperties
      }
    >
      <div className="w-full" style={{ minHeight: "var(--sonar-chart-min-h)" }}>
        {children}
      </div>
    </div>
  );
}
