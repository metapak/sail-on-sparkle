import { createFileRoute } from "@tanstack/react-router";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export const Route = createFileRoute("/dashboard/creative/")({
  head: () => ({
    meta: [
      { title: "Kreatif Analizi · Özet — Sonar Dashboard" },
      {
        name: "description",
        content:
          "Kreatif değişikliklerini, önce-sonra karşılaştırmalarını ve rakip kreatiflerini izleyin.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <FeaturePlaceholder
      eyebrow="KREATİF ZEKÂSI"
      title="Kreatif Analizi"
      description="Kreatif değişikliklerini, önce-sonra karşılaştırmalarını ve rakip kreatiflerini izleyin."
      bullets={[
        "Kreatif Analizi modülüne ait tüm sayfalara buradan ulaşın.",
        "Modül başına ana metrikler ve giriş noktaları",
        "İlgili çalışma alanına hızlı geçişler",
        "Ekipte paylaşılabilir özet (yaklaşan)",
      ]}
      breadcrumb={[
        { label: "Genel Bakış", to: "/dashboard" },
        { label: "Kreatif Analizi" },
        { label: "Özet" },
      ]}
      primaryAction={{ label: "Genel Bakışa Dön", to: "/dashboard" }}
    />
  ),
});
