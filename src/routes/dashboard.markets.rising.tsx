import { createFileRoute } from "@tanstack/react-router";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export const Route = createFileRoute("/dashboard/markets/rising")({
  head: () => ({
    meta: [
      { title: "Pazarlar · Yükselen Pazarlar — Sonar Dashboard" },
      { name: "description", content: "Son dönemde ivme kazanan pazarlar ve olası nedenler." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <FeaturePlaceholder
      eyebrow="PAZAR ZEKÂSI · YÜKSELEN PAZARLAR"
      title="Yükselen Pazarlar"
      description="Son dönemde ivme kazanan pazarlar ve olası nedenler."
      bullets={[
        "Trend eğilimi ve büyüme hızı",
        "Anahtar kelime hacmi değişimi",
        "Rakip yoğunluğu değişimi",
        "Girme önceliği önerisi",
      ]}
      breadcrumb={[
        { label: "Genel Bakış", to: "/dashboard" },
        { label: "Pazarlar", to: "/dashboard/markets" },
        { label: "Yükselen Pazarlar" },
      ]}
      primaryAction={{ label: "Pazarlar Özetine Dön", to: "/dashboard/markets" }}
    />
  ),
});
