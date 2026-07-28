import { createFileRoute } from "@tanstack/react-router";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export const Route = createFileRoute("/dashboard/markets/comparison")({
  head: () => ({
    meta: [
      { title: "Pazarlar · Pazar Karşılaştırması — Sonar Dashboard" },
      {
        name: "description",
        content: "Seçili pazarları anahtar kelime ve indirme verileri üzerinden karşılaştırın.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <FeaturePlaceholder
      eyebrow="PAZAR ZEKÂSI · PAZAR KARŞILAŞTIRMASI"
      title="Pazar Karşılaştırması"
      description="Seçili pazarları anahtar kelime ve indirme verileri üzerinden karşılaştırın."
      bullets={[
        "Çoklu ülke karşılaştırma",
        "Anahtar kelime dağılımı",
        "İndirme ve dönüşüm sinyalleri",
        "Kategori bazlı kırılım",
      ]}
      breadcrumb={[
        { label: "Genel Bakış", to: "/dashboard" },
        { label: "Pazarlar", to: "/dashboard/markets" },
        { label: "Pazar Karşılaştırması" },
      ]}
      primaryAction={{ label: "Pazarlar Özetine Dön", to: "/dashboard/markets" }}
    />
  ),
});
