import { createFileRoute } from "@tanstack/react-router";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export const Route = createFileRoute("/dashboard/store/localization")({
  head: () => ({
    meta: [
      { title: "Mağaza Çalışma Alanı · Lokalizasyon — Sonar Dashboard" },
      { name: "description", content: "Dil ve ülke bazlı içerik varyantlarınızı yönetin." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <FeaturePlaceholder
      eyebrow="MAĞAZA ÇALIŞMA ALANI · LOKALİZASYON"
      title="Lokalizasyon"
      description="Dil ve ülke bazlı içerik varyantlarınızı yönetin."
      bullets={[
        "Dil bazlı içerik listesi",
        "Otomatik öneri (yaklaşan)",
        "Doğrulama uyarıları",
        "Yayına alma iş akışı",
      ]}
      breadcrumb={[
        { label: "Genel Bakış", to: "/dashboard" },
        { label: "Mağaza Çalışma Alanı", to: "/dashboard/store" },
        { label: "Lokalizasyon" },
      ]}
      primaryAction={{ label: "Mağaza Çalışma Alanı Özetine Dön", to: "/dashboard/store" }}
    />
  ),
});
