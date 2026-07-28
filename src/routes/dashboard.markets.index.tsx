import { createFileRoute } from "@tanstack/react-router";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export const Route = createFileRoute("/dashboard/markets/")({
  head: () => ({
    meta: [
      { title: "Pazarlar · Özet — Sonar Dashboard" },
      {
        name: "description",
        content:
          "Ülke bazlı fırsatları, pazar karşılaştırmasını ve yükselen pazarları tek yerden izleyin.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <FeaturePlaceholder
      eyebrow="PAZAR ZEKÂSI"
      title="Pazarlar"
      description="Ülke bazlı fırsatları, pazar karşılaştırmasını ve yükselen pazarları tek yerden izleyin."
      bullets={[
        "Pazarlar modülüne ait tüm sayfalara buradan ulaşın.",
        "Modül başına ana metrikler ve giriş noktaları",
        "İlgili çalışma alanına hızlı geçişler",
        "Ekipte paylaşılabilir özet (yaklaşan)",
      ]}
      breadcrumb={[
        { label: "Genel Bakış", to: "/dashboard" },
        { label: "Pazarlar" },
        { label: "Özet" },
      ]}
      primaryAction={{ label: "Genel Bakışa Dön", to: "/dashboard" }}
    />
  ),
});
