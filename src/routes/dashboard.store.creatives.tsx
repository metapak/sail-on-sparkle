import { createFileRoute } from "@tanstack/react-router";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export const Route = createFileRoute("/dashboard/store/creatives")({
  head: () => ({
    meta: [
      { title: "Mağaza Çalışma Alanı · Kreatifler — Sonar Dashboard" },
      {
        name: "description",
        content: "Ekran görüntüleri, tanıtım videosu ve app önizleme yönetimi.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <FeaturePlaceholder
      eyebrow="MAĞAZA ÇALIŞMA ALANI · KREATİFLER"
      title="Kreatifler"
      description="Ekran görüntüleri, tanıtım videosu ve app önizleme yönetimi."
      bullets={[
        "Slot bazlı yükleme ve önizleme",
        "Cihaz ve mağaza formatı doğrulama",
        "Sürüm ve dil bazlı görünürlük",
        "Kreatif etiketleme",
      ]}
      breadcrumb={[
        { label: "Genel Bakış", to: "/dashboard" },
        { label: "Mağaza Çalışma Alanı", to: "/dashboard/store" },
        { label: "Kreatifler" },
      ]}
      primaryAction={{ label: "Mağaza Çalışma Alanı Özetine Dön", to: "/dashboard/store" }}
    />
  ),
});
