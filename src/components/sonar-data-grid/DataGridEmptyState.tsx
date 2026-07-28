import * as React from "react";
import { Inbox } from "lucide-react";

interface Props {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}

export function DataGridEmptyState({ title, description, actions, icon: Icon = Inbox }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="grid h-10 w-10 place-items-center rounded-full border border-hairline bg-surface/40">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <div className="text-sm font-medium">{title}</div>
        {description && <div className="mt-1 text-xs text-muted-foreground">{description}</div>}
      </div>
      {actions && <div className="mt-1 flex items-center gap-2">{actions}</div>}
    </div>
  );
}
