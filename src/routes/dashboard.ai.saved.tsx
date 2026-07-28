import { createFileRoute } from "@tanstack/react-router";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export const Route = createFileRoute("/dashboard/ai/saved")({
  head: () => ({
    meta: [
      { title: "Yapay Zekâ İçgörüleri · Kayıtlı İçgörüler — Sonar Dashboard" },
      {
        name: "description",
        content: "Daha sonra incelemek üzere kaydettiğiniz yapay zekâ önerileri.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <FeaturePlaceholder
      eyebrow="YAPAY ZEKÂ İÇGÖRÜLERİ · KAYITLI İÇGÖRÜLER"
      title="Kayıtlı İçgörüler"
      description="Daha sonra incelemek üzere kaydettiğiniz yapay zekâ önerileri."
      bullets={[
        "Öneri başına kaynak veri",
        "Kategori ve etiketle filtreleme",
        "Aksiyon durumu takibi",
        "Ekipte paylaşma (yaklaşan)",
      ]}
      breadcrumb={[
        { label: "Genel Bakış", to: "/dashboard" },
        { label: "Yapay Zekâ İçgörüleri", to: "/dashboard/ai" },
        { label: "Kayıtlı İçgörüler" },
      ]}
      primaryAction={{ label: "Yapay Zekâ İçgörüleri Özetine Dön", to: "/dashboard/ai" }}
    />
  ),
});
