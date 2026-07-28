import { createFileRoute } from "@tanstack/react-router";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export const Route = createFileRoute("/dashboard/store/events")({
  head: () => ({
    meta: [
      { title: "Mağaza Çalışma Alanı · Etkinlikler — Sonar Dashboard" },
      {
        name: "description",
        content: "App Store etkinlikleri ve Google Play promosyon içerikleri.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <FeaturePlaceholder
      eyebrow="MAĞAZA ÇALIŞMA ALANI · ETKİNLİKLER"
      title="Etkinlikler"
      description="App Store etkinlikleri ve Google Play promosyon içerikleri."
      bullets={[
        "Etkinlik planlama",
        "Kreatif ve metin doğrulaması",
        "Hedef pazar seçimi",
        "Zamanlanmış yayınlama",
      ]}
      breadcrumb={[
        { label: "Genel Bakış", to: "/dashboard" },
        { label: "Mağaza Çalışma Alanı", to: "/dashboard/store" },
        { label: "Etkinlikler" },
      ]}
      primaryAction={{ label: "Mağaza Çalışma Alanı Özetine Dön", to: "/dashboard/store" }}
    />
  ),
});
