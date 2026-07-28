import { createFileRoute } from "@tanstack/react-router";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export const Route = createFileRoute("/dashboard/markets/opportunities")({
  head: () => ({
    meta: [
      { title: "Pazarlar · Ülke Fırsatları — Sonar Dashboard" },
      {
        name: "description",
        content: "Ülke bazlı büyüme fırsatlarını ve öncelik skorlarını inceleyin.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <FeaturePlaceholder
      eyebrow="PAZAR ZEKÂSI · ÜLKE FIRSATLARI"
      title="Ülke Fırsatları"
      description="Ülke bazlı büyüme fırsatlarını ve öncelik skorlarını inceleyin."
      bullets={[
        "Ülke başına fırsat skoru",
        "Talep vs. rekabet dağılımı",
        "Öncelikli lokalizasyon önerileri",
        "Fırsat kategorileri",
      ]}
      breadcrumb={[
        { label: "Genel Bakış", to: "/dashboard" },
        { label: "Pazarlar", to: "/dashboard/markets" },
        { label: "Ülke Fırsatları" },
      ]}
      primaryAction={{ label: "Pazarlar Özetine Dön", to: "/dashboard/markets" }}
    />
  ),
});
