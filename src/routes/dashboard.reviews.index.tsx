import { createFileRoute } from "@tanstack/react-router";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export const Route = createFileRoute("/dashboard/reviews/")({
  head: () => ({
    meta: [
      { title: "Yorum Analizi · Özet — Sonar Dashboard" },
      {
        name: "description",
        content: "Kullanıcı yorumlarındaki duygu, konu ve özellik talebi sinyallerini takip edin.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <FeaturePlaceholder
      eyebrow="YORUM ZEKÂSI"
      title="Yorum Analizi"
      description="Kullanıcı yorumlarındaki duygu, konu ve özellik talebi sinyallerini takip edin."
      bullets={[
        "Yorum Analizi modülüne ait tüm sayfalara buradan ulaşın.",
        "Modül başına ana metrikler ve giriş noktaları",
        "İlgili çalışma alanına hızlı geçişler",
        "Ekipte paylaşılabilir özet (yaklaşan)",
      ]}
      breadcrumb={[
        { label: "Genel Bakış", to: "/dashboard" },
        { label: "Yorum Analizi" },
        { label: "Özet" },
      ]}
      primaryAction={{ label: "Genel Bakışa Dön", to: "/dashboard" }}
    />
  ),
});
