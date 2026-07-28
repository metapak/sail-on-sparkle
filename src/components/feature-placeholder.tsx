import * as React from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel, PageHeader, DashboardPage } from "@/components/shared";

export interface FeaturePlaceholderProps {
  eyebrow?: string;
  title: string;
  description: string;
  bullets?: string[];
  /** @deprecated Breadcrumbs now live in the dashboard shell. Prop kept for compat, ignored. */
  breadcrumb?: { label: string; to?: string }[];
  primaryAction?: { label: string; to: string };
  secondaryAction?: { label: string; to: string };
}

/**
 * Controlled placeholder for undeveloped dashboard routes.
 *
 * Composes the shared dashboard layout shell, shared PageHeader and shared
 * typography/tokens only — no local heading scale, spacing or raw colors.
 */
export function FeaturePlaceholder({
  eyebrow,
  title,
  description,
  bullets,
  primaryAction,
  secondaryAction,
}: FeaturePlaceholderProps) {
  return (
    <DashboardPage>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <Panel className="flex flex-col gap-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/12 ring-1 ring-primary/25">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="type-card-title">Bu modül hazırlanıyor</div>
            <p className="type-caption mt-1 leading-relaxed text-muted-foreground">
              Aşağıdaki yetenekler bu çalışma alanına yakında eklenecek. Bu sayfa şu an bilgi
              amaçlıdır; gerçek veri ya da sahte grafik göstermez.
            </p>
          </div>
        </div>

        {bullets && bullets.length > 0 && (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {bullets.map((b) => (
              <li
                key={b}
                className="type-caption flex items-start gap-2 rounded-md border border-hairline bg-surface/40 px-3 py-2 text-muted-foreground"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <Button asChild variant="outline" size="sm" className="border-hairline">
            <Link to={primaryAction?.to ?? "/dashboard"}>
              <ArrowLeft className="h-3.5 w-3.5" />
              {primaryAction?.label ?? "Genel Bakışa Dön"}
            </Link>
          </Button>
          {secondaryAction && (
            <Button asChild size="sm">
              <Link to={secondaryAction.to}>{secondaryAction.label}</Link>
            </Button>
          )}
        </div>
      </Panel>
    </DashboardPage>
  );
}
