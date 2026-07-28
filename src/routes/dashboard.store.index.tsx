import { createFileRoute } from "@tanstack/react-router";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export const Route = createFileRoute("/dashboard/store/")({
  head: () => ({
    meta: [
      { title: "Mağaza Çalışma Alanı · Özet — Sonar Dashboard" },
      {
        name: "description",
        content:
          "Mağaza bilgileri, kreatifler, lokalizasyon ve yayınlama akışlarını tek yerden yönetin.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <FeaturePlaceholder
      eyebrow="MAĞAZA ÇALIŞMA ALANI"
      title="Mağaza Çalışma Alanı"
      description="Mağaza bilgileri, kreatifler, lokalizasyon ve yayınlama akışlarını tek yerden yönetin."
      bullets={[
        "Mağaza Çalışma Alanı modülüne ait tüm sayfalara buradan ulaşın.",
        "Modül başına ana metrikler ve giriş noktaları",
        "İlgili çalışma alanına hızlı geçişler",
        "Ekipte paylaşılabilir özet (yaklaşan)",
      ]}
      breadcrumb={[
        { label: "Genel Bakış", to: "/dashboard" },
        { label: "Mağaza Çalışma Alanı" },
        { label: "Özet" },
      ]}
      primaryAction={{ label: "Genel Bakışa Dön", to: "/dashboard" }}
    />
  ),
});
