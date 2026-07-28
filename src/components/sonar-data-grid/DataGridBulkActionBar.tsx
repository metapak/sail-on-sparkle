import * as React from "react";
import { X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface BulkAction {
  id: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
  primary?: boolean;
  disabled?: boolean;
  tooltip?: string;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface Props {
  count: number;
  itemNoun?: string;
  primary: BulkAction[];
  more?: BulkAction[];
  onClear: () => void;
  className?: string;
}

export function DataGridBulkActionBar({
  count,
  itemNoun = "kayıt",
  primary,
  more,
  onClear,
  className,
}: Props) {
  if (count <= 0) return null;
  return (
    <TooltipProvider delayDuration={150}>
      <div
        role="region"
        aria-label="Toplu işlem çubuğu"
        className={cn(
          // Integrated placement: static inside the table shell, under the data
          // viewport and above pagination. Never fixed to the browser viewport.
          "mt-2 flex w-full flex-wrap items-center gap-2 rounded-lg border border-hairline",
          "bg-[color-mix(in_oklab,var(--muted)_25%,var(--background))] px-3 py-2",
          className,
        )}
      >
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary/20 px-1.5 text-[11px] font-semibold text-primary tabular-nums">
            {count}
          </span>
          <span className="font-medium">{itemNoun} seçildi</span>
        </div>

        <div className="mx-1 h-5 w-px bg-hairline" />

        <div className="flex flex-wrap items-center gap-1">
          {primary.map((a) => {
            const Icon = a.icon;
            const btn = (
              <Button
                key={a.id}
                variant={a.primary ? "default" : "ghost"}
                size="sm"
                onClick={a.onClick}
                disabled={a.disabled}
                aria-describedby={a.hint ? `${a.id}-hint` : undefined}
                className={cn(
                  "h-7 gap-1.5 px-2 text-xs",
                  a.primary &&
                    "bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-surface-3 disabled:text-muted-foreground",
                  a.danger && "text-[color:var(--danger)] hover:text-[color:var(--danger)]",
                )}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {a.label}
              </Button>
            );
            const node = a.hint ? (
              <span key={a.id} className="inline-flex items-center gap-1.5">
                {btn}
                <span id={`${a.id}-hint`} className="text-[11px] text-[color:var(--warning)]">
                  {a.hint}
                </span>
              </span>
            ) : (
              btn
            );
            if (!a.tooltip) return node;
            return (
              <Tooltip key={a.id}>
                <TooltipTrigger asChild>
                  <span>{node}</span>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[11px]">
                  {a.tooltip}
                </TooltipContent>
              </Tooltip>
            );
          })}

          {more && more.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
                  Diğer İşlemler
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="min-w-[200px] border-hairline bg-background"
              >
                {more.map((a, i) => {
                  const Icon = a.icon;
                  return (
                    <React.Fragment key={a.id}>
                      {i > 0 && a.id === "__sep" && <DropdownMenuSeparator />}
                      <DropdownMenuItem
                        onClick={a.onClick}
                        disabled={a.disabled}
                        className={cn(
                          "text-xs",
                          a.danger && "text-[color:var(--danger)] focus:text-[color:var(--danger)]",
                        )}
                      >
                        {Icon && <Icon className="mr-2 h-3.5 w-3.5" />}
                        {a.label}
                      </DropdownMenuItem>
                    </React.Fragment>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="mx-1 h-5 w-px bg-hairline" />

        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-7 gap-1 px-2 text-xs text-muted-foreground"
          aria-label="Seçimi temizle"
        >
          <X className="h-3.5 w-3.5" />
          Seçimi Temizle
        </Button>
      </div>
    </TooltipProvider>
  );
}
