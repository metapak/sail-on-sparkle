/**
 * Shared compact sparkline — the ONLY Recharts usage in the app.
 *
 * Kept inside the shared chart layer so no route or lib module imports a
 * chart engine directly. Unovis remains the primary engine for every
 * primary analytical chart; this renderer exists purely for inline,
 * axis-less KPI/table trends where a full chart adds no value.
 */
import * as React from "react";
import { ResponsiveContainer, AreaChart, Area, YAxis } from "recharts";

export interface SparklineProps {
  /** Raw numeric values — never pre-formatted strings. */
  data: number[];
  /** Semantic color token; defaults to the primary series hue. */
  color?: string;
  /** Rank semantics: reverse so "up" means "closer to #1". */
  reversed?: boolean;
}

/** Compact inline trend. Not a substitute for a primary analytical chart. */
export function SparklineChart({
  data,
  color = "var(--cobalt)",
  reversed = false,
}: SparklineProps) {
  const points = React.useMemo(() => data.map((v, i) => ({ i, v })), [data]);
  const id = React.useId();
  return (
    <div className="h-10 w-full">
      <ResponsiveContainer>
        <AreaChart data={points} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`sp-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={`color-mix(in oklab, ${color} 60%, transparent)`} />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <YAxis hide domain={["dataMin", "dataMax"]} reversed={reversed} />
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#sp-${id})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
