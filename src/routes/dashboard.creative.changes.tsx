import { createFileRoute } from "@tanstack/react-router";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export const Route = createFileRoute("/dashboard/creative/changes")({
  head: () => ({
    meta: [
      { title: "Kreatif Analizi · Kreatif Değişiklikleri — Sonar Dashboard" },
      { name: "description", content: "Sizin ve rakiplerin son kreatif güncellemeleri." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <FeaturePlaceholder
      eyebrow="KREATİF ZEKÂSI · KREATİF DEĞİŞİKLİKLERİ"
      title="Kreatif Değişiklikleri"
      description="Sizin ve rakiplerin son kreatif güncellemeleri."
      bullets={[
        "Ekran görüntüsü ve tanıtım videosu değişiklikleri",
        "Değişiklik tarihi ve etki karşılaştırması",
        "Değişiklik olay çakıştırma",
        "Kreatif etiketleme",
      ]}
      breadcrumb={[
        { label: "Genel Bakış", to: "/dashboard" },
        { label: "Kreatif Analizi", to: "/dashboard/creative" },
        { label: "Kreatif Değişiklikleri" },
      ]}
      primaryAction={{ label: "Kreatif Analizi Özetine Dön", to: "/dashboard/creative" }}
    />
  ),
});
