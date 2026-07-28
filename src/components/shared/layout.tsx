/**
 * SHARED PAGE LAYOUT SHELLS (Phase 5)
 *
 * Every page — public or authenticated — composes one of these shells so
 * content width, gutters, section rhythm and card gaps are defined once.
 */
import * as React from "react";
import { cn } from "@/lib/utils";
import { LAYOUT_PRESETS, type LayoutPreset } from "@/design/layout";

export interface PageShellProps {
  preset?: LayoutPreset;
  /**
   * `dense` trims the shell gutters for immersive/focus workspaces. It is the
   * only sanctioned spacing deviation and lives here, not in route files.
   */
  density?: "default" | "dense";
  children: React.ReactNode;
  className?: string;
}

const DENSE_CONTAINER = "w-full px-3 py-3";

/** Generic shell — prefer the named exports below. */
export function PageShell({
  preset = "dashboard",
  density = "default",
  children,
  className,
}: PageShellProps) {
  const spec = LAYOUT_PRESETS[preset];
  return (
    <div
      className={cn(
        density === "dense" ? DENSE_CONTAINER : spec.container,
        spec.section,
        className,
      )}
    >
      {children}
    </div>
  );
}

export function MarketingPage({ children, className }: Omit<PageShellProps, "preset">) {
  return (
    <PageShell preset="marketing" className={className}>
      {children}
    </PageShell>
  );
}

export function DashboardPage({ children, className }: Omit<PageShellProps, "preset">) {
  return (
    <PageShell preset="dashboard" className={className}>
      {children}
    </PageShell>
  );
}

/** Data-heavy analytical page — uses full available width for tables. */
export function WorkspacePage({ children, className, density }: Omit<PageShellProps, "preset">) {
  return (
    <PageShell preset="workspace" density={density} className={className}>
      {children}
    </PageShell>
  );
}

export function SettingsPage({ children, className }: Omit<PageShellProps, "preset">) {
  return (
    <PageShell preset="settings" className={className}>
      {children}
    </PageShell>
  );
}

export function DetailPage({ children, className }: Omit<PageShellProps, "preset">) {
  return (
    <PageShell preset="detail" className={className}>
      {children}
    </PageShell>
  );
}

/** Card grid using the preset's canonical gap. */
export function CardGrid({
  preset = "dashboard",
  columns = 4,
  children,
  className,
}: {
  preset?: LayoutPreset;
  columns?: 2 | 3 | 4 | 5;
  children: React.ReactNode;
  className?: string;
}) {
  const cols: Record<number, string> = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
  };
  return (
    <div className={cn("grid", cols[columns], LAYOUT_PRESETS[preset].cardGap, className)}>
      {children}
    </div>
  );
}
