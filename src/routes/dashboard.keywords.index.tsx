import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { ArrowRight, ListChecks, Search, Swords, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel, DashboardPage } from "@/components/shared";
import { cn } from "@/lib/utils";
import { deriveKeywordRecords } from "@/lib/keywords/data";
import { BUILT_IN_VIEWS } from "@/lib/keywords/views";

export const Route = createFileRoute("/dashboard/keywords/")({
  head: () => ({
    meta: [
      { title: "Anahtar Kelime Özeti — Sonar Dashboard" },
      {
        name: "description",
        content:
          "Anahtar kelime görünürlüğünüzü, sıralama hareketlerini ve en önemli fırsatları tek noktadan izleyin.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: KeywordsOverview,
});

function KeywordsOverview() {
  const records = React.useMemo(() => deriveKeywordRecords(), []);
  const counts = React.useMemo(() => {
    const map = {} as Record<string, number>;
    for (const v of BUILT_IN_VIEWS) map[v.id] = records.filter(v.test).length;
    return map;
  }, [records]);
  const top10 = records.filter((r) => r.rank != null && r.rank <= 10).length;

  const summary = [
    { label: "Takip Edilenler", value: counts.tracked ?? 0, tone: "text-foreground" },
    { label: "İlk 10'daki Anahtar Kelimeler", value: top10, tone: "text-primary" },
    { label: "Yükselenler", value: counts.rising ?? 0, tone: "text-[color:var(--success)]" },
    { label: "Düşenler", value: counts.falling ?? 0, tone: "text-[color:var(--danger)]" },
    {
      label: "Yüksek Fırsatlar",
      value: counts.high_opportunity ?? 0,
      tone: "text-[color:var(--success)]",
    },
  ];

  const actions = [
    {
      icon: ListChecks,
      label: "Takip Edilenleri Aç",
      desc: "Sıralama, favoriler ve hızlı önizleme.",
      to: "/dashboard/keywords/tracked",
    },
    {
      icon: Search,
      label: "Anahtar Kelime Araştırmasına Git",
      desc: "Yeni fırsat kelimelerini keşfedin.",
      to: "/dashboard/keywords/research",
    },
    {
      icon: Swords,
      label: "Rakip Analizini Aç",
      desc: "Ortak ve boşluk anahtar kelimeler.",
      to: "/dashboard/keywords/competitors",
    },
    {
      icon: ArrowLeftRight,
      label: "Yeni ve Kaybedilenleri İncele",
      desc: "Son dönem sıralama hareketleri.",
      to: "/dashboard/keywords/movements",
    },
  ];

  return (
    <DashboardPage className="space-y-6">
      <div>
        <div className="eyebrow mb-1">ANAHTAR KELİME ZEKÂSI</div>
        <h1 className="font-editorial text-2xl font-semibold tracking-tight sm:text-3xl">
          Anahtar Kelime Özeti
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Anahtar kelime görünürlüğünüzü, sıralama hareketlerini ve en önemli fırsatları tek
          noktadan izleyin.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {summary.map((s) => (
          <Panel key={s.label} className="p-4">
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {s.label}
            </div>
            <div
              className={cn("mt-1.5 font-editorial text-3xl font-semibold tabular-nums", s.tone)}
            >
              {s.value}
            </div>
          </Panel>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {actions.map((a) => (
          <Panel key={a.to} className="flex items-start gap-3 p-4 sm:p-5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/12 ring-1 ring-[color:var(--cobalt)]/25">
              <a.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">{a.label}</div>
              <p className="mt-0.5 text-xs text-muted-foreground">{a.desc}</p>
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 shrink-0 border-hairline bg-surface/40 px-3 text-xs"
            >
              <Link to={a.to}>
                Aç <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </Panel>
        ))}
      </div>
    </DashboardPage>
  );
}
