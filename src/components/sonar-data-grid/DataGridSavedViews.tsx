import * as React from "react";
import { Bookmark, Check, MoreHorizontal, Pencil, Save, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { SavedView } from "./types";

interface Props<TSnap> {
  views: SavedView<TSnap>[];
  currentSnapshot: TSnap;
  onSave: (name: string, snapshot: TSnap) => void;
  onApply: (view: SavedView<TSnap>) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

/**
 * Saved views control — front-end prototype only (localStorage-backed by caller).
 */
export function DataGridSavedViews<TSnap>({
  views,
  currentSnapshot,
  onSave,
  onApply,
  onRename,
  onDelete,
  onSetDefault,
}: Props<TSnap>) {
  const [saveOpen, setSaveOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [renameId, setRenameId] = React.useState<string | null>(null);
  const [renameValue, setRenameValue] = React.useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = name.trim();
    if (!v) return;
    onSave(v, currentSnapshot);
    setName("");
    setSaveOpen(false);
  };

  return (
    <div className="flex items-center gap-1.5">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 border-hairline bg-surface/40 px-3 text-xs"
          >
            <Bookmark className="h-3.5 w-3.5" />
            Kayıtlı Görünümler
            {views.length > 0 && (
              <span className="ml-1 rounded bg-surface-3 px-1.5 text-[10px] tabular-nums text-muted-foreground">
                {views.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[260px] border-hairline bg-background">
          {views.length === 0 && (
            <div className="px-2 py-3 text-xs text-muted-foreground">
              Henüz kayıtlı görünüm yok.
            </div>
          )}
          {views.map((v) => (
            <div
              key={v.id}
              className="flex items-center gap-1 rounded-md px-1 py-0.5 hover:bg-surface-2/60"
            >
              <button
                type="button"
                onClick={() => onApply(v)}
                className="flex-1 truncate rounded px-2 py-1.5 text-left text-xs"
              >
                <span className="mr-1.5 inline-flex items-center">
                  {v.isDefault && (
                    <Star className="h-3 w-3 fill-[color:var(--warning)] text-[color:var(--warning)]" />
                  )}
                </span>
                {v.name}
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:bg-surface-3 hover:text-foreground"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Görünüm işlemleri"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="min-w-[180px] border-hairline bg-background"
                >
                  <DropdownMenuItem className="text-xs" onClick={() => onSetDefault(v.id)}>
                    <Check className="mr-2 h-3.5 w-3.5" />
                    Varsayılan Yap
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-xs"
                    onClick={() => {
                      setRenameId(v.id);
                      setRenameValue(v.name);
                    }}
                  >
                    <Pencil className="mr-2 h-3.5 w-3.5" />
                    Yeniden Adlandır
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-xs text-[color:var(--danger)] focus:text-[color:var(--danger)]"
                    onClick={() => onDelete(v.id)}
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Sil
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Popover open={saveOpen} onOpenChange={setSaveOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 border-hairline bg-surface/40 px-3 text-xs"
          >
            <Save className="h-3.5 w-3.5" />
            Görünümü Kaydet
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 border-hairline bg-background p-3">
          <form onSubmit={submit} className="space-y-2.5">
            <div>
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Görünüm Adı
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="örn. Hızlı Kazanımlar"
                autoFocus
                className="mt-1 h-9 border-hairline bg-surface/40 text-xs"
              />
              <p className="mt-1.5 text-[10px] text-muted-foreground">
                Aktif filtreler, sıralama, sütunlar, yoğunluk ve sayfa boyutu kaydedilir.
              </p>
            </div>
            <div className="flex justify-end gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => setSaveOpen(false)}
              >
                İptal
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-8 bg-primary px-3 text-xs text-primary-foreground hover:bg-primary/90"
              >
                Kaydet
              </Button>
            </div>
          </form>
        </PopoverContent>
      </Popover>

      {renameId && (
        <RenameDialog
          value={renameValue}
          onChange={setRenameValue}
          onCancel={() => setRenameId(null)}
          onSubmit={() => {
            const v = renameValue.trim();
            if (v && renameId) onRename(renameId, v);
            setRenameId(null);
          }}
        />
      )}
    </div>
  );
}

function RenameDialog({
  value,
  onChange,
  onCancel,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <div
      role="dialog"
      className={cn("fixed inset-0 z-50 grid place-items-center bg-[color:var(--overlay)] p-4")}
      onClick={onCancel}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm space-y-3 rounded-xl border border-hairline bg-background p-4 shadow-2xl"
      >
        <div>
          <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Görünümü Yeniden Adlandır
          </Label>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoFocus
            className="mt-1 h-9 border-hairline bg-surface/40 text-xs"
          />
        </div>
        <div className="flex justify-end gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={onCancel}
          >
            İptal
          </Button>
          <Button
            type="submit"
            size="sm"
            className="h-8 bg-primary px-3 text-xs text-primary-foreground hover:bg-primary/90"
          >
            Kaydet
          </Button>
        </div>
      </form>
    </div>
  );
}
