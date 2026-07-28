import { createFileRoute } from "@tanstack/react-router";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export const Route = createFileRoute("/dashboard/ai/")({
  head: () => ({
    meta: [
      { title: "Yapay Zekâ İçgörüleri · Bugünkü Öneriler — Sonar Dashboard" },
      {
        name: "description",
        content: "Bugünün öneri kümesini ve kayıtlı içgörüleri bir arada görün.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <FeaturePlaceholder
      eyebrow="YAPAY ZEKÂ İÇGÖRÜLERİ"
      title="Yapay Zekâ İçgörüleri"
      description="Bugünün öneri kümesini ve kayıtlı içgörüleri bir arada görün."
      bullets={[
        "Öncelikli fırsat ve risk önerileri",
        "Karar özetiyle bağlantılı sinyaller",
        "Öneriyi kaydetme veya yok sayma",
        "Kaynak veri kırılımı",
      ]}
      breadcrumb={[
        { label: "Genel Bakış", to: "/dashboard" },
        { label: "Yapay Zekâ İçgörüleri" },
        { label: "Bugünkü Öneriler" },
      ]}
      primaryAction={{ label: "Genel Bakışa Dön", to: "/dashboard" }}
    />
  ),
});
