import { createFileRoute } from "@tanstack/react-router";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export const Route = createFileRoute("/dashboard/keywords/competitors")({
  head: () => ({
    meta: [
      { title: "Anahtar Kelime · Rakip Analizi — Sonar Dashboard" },
      {
        name: "description",
        content: "Ortak ve boşluk anahtar kelimeler ile rakiplerin sıralama gücünü karşılaştırın.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <FeaturePlaceholder
      eyebrow="ANAHTAR KELİME · RAKİP ANALİZİ"
      title="Rakip Analizi"
      description="Rakiplerinizin sıralandığı anahtar kelimeleri, ortak alanları ve boşlukları tek görünümde inceleyin."
      bullets={[
        "Ortak sıralanan anahtar kelimeler ve boşluk kelimeler",
        "Rakip başına en güçlü anahtar kelime kümeleri",
        "Anahtar kelime bazında sıralama farkı ve trend",
        "Rakiplerin son dönem sıralama hareketleri",
      ]}
      breadcrumb={[
        { label: "Genel Bakış", to: "/dashboard" },
        { label: "Anahtar Kelimeler", to: "/dashboard/keywords" },
        { label: "Rakip Analizi" },
      ]}
      primaryAction={{ label: "Özete Dön", to: "/dashboard/keywords" }}
    />
  ),
});
