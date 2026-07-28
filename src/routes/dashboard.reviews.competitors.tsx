import { createFileRoute } from "@tanstack/react-router";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export const Route = createFileRoute("/dashboard/reviews/competitors")({
  head: () => ({
    meta: [
      { title: "Yorum Analizi · Rakip Yorumları — Sonar Dashboard" },
      { name: "description", content: "Rakip yorumlarındaki fırsat ve risk sinyalleri." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <FeaturePlaceholder
      eyebrow="YORUM ZEKÂSI · RAKİP YORUMLARI"
      title="Rakip Yorumları"
      description="Rakip yorumlarındaki fırsat ve risk sinyalleri."
      bullets={[
        "Rakip başına duygu dağılımı",
        "Sık şikayet edilen konular",
        "Rakip özelliklerinden çıkarımlar",
        "Yorum bazlı fırsat notları",
      ]}
      breadcrumb={[
        { label: "Genel Bakış", to: "/dashboard" },
        { label: "Yorum Analizi", to: "/dashboard/reviews" },
        { label: "Rakip Yorumları" },
      ]}
      primaryAction={{ label: "Yorum Analizi Özetine Dön", to: "/dashboard/reviews" }}
    />
  ),
});
