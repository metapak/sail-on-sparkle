import { createFileRoute } from "@tanstack/react-router";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export const Route = createFileRoute("/dashboard/creative/competitors")({
  head: () => ({
    meta: [
      { title: "Kreatif Analizi · Rakip Kreatifleri — Sonar Dashboard" },
      {
        name: "description",
        content: "Rakiplerin ekran görüntüsü stratejilerini ve mesajlaşmalarını inceleyin.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <FeaturePlaceholder
      eyebrow="KREATİF ZEKÂSI · RAKİP KREATİFLERİ"
      title="Rakip Kreatifleri"
      description="Rakiplerin ekran görüntüsü stratejilerini ve mesajlaşmalarını inceleyin."
      bullets={[
        "Rakip başına kreatif galerisi",
        "Mesaj temasına göre gruplama",
        "Kategori bazlı kreatif eğilimleri",
        "Referans olarak kaydetme",
      ]}
      breadcrumb={[
        { label: "Genel Bakış", to: "/dashboard" },
        { label: "Kreatif Analizi", to: "/dashboard/creative" },
        { label: "Rakip Kreatifleri" },
      ]}
      primaryAction={{ label: "Kreatif Analizi Özetine Dön", to: "/dashboard/creative" }}
    />
  ),
});
