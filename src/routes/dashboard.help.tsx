import { createFileRoute } from "@tanstack/react-router";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export const Route = createFileRoute("/dashboard/help")({
  head: () => ({
    meta: [
      { title: "Yardım — Sonar Dashboard" },
      {
        name: "description",
        content: "Sonar'ı en verimli şekilde kullanmanız için rehberler ve destek.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <FeaturePlaceholder
      eyebrow="YARDIM"
      title="Yardım"
      description="Sonar'ı en verimli şekilde kullanmanız için rehberler ve destek."
      bullets={[
        "Başlangıç rehberi",
        "Sık sorulan sorular",
        "Video anlatımlar",
        "Destek ekibiyle iletişim",
      ]}
      breadcrumb={[{ label: "Genel Bakış", to: "/dashboard" }, { label: "Yardım" }]}
      primaryAction={{ label: "Genel Bakışa Dön", to: "/dashboard" }}
    />
  ),
});
