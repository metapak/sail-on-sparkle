import { createFileRoute } from "@tanstack/react-router";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export const Route = createFileRoute("/dashboard/reviews/sentiment")({
  head: () => ({
    meta: [
      { title: "Yorum Analizi · Duygu ve Konular — Sonar Dashboard" },
      { name: "description", content: "Yorumlardaki duygu dağılımı ve öne çıkan konular." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <FeaturePlaceholder
      eyebrow="YORUM ZEKÂSI · DUYGU VE KONULAR"
      title="Duygu ve Konular"
      description="Yorumlardaki duygu dağılımı ve öne çıkan konular."
      bullets={[
        "Duygu skoru eğilimi",
        "Konu kümeleri ve büyüklükleri",
        "Ülke ve sürüm bazlı kırılım",
        "Kritik konuların hızlı özeti",
      ]}
      breadcrumb={[
        { label: "Genel Bakış", to: "/dashboard" },
        { label: "Yorum Analizi", to: "/dashboard/reviews" },
        { label: "Duygu ve Konular" },
      ]}
      primaryAction={{ label: "Yorum Analizi Özetine Dön", to: "/dashboard/reviews" }}
    />
  ),
});
