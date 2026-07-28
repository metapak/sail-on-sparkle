import { createFileRoute } from "@tanstack/react-router";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export const Route = createFileRoute("/dashboard/competitors/apps")({
  head: () => ({
    meta: [
      { title: "Rakipler · Rakiplerim — Sonar Dashboard" },
      {
        name: "description",
        content: "Takip ettiğiniz rakip uygulamaların listesi ve genel gücü.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <FeaturePlaceholder
      eyebrow="RAKİP ZEKÂSI · RAKİPLERİM"
      title="Rakiplerim"
      description="Takip ettiğiniz rakip uygulamaların listesi ve genel gücü."
      bullets={[
        "Rakip ekleme ve gruplama",
        "Uygulama başına genel görünürlük skoru",
        "Kategori ve pazar bazlı karşılaştırma",
        "Takibe alma / çıkarma",
      ]}
      breadcrumb={[
        { label: "Genel Bakış", to: "/dashboard" },
        { label: "Rakipler", to: "/dashboard/competitors" },
        { label: "Rakiplerim" },
      ]}
      primaryAction={{ label: "Rakipler Özetine Dön", to: "/dashboard/competitors" }}
    />
  ),
});
