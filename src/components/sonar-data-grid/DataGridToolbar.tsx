import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Layout wrapper — leaves composition to feature pages.
 *
 * Usage:
 *   <DataGridToolbar>
 *     <ToolbarSection>{filters}</ToolbarSection>
 *     <ToolbarSpacer />
 *     <ToolbarSection>{controls}</ToolbarSection>
 *   </DataGridToolbar>
 */
export function DataGridToolbar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-wrap items-center gap-2", className)}>{children}</div>;
}

export function ToolbarSpacer() {
  return <div className="flex-1" />;
}

export function ToolbarSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-wrap items-center gap-1.5", className)}>{children}</div>;
}
