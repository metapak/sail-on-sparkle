import { createFileRoute } from "@tanstack/react-router";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export const Route = createFileRoute("/dashboard/competitors/visibility")({
  head: () => ({
    meta: [
      { title: "Rakipler · Görünürlük Karşılaştırması — Sonar Dashboard" },
      {
        name: "description",
        content: "Sizin ve rakiplerinizin görünürlük skorlarının zaman içindeki karşılaştırması.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <FeaturePlaceholder
      eyebrow="RAKİP ZEKÂSI · GÖRÜNÜRLÜK KARŞILAŞTIRMASI"
      title="Görünürlük Karşılaştırması"
      description="Sizin ve rakiplerinizin görünürlük skorlarının zaman içindeki karşılaştırması."
      bullets={[
        "Rakip başına görünürlük eğilimi",
        "Ortak ve boşluk anahtar kelime grafiği",
        "Pazar bazlı karşılaştırma",
        "Segmentli filtreleme",
      ]}
      breadcrumb={[
        { label: "Genel Bakış", to: "/dashboard" },
        { label: "Rakipler", to: "/dashboard/competitors" },
        { label: "Görünürlük Karşılaştırması" },
      ]}
      primaryAction={{ label: "Rakipler Özetine Dön", to: "/dashboard/competitors" }}
    />
  ),
});
