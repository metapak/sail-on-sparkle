import { createFileRoute } from "@tanstack/react-router";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export const Route = createFileRoute("/dashboard/keywords/movements")({
  head: () => ({
    meta: [
      { title: "Yeni ve Kaybedilen Anahtar Kelimeler — Sonar Dashboard" },
      {
        name: "description",
        content: "Son dönemde ilk 200'e giren ve çıkan anahtar kelimeleri izleyin.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <FeaturePlaceholder
      eyebrow="ANAHTAR KELİME HAREKETLERİ"
      title="Yeni ve Kaybedilenler"
      description="Son dönemde ilk 200'e giren ve çıkan anahtar kelimeleri, sıralama sıçramalarını ve kayıplarını inceleyin."
      bullets={[
        "İlk 200'e yeni giren anahtar kelimeler",
        "İlk 200 dışına çıkan anahtar kelimeler",
        "En büyük sıralama sıçraması ve kaybı",
        "Değişimlerin olası mağaza ve rakip nedenleri",
      ]}
      breadcrumb={[
        { label: "Genel Bakış", to: "/dashboard" },
        { label: "Anahtar Kelimeler", to: "/dashboard/keywords" },
        { label: "Yeni ve Kaybedilenler" },
      ]}
      primaryAction={{ label: "Özete Dön", to: "/dashboard/keywords" }}
    />
  ),
});
