/**
 * ONE status/classification registry.
 *
 * Every opportunity pill ("Hızlı Kazanım", "Büyüme Fırsatı", "Koru", …) in the
 * product resolves its Turkish label, tone and explanation here. Route and cell
 * components must never repeat the explanation copy — they render `StatusPill`
 * (or read `getStatusDefinition`) so terminology can never drift.
 */
import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { OpportunityStatus } from "@/lib/dashboard-shared";

export interface StatusDefinition {
  /** Stable key (also the visible Turkish label today). */
  key: OpportunityStatus;
  label: string;
  /** Turkish explanation surfaced through the shared accessible tooltip. */
  description: string;
  /** Semantic tone classes (design tokens only). */
  tone: string;
}

export const STATUS_DEFINITIONS: Record<OpportunityStatus, StatusDefinition> = {
  "Hızlı Kazanım": {
    key: "Hızlı Kazanım",
    label: "Hızlı Kazanım",
    description:
      "Özellikle 6–30 arası sıralamada bulunan ve kısa vadede anlamlı yükselme potansiyeli taşıyan fırsat.",
    tone: "bg-[color:var(--success)]/12 text-[color:var(--success)] ring-[color:var(--success)]/25",
  },
  "Büyüme Fırsatı": {
    key: "Büyüme Fırsatı",
    label: "Büyüme Fırsatı",
    description:
      "Genellikle 31–100 arası sıralamada bulunan ve doğru optimizasyonla büyütülebilecek anahtar kelime.",
    tone: "bg-[color:var(--cobalt)]/12 text-[color:var(--cobalt)] ring-[color:var(--cobalt)]/25",
  },
  Koru: {
    key: "Koru",
    label: "Koru",
    description:
      "Uygulamanın hâlihazırda güçlü olduğu, genellikle ilk 1–5 sırada bulunan ve mevcut konumunun korunması gereken anahtar kelime.",
    tone: "bg-[color:var(--violet)]/12 text-[color:var(--violet)] ring-[color:var(--violet)]/25",
  },
  "Uzun Vadeli": {
    key: "Uzun Vadeli",
    label: "Uzun Vadeli",
    description:
      "Daha uzun süreli içerik, metadata, itibar veya uygulama gücü çalışması gerektiren fırsat.",
    tone: "bg-surface-3 text-muted-foreground ring-hairline",
  },
  "Çok Rekabetçi": {
    key: "Çok Rekabetçi",
    label: "Çok Rekabetçi",
    description: "Mevcut uygulama gücüne kıyasla rekabet zorluğu yüksek olan anahtar kelime.",
    tone: "bg-[color:var(--warning)]/12 text-[color:var(--warning)] ring-[color:var(--warning)]/25",
  },
  İlgisiz: {
    key: "İlgisiz",
    label: "İlgisiz",
    description:
      "Uygulama ile anahtar kelime arasındaki alaka seviyesi fırsat olarak gösterilmeyecek kadar düşük.",
    tone: "bg-surface-3 text-muted-foreground ring-hairline",
  },
};

export function getStatusDefinition(status: OpportunityStatus): StatusDefinition {
  return STATUS_DEFINITIONS[status];
}

export function statusLabel(status: OpportunityStatus): string {
  return STATUS_DEFINITIONS[status]?.label ?? status;
}

export function statusDescription(status: OpportunityStatus): string {
  return STATUS_DEFINITIONS[status]?.description ?? "";
}

/** Legacy alias — the single explanation map, derived from the registry. */
export const STATUS_EXPLAIN: Record<OpportunityStatus, string> = Object.fromEntries(
  Object.values(STATUS_DEFINITIONS).map((d) => [d.key, d.description]),
) as Record<OpportunityStatus, string>;

/** Tone map derived from the same registry (no second source of truth). */
export const STATUS_TONE_MAP: Record<OpportunityStatus, string> = Object.fromEntries(
  Object.values(STATUS_DEFINITIONS).map((d) => [d.key, d.tone]),
) as Record<OpportunityStatus, string>;

/**
 * Shared class fragments for interactive table controls.
 * `TOUCH_TARGET` expands the *hit* area to 44x44 on coarse pointers via a
 * transparent pseudo-element — the visible control keeps its compact size and
 * row heights are unaffected.
 */
export const INTERACTIVE_CONTROL =
  "select-none [-webkit-user-select:none] [touch-action:manipulation] [-webkit-tap-highlight-color:transparent]";

export const TOUCH_TARGET =
  "relative [@media(pointer:coarse)]:after:content-[''] [@media(pointer:coarse)]:after:absolute [@media(pointer:coarse)]:after:left-1/2 [@media(pointer:coarse)]:after:top-1/2 [@media(pointer:coarse)]:after:h-11 [@media(pointer:coarse)]:after:w-11 [@media(pointer:coarse)]:after:-translate-x-1/2 [@media(pointer:coarse)]:after:-translate-y-1/2 [@media(pointer:coarse)]:after:rounded-md";

/** True when the current environment is a coarse (touch) pointer. */
export function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const apply = () => setCoarse(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return coarse;
}

/**
 * Compact status pill with a shared, accessible explanation.
 *
 * Fine pointer: hover/focus Tooltip (uncontrolled — single open-state owner).
 * Coarse pointer: controlled Popover opened by the first tap.
 * The trigger is always a real <button type="button">.
 */
export function StatusPill({
  status,
  className,
}: {
  status: OpportunityStatus;
  className?: string;
}) {
  const def = getStatusDefinition(status);
  const coarse = useCoarsePointer();
  const [open, setOpen] = React.useState(false);
  if (!def) return null;

  const triggerClass = cn(
    "inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset",
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--focus-ring)]",
    INTERACTIVE_CONTROL,
    TOUCH_TARGET,
    def.tone,
    className,
  );

  const explanation = (
    <>
      <div className="mb-0.5 text-[11.5px] font-medium">{def.label}</div>
      <div className="text-[11.5px] leading-relaxed text-muted-foreground">{def.description}</div>
    </>
  );

  if (coarse) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            data-row-noclick="true"
            aria-label={`${def.label} — durum açıklaması`}
            className={triggerClass}
            onClick={(e) => e.stopPropagation()}
          >
            {def.label}
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="center"
          collisionPadding={12}
          className="z-[80] w-auto max-w-[calc(100vw-32px)] p-3 sm:max-w-[320px]"
          onClick={(e) => e.stopPropagation()}
          onPointerDownOutside={() => setOpen(false)}
        >
          {explanation}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            data-row-noclick="true"
            aria-label={`${def.label} — durum açıklaması`}
            className={triggerClass}
            onClick={(e) => e.stopPropagation()}
          >
            {def.label}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" collisionPadding={12} className="max-w-[320px]">
          {explanation}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
