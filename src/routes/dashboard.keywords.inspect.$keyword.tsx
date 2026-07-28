import { createFileRoute } from "@tanstack/react-router";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export const Route = createFileRoute("/dashboard/keywords/inspect/$keyword")({
  head: () => ({
    meta: [
      { title: "Anahtar Kelime İncelemesi — Sonar Dashboard" },
      { name: "description", content: "Seçilen anahtar kelimenin derinlemesine analizi." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InspectKeyword,
});

function InspectKeyword() {
  const { keyword } = Route.useParams();
  const readable = decodeURIComponent(keyword).replace(/-/g, " ");
  return (
    <FeaturePlaceholder
      eyebrow="ANAHTAR KELİME İNCELEMESİ"
      title={`"${readable}" Detaylı Analizi`}
      description="Bu inceleyici; sıralama geçmişi, SERP kompozisyonu, mağaza kapsamı ve rakip başlık kullanımını tek sayfada birleştirir."
      bullets={[
        "Uzun dönem sıralama geçmişi ve olay çakıştırma",
        "SERP kompozisyonu: rakipler, başlık eşleşmesi ve güç skorları",
        "Mağaza metadata kapsamı ve öneri aksiyonları",
        "Yapay zekâ destekli karar özeti",
      ]}
      primaryAction={{ label: "Takip Edilenlere Dön", to: "/dashboard/keywords/tracked" }}
    />
  );
}
