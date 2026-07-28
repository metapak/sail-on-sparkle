import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Wrench, Star, Eye, Layers, FileText } from "lucide-react";

export const Route = createFileRoute("/ucretsiz-aso-araclari")({
  head: () => ({
    meta: [
      { title: "Ücretsiz ASO Araçları — Sonar Intel" },
      {
        name: "description",
        content:
          "Kayıt gerektirmeyen, ücretsiz App Store ve Google Play optimizasyon araçları koleksiyonu.",
      },
      { property: "og:title", content: "Ücretsiz ASO Araçları — Sonar Intel" },
      {
        property: "og:description",
        content:
          "Karakter sayacı, keyword optimizer, listing preview ve daha fazlası — hepsi ücretsiz.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FreeToolsPage,
});

const TOOLS = [
  {
    i: Wrench,
    t: "App Store Character Counter",
    d: "Title, subtitle ve description alanlarında karakter ve byte limitlerini gerçek zamanlı kontrol edin.",
  },
  {
    i: Wrench,
    t: "iOS 100-Byte Keyword Optimizer",
    d: "iOS keyword alanı için 100 byte'ı en verimli kullanacak kombinasyonu hesaplayın.",
  },
  {
    i: Wrench,
    t: "Keyword Density Checker",
    d: "Metadata metninizde hangi kelimelerin ne sıklıkta geçtiğini analiz edin.",
  },
  {
    i: Wrench,
    t: "Keyword Combination Tool",
    d: "Kelime köklerinden anlamlı ASO kombinasyonları üretin — çakışmasız.",
  },
  {
    i: Star,
    t: "Rating Calculator",
    d: "Ortalama puanınızı belirli bir seviyeye çıkarmak için kaç yeni yorum gerektiğini hesaplayın.",
  },
  {
    i: Eye,
    t: "Listing Preview",
    d: "App Store ve Google Play mağaza sayfalarınızın canlı önizlemesini görün.",
  },
  {
    i: Layers,
    t: "Screenshot Requirements Checker",
    d: "Ekran görüntülerinizin her cihaz için mağaza yönergelerine uygunluğunu doğrulayın.",
  },
  {
    i: FileText,
    t: "Basic ASO Audit",
    d: "Uygulamanızın mevcut ASO durumunu — metadata, kreatif, sıralama — 60 saniyede özetleyin.",
  },
];

function FreeToolsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" /> Ana sayfa
        </Link>
        <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">
          Ücretsiz ASO Araçları
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Kayıt olmadan kullanılabilir. Ücretli abonelik gerektirmez. Uygulama mağazası
          optimizasyonu için hazır araç koleksiyonu.
        </p>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TOOLS.map((t) => (
            <div key={t.t} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-surface-2 border border-border grid place-items-center">
                  <t.i className="h-4 w-4 text-cobalt" />
                </div>
                <div className="text-sm font-medium leading-snug">{t.t}</div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{t.d}</p>
              <div className="mt-3 text-[10px] uppercase tracking-widest text-muted-foreground">
                Ücretsiz
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
