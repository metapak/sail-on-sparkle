import { createFileRoute } from "@tanstack/react-router";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export const Route = createFileRoute("/dashboard/store/publishing")({
  head: () => ({
    meta: [
      { title: "Mağaza Çalışma Alanı · Yayınlama — Sonar Dashboard" },
      { name: "description", content: "Değişikliklerin gönderim ve inceleme akışı." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <FeaturePlaceholder
      eyebrow="MAĞAZA ÇALIŞMA ALANI · YAYINLAMA"
      title="Yayınlama"
      description="Değişikliklerin gönderim ve inceleme akışı."
      bullets={[
        "Gönderim öncesi kontrol listesi",
        "İnceleme durumu takibi",
        "Sürüm notları",
        "Yayınlama geçmişi",
      ]}
      breadcrumb={[
        { label: "Genel Bakış", to: "/dashboard" },
        { label: "Mağaza Çalışma Alanı", to: "/dashboard/store" },
        { label: "Yayınlama" },
      ]}
      primaryAction={{ label: "Mağaza Çalışma Alanı Özetine Dön", to: "/dashboard/store" }}
    />
  ),
});
