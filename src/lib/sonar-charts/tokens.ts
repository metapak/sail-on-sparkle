/**
 * Sonar chart tokens.
 *
 * Reads live CSS variable values from the document root so charts stay
 * in sync with the active Açık / Koyu / Sistem theme instead of shipping
 * hard-coded palettes.
 */

export interface SonarChartTokens {
  background: string;
  axisLabel: string;
  axisLine: string;
  gridLine: string;
  tooltipSurface: string;
  tooltipBorder: string;
  tooltipText: string;
  primary: string;
  primarySoft: string;
  positive: string;
  negative: string;
  neutral: string;
  event: string;
  focus: string;
  hover: string;
}

function readVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export function readSonarChartTokens(): SonarChartTokens {
  const foreground = readVar("--foreground", "#e5e7eb");
  const surface = readVar("--surface", "#111827");
  const hairline = readVar("--hairline", "rgba(148,163,184,0.22)");
  const cobalt = readVar("--cobalt", "#4f74ff");
  const success = readVar("--success", "#10b981");
  const danger = readVar("--danger", "#ef4444");
  const warning = readVar("--warning", "#f59e0b");
  const muted = readVar("--muted-foreground", "#9ca3af");

  return {
    background: "transparent",
    axisLabel: readVar("--chart-axis", `color-mix(in oklab, ${foreground} 60%, transparent)`),
    axisLine: readVar("--chart-axis", `color-mix(in oklab, ${foreground} 12%, transparent)`),
    gridLine: readVar("--chart-grid", `color-mix(in oklab, ${foreground} 8%, transparent)`),
    tooltipSurface: surface,
    tooltipBorder: hairline,
    tooltipText: foreground,
    primary: cobalt,
    primarySoft: `color-mix(in oklab, ${cobalt} 18%, transparent)`,
    positive: success,
    negative: danger,
    neutral: muted,
    event: warning,
    focus: cobalt,
    hover: readVar("--chart-crosshair", `color-mix(in oklab, ${cobalt} 24%, transparent)`),
  };
}
