import * as React from "react";
import { Rows2, Rows3, Rows4 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { DENSITY_LABEL, type Density } from "./types";

const ICONS: Record<Density, React.ComponentType<{ className?: string }>> = {
  comfortable: Rows2,
  standard: Rows3,
  compact: Rows4,
};

export function DataGridDensitySelector({
  value,
  onChange,
}: {
  value: Density;
  onChange: (d: Density) => void;
}) {
  const Icon = ICONS[value];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 border-hairline bg-surface/40 px-3 text-xs"
          aria-label="Satır yoğunluğu"
        >
          <Icon className="h-3.5 w-3.5" />
          {DENSITY_LABEL[value]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px] border-hairline bg-background">
        {(Object.keys(DENSITY_LABEL) as Density[]).map((d) => {
          const I = ICONS[d];
          return (
            <DropdownMenuItem
              key={d}
              onClick={() => onChange(d)}
              className={cn("text-xs", value === d && "bg-surface-2/60")}
            >
              <I className="mr-2 h-3.5 w-3.5" />
              {DENSITY_LABEL[d]}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
