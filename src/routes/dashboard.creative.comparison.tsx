import { createFileRoute } from "@tanstack/react-router";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export const Route = createFileRoute("/dashboard/creative/comparison")({
  head: () => ({
    meta: [
      { title: "Kreatif Analizi · Önce ve Sonra — Sonar Dashboard" },
      {
        name: "description",
        content: "Aynı slotun önceki ve güncel versiyonlarını yan yana karşılaştırın.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <FeaturePlaceholder
      eyebrow="KREATİF ZEKÂSI · ÖNCE VE SONRA"
      title="Önce ve Sonra"
      description="Aynı slotun önceki ve güncel versiyonlarını yan yana karşılaştırın."
      bullets={[
        "Slot bazlı önce–sonra görünüm",
        "Yükseltme notları",
        "Performans karşılaştırması (yaklaşan)",
        "Kayıt ve dışa aktarım",
      ]}
      breadcrumb={[
        { label: "Genel Bakış", to: "/dashboard" },
        { label: "Kreatif Analizi", to: "/dashboard/creative" },
        { label: "Önce ve Sonra" },
      ]}
      primaryAction={{ label: "Kreatif Analizi Özetine Dön", to: "/dashboard/creative" }}
    />
  ),
});
