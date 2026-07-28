import * as React from "react";
import {
  Columns3,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Pin,
  PinOff,
  Maximize2,
  ChevronsUp,
  ChevronsDown,
  GripVertical,
} from "lucide-react";
import type { Table, Column } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { SonarColumnMeta } from "./types";
import { resolveColumnLabel } from "@/components/shared/column-kit";

interface Props<T> {
  table: Table<T>;
  onReset: () => void;
  onResetOrder?: () => void;
  onResetWidths?: () => void;
  onAutoFitAll?: () => void;
  onMoveColumn?: (columnId: string, delta: number) => void;
  onMoveColumnTo?: (columnId: string, target: "top" | "bottom") => void;
  onPinColumn?: (columnId: string, side: "left" | false) => void;
  onReorderColumns?: (draggedId: string, targetId: string) => void;
}

/** Localized label for a column — the raw internal id is never shown. */
function columnLabel(id: string, meta: SonarColumnMeta): string {
  return resolveColumnLabel({ id, label: meta.label, metricKey: id });
}

/**
 * Simplified column manager — drag / show / hide / pin / move.
 * Numeric width inputs and per-column auto-fit removed;
 * users resize columns directly from table headers.
 */
export function DataGridColumnManager<T>({
  table,
  onReset,
  onResetOrder,
  onResetWidths,
  onAutoFitAll,
  onMoveColumn,
  onMoveColumnTo,
  onPinColumn,
  onReorderColumns,
}: Props<T>) {
  const columns = table.getAllLeafColumns();
  const toggleable = columns.filter((c) => {
    const meta = (c.columnDef.meta ?? {}) as SonarColumnMeta;
    return meta.canHide !== false && c.id !== "_actionsSpacer";
  });
  const locked = columns.filter((c) => {
    const meta = (c.columnDef.meta ?? {}) as SonarColumnMeta;
    return meta.canHide === false && c.id !== "_actionsSpacer";
  });

  const [dragId, setDragId] = React.useState<string | null>(null);
  const [dropId, setDropId] = React.useState<string | null>(null);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 border-hairline bg-surface/40 px-3 text-xs"
        >
          <Columns3 className="h-3.5 w-3.5" />
          Sütunları Düzenle
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={6}
        className="w-[360px] border-hairline bg-popover p-0"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <div className="text-[13px] font-medium">Sütunları Düzenle</div>
            <div className="text-[11px] text-muted-foreground">
              Sürükleyerek sıralayın; sabitleyin veya gizleyin.
            </div>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
            title="Görünürlüğü sıfırla"
          >
            <RotateCcw className="h-3 w-3" />
            Sıfırla
          </button>
        </div>
        <Separator className="bg-hairline" />

        {locked.length > 0 && (
          <div className="px-3 py-2">
            <div className="mb-1 px-1 text-[10px] font-medium tracking-wide text-muted-foreground">
              Sabit
            </div>
            {locked.map((c) => {
              const meta = (c.columnDef.meta ?? {}) as SonarColumnMeta;
              return (
                <div
                  key={c.id}
                  className="flex h-[36px] items-center gap-2 rounded-md px-2 text-xs text-muted-foreground"
                >
                  <span className="flex-1 truncate">{columnLabel(c.id, meta)}</span>
                  <span className="rounded border border-hairline px-1 text-[10px] tracking-wide">
                    Sabit
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {locked.length > 0 && <Separator className="bg-hairline" />}

        <div className="max-h-[440px] overflow-y-auto p-2">
          {toggleable.map((c) => {
            const meta = (c.columnDef.meta ?? {}) as SonarColumnMeta;
            const canMove = Boolean(onMoveColumn) && meta.reorderable === true;
            const isDropTarget = dropId === c.id && dragId !== c.id;
            return (
              <ManagerRow
                key={c.id}
                column={c}
                meta={meta}
                canMove={canMove}
                canDrag={Boolean(onReorderColumns) && meta.reorderable === true}
                isDragging={dragId === c.id}
                isDropTarget={isDropTarget}
                onDragStart={() => setDragId(c.id)}
                onDragOver={() => setDropId(c.id)}
                onDrop={() => {
                  if (dragId && dragId !== c.id && onReorderColumns) {
                    onReorderColumns(dragId, c.id);
                  }
                  setDragId(null);
                  setDropId(null);
                }}
                onDragEnd={() => {
                  setDragId(null);
                  setDropId(null);
                }}
                onMove={onMoveColumn}
                onMoveTo={onMoveColumnTo}
                onPin={onPinColumn}
              />
            );
          })}
        </div>

        {(onResetOrder || onResetWidths || onAutoFitAll) && (
          <>
            <Separator className="bg-hairline" />
            <div className="flex flex-wrap gap-1 p-2">
              {onAutoFitAll && (
                <button
                  type="button"
                  onClick={onAutoFitAll}
                  className="inline-flex items-center gap-1 rounded-md border border-hairline px-2 py-1 text-[11px] text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                >
                  <Maximize2 className="h-3 w-3" /> Tüm Sütunları Otomatik Sığdır
                </button>
              )}
              {onResetWidths && (
                <button
                  type="button"
                  onClick={onResetWidths}
                  className="inline-flex items-center gap-1 rounded-md border border-hairline px-2 py-1 text-[11px] text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                >
                  <RotateCcw className="h-3 w-3" /> Varsayılan Genişliklere Dön
                </button>
              )}
              {onResetOrder && (
                <button
                  type="button"
                  onClick={onResetOrder}
                  className="inline-flex items-center gap-1 rounded-md border border-hairline px-2 py-1 text-[11px] text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                >
                  <RotateCcw className="h-3 w-3" /> Varsayılan Sıraya Dön
                </button>
              )}
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

/* --------------- Row --------------- */
function ManagerRow<T>({
  column,
  meta,
  canMove,
  canDrag,
  isDragging,
  isDropTarget,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onMove,
  onMoveTo,
  onPin,
}: {
  column: Column<T, unknown>;
  meta: SonarColumnMeta;
  canMove: boolean;
  canDrag: boolean;
  isDragging: boolean;
  isDropTarget: boolean;
  onDragStart: () => void;
  onDragOver: () => void;
  onDrop: () => void;
  onDragEnd: () => void;
  onMove?: (id: string, delta: number) => void;
  onMoveTo?: (id: string, target: "top" | "bottom") => void;
  onPin?: (id: string, side: "left" | false) => void;
}) {
  const label = columnLabel(column.id, meta);
  const visible = column.getIsVisible();
  const pinned = column.getIsPinned();

  return (
    <div
      draggable={canDrag}
      onDragStart={(e) => {
        if (!canDrag) return;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", column.id);
        onDragStart();
      }}
      onDragOver={(e) => {
        if (!canDrag) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        onDragOver();
      }}
      onDrop={(e) => {
        if (!canDrag) return;
        e.preventDefault();
        onDrop();
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "group relative flex items-center gap-1.5 rounded-md px-1.5 py-1.5",
        "hover:bg-surface-2/60",
        isDragging && "opacity-40",
        isDropTarget && "outline outline-2 -outline-offset-2 outline-[color:var(--cobalt)]",
      )}
      style={{ minHeight: 44, userSelect: "none" }}
    >
      <button
        type="button"
        aria-label={`${label} sürükle`}
        className={cn(
          "grid h-8 w-6 shrink-0 cursor-grab place-items-center rounded text-muted-foreground",
          "hover:bg-surface-3 hover:text-foreground active:cursor-grabbing",
          !canDrag && "cursor-not-allowed opacity-40",
        )}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <Checkbox
        checked={visible}
        onCheckedChange={(v) => column.toggleVisibility(Boolean(v))}
        className="h-3.5 w-3.5 shrink-0"
        aria-label={`${label} görünürlüğü`}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 truncate text-[12.5px] font-medium">
          <span className="truncate">{label}</span>
          {pinned === "left" && <Pin className="h-3 w-3 shrink-0 text-primary" />}
        </div>
        <div className="text-[10.5px] text-muted-foreground">
          {visible ? (pinned === "left" ? "Sabit" : "Görünür") : "Gizli"}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        {canMove && onMoveTo && (
          <IconBtn
            aria-label={`${label} en üste taşı`}
            onClick={() => onMoveTo(column.id, "top")}
            icon={<ChevronsUp className="h-3.5 w-3.5" />}
          />
        )}
        {canMove && onMove && (
          <IconBtn
            aria-label={`${label} yukarı taşı`}
            onClick={() => onMove(column.id, -1)}
            icon={<ArrowUp className="h-3.5 w-3.5" />}
          />
        )}
        {canMove && onMove && (
          <IconBtn
            aria-label={`${label} aşağı taşı`}
            onClick={() => onMove(column.id, 1)}
            icon={<ArrowDown className="h-3.5 w-3.5" />}
          />
        )}
        {canMove && onMoveTo && (
          <IconBtn
            aria-label={`${label} en alta taşı`}
            onClick={() => onMoveTo(column.id, "bottom")}
            icon={<ChevronsDown className="h-3.5 w-3.5" />}
          />
        )}
        {onPin && meta.pinnable && (
          <IconBtn
            aria-label={
              pinned === "left" ? `${label} sabitlemesini kaldır` : `${label} sola sabitle`
            }
            onClick={() => onPin(column.id, pinned === "left" ? false : "left")}
            icon={
              pinned === "left" ? (
                <PinOff className="h-3.5 w-3.5" />
              ) : (
                <Pin className="h-3.5 w-3.5" />
              )
            }
            active={pinned === "left"}
          />
        )}
      </div>
    </div>
  );
}

function IconBtn({
  icon,
  active,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon: React.ReactNode; active?: boolean }) {
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        "grid h-6 w-6 place-items-center rounded text-muted-foreground",
        "hover:bg-surface-3 hover:text-foreground",
        active && "text-primary",
      )}
    >
      {icon}
    </button>
  );
}
