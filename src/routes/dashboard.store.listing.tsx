import { createFileRoute } from "@tanstack/react-router";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export const Route = createFileRoute("/dashboard/store/listing")({
  head: () => ({
    meta: [
      { title: "Mağaza Çalışma Alanı · Mağaza Bilgileri — Sonar Dashboard" },
      {
        name: "description",
        content: "Uygulama adı, alt başlık, anahtar kelime alanı ve açıklama yönetimi.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <FeaturePlaceholder
      eyebrow="MAĞAZA ÇALIŞMA ALANI · MAĞAZA BİLGİLERİ"
      title="Mağaza Bilgileri"
      description="Uygulama adı, alt başlık, anahtar kelime alanı ve açıklama yönetimi."
      bullets={[
        "Alan bazlı düzenleme ve karakter takibi",
        "Anahtar kelime kapsamı geri bildirimi",
        "Sürüm karşılaştırması",
        "Değişiklik önizlemesi",
      ]}
      breadcrumb={[
        { label: "Genel Bakış", to: "/dashboard" },
        { label: "Mağaza Çalışma Alanı", to: "/dashboard/store" },
        { label: "Mağaza Bilgileri" },
      ]}
      primaryAction={{ label: "Mağaza Çalışma Alanı Özetine Dön", to: "/dashboard/store" }}
    />
  ),
});
