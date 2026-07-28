import { createFileRoute } from "@tanstack/react-router";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export const Route = createFileRoute("/dashboard/reviews/requests")({
  head: () => ({
    meta: [
      { title: "Yorum Analizi · Özellik Talepleri — Sonar Dashboard" },
      {
        name: "description",
        content: "Kullanıcıların ekleyin/düzeltin dediği özelliklerin sıklığı ve önceliği.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <FeaturePlaceholder
      eyebrow="YORUM ZEKÂSI · ÖZELLİK TALEPLERİ"
      title="Özellik Talepleri"
      description="Kullanıcıların ekleyin/düzeltin dediği özelliklerin sıklığı ve önceliği."
      bullets={[
        "Talep kümeleri ve frekansı",
        "Puan etkisi ve öncelik önerisi",
        "Rakip özellik referansları",
        "Ürün kuyruğuna kaydetme (yaklaşan)",
      ]}
      breadcrumb={[
        { label: "Genel Bakış", to: "/dashboard" },
        { label: "Yorum Analizi", to: "/dashboard/reviews" },
        { label: "Özellik Talepleri" },
      ]}
      primaryAction={{ label: "Yorum Analizi Özetine Dön", to: "/dashboard/reviews" }}
    />
  ),
});
